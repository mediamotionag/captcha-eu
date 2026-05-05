<?php

namespace DuncrowGmbh\CaptchaEu\Controller;

use Contao\PageModel;
use Contao\System;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class CaptchaEuController
{
    #[Route('/_contao/captcha-eu/{_locale}', name: 'duncrow_captcha_eu_frontend', defaults: ['_scope' => 'frontend'])]
    public function __invoke(Request $request): Response
    {
        if (!$request->isXmlHttpRequest()) {
            return $this->createJsonResponse([], Response::HTTP_BAD_REQUEST);
        }

        $rootPageId = (int) $request->query->get('root', 0);
        $widget = $request->query->get('widget', 'invisible');

        if ($rootPageId < 1 || !\in_array($widget, ['invisible', 'widget'], true)) {
            return $this->createJsonResponse([], Response::HTTP_BAD_REQUEST);
        }

        System::getContainer()->get('contao.framework')->initialize();

        $rootPage = PageModel::findByPk($rootPageId);

        if (null === $rootPage || !$rootPage->captchaEuPublicKey) {
            return $this->createJsonResponse([], Response::HTTP_NOT_FOUND);
        }

        return $this->createJsonResponse([
            'publicKey' => $rootPage->captchaEuPublicKey,
            'theme' => 'clean',
            'widget' => $widget,
        ]);
    }

    private function createJsonResponse(array $data, int $status = Response::HTTP_OK): JsonResponse
    {
        $response = new JsonResponse($data, $status);
        $response->headers->set('Cache-Control', 'no-cache, no-store');
        $response->setVary('X-Requested-With');

        return $response;
    }
}
