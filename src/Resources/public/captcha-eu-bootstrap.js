(() => {
    const targetSelector = '.cpt_widget[data-captcha-eu-config-url]';
    const initializedKeys = new Set();
    let sdkPromise;
    let observer;

    const markError = (target) => {
        target.dataset.captchaEuError = '1';
    };

    const whenReady = (callback) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback, {
                once: true,
            });

            return;
        }

        callback();
    };

    const loadExternalScript = (src) => new Promise((resolve, reject) => {
        const script = document.createElement('script');

        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = reject;

        document.head.appendChild(script);
    });

    const loadSdk = async () => {
        if (window.KROT) {
            return window.KROT;
        }

        sdkPromise ??= loadExternalScript('https://www.captcha.eu/sdk.js').then(() => window.KROT);

        return sdkPromise;
    };

    const loadConfig = async (configUrl) => {
        const response = await fetch(configUrl, {
            cache: 'no-store',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to load Captcha.eu configuration.');
        }

        return response.json();
    };

    const initInvisibleCaptcha = (target, publicKey) => {
        if (!initializedKeys.has(publicKey)) {
            window.KROT.setup(publicKey);
            initializedKeys.add(publicKey);
        }

        const form = target.closest('form');

        if (form && form.dataset.captchaEuIntercepted !== '1') {
            window.KROT.interceptForm(form);
            form.dataset.captchaEuIntercepted = '1';
        }
    };

    const initWidgetCaptcha = () => {
        window.KROT.init();
    };

    const initCaptcha = async (target, config) => {
        if (!target || !config.publicKey || target.dataset.captchaEuBootstrapped === '1') {
            return;
        }

        target.dataset.captchaEuBootstrapped = '1';
        target.dataset.key = config.publicKey;
        target.dataset.theme = config.theme || 'clean';

        try {
            await loadSdk();

            if (!window.KROT) {
                markError(target);

                return;
            }

            if (config.widget === 'widget') {
                initWidgetCaptcha();

                return;
            }

            initInvisibleCaptcha(target, config.publicKey);
        } catch {
            markError(target);
        }
    };

    const bootstrapTarget = async (target) => {
        const configUrl = target.dataset.captchaEuConfigUrl;

        if (!configUrl || target.dataset.captchaEuBound === '1') {
            return;
        }

        target.dataset.captchaEuBound = '1';

        try {
            const config = await loadConfig(configUrl);
            await initCaptcha(target, config);
        } catch {
            markError(target);
        }
    };

    const collectTargets = (root) => {
        if (!(root instanceof Element) && root !== document) {
            return [];
        }

        const targets = [];

        if (root instanceof Element && root.matches(targetSelector)) {
            targets.push(root);
        }

        if ('querySelectorAll' in root) {
            targets.push(...root.querySelectorAll(targetSelector));
        }

        return targets;
    };

    const bootstrapTargets = (root = document) => {
        for (const target of collectTargets(root)) {
            void bootstrapTarget(target);
        }
    };

    const observeTargets = () => {
        if (observer || !document.body) {
            return;
        }

        observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node instanceof Element) {
                        bootstrapTargets(node);
                    }
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    };

    whenReady(() => {
        bootstrapTargets();
        observeTargets();
    });
})();
