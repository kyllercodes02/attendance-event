<?php

namespace App\Services;

use App\Mail\UserQrCodeMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Throwable;

class UserQrCodeEmailService
{
    public function __construct(
        protected QrCodeService $qrCodeService
    ) {
    }

    public function send(User $user): bool
    {
        try {
            if (blank($user->qr_code_image_path) || ! Storage::disk('public')->exists($user->qr_code_image_path)) {
                $user->forceFill([
                    'qr_code_image_path' => $this->qrCodeService->generateForUser($user),
                ])->save();
            }

            Mail::to($user->email)->send(new UserQrCodeMail($user));

            $user->forceFill([
                'email_sent_at' => now(),
            ])->save();

            return true;
        } catch (Throwable $throwable) {
            report($throwable);

            return false;
        }
    }
}
