<?php

namespace DuncrowGmbh\CaptchaEu\ContaoManager;

use Contao\ManagerPlugin\Bundle\Config\BundleConfig;
use Contao\ManagerPlugin\Bundle\BundlePluginInterface;
use Contao\ManagerPlugin\Bundle\Parser\ParserInterface;
use Contao\ManagerPlugin\Routing\RoutingPluginInterface;
use DuncrowGmbh\CaptchaEu\DuncrowGmbhCaptchaEuBundle;
use Symfony\Component\Config\Loader\LoaderResolverInterface;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Routing\RouteCollection;

class Plugin implements BundlePluginInterface, RoutingPluginInterface
{
    /**
     * {@inheritdoc}
     */
    public function getBundles(ParserInterface $parser)
    {
        return [
            BundleConfig::create(DuncrowGmbhCaptchaEuBundle::class)
                ->setLoadAfter(
                    [
                        \Symfony\Bundle\TwigBundle\TwigBundle::class,
                        \Contao\CoreBundle\ContaoCoreBundle::class,
                        \Contao\ManagerBundle\ContaoManagerBundle::class,
                    ]
                ),
        ];
    }

    public function getRouteCollection(LoaderResolverInterface $resolver, KernelInterface $kernel): ?RouteCollection
    {
        return $resolver
            ->resolve(__DIR__ . '/../../config/routes.yaml')
            ->load(__DIR__ . '/../../config/routes.yaml')
        ;
    }
}
