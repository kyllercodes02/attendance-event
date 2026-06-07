<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class QrCheckInController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('QrCheckIn/Index', [
            'scannerStatus' => [
                'label' => 'System ready',
                'description' => 'Position the attendee QR code inside the scanner area when you are ready to check them in.',
            ],
            'verificationEndpoint' => route('qr-check-in.verify'),
        ]);
    }
}
