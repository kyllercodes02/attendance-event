<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\UserQrCodeEmailService;
use Illuminate\Http\RedirectResponse;

class UserQrCodeEmailController extends Controller
{
    public function store(User $user, UserQrCodeEmailService $userQrCodeEmailService): RedirectResponse
    {
        abort_unless(
            User::query()->attendees()->whereKey($user->getKey())->exists(),
            404
        );

        $emailSent = $userQrCodeEmailService->send($user);

        return redirect()
            ->route('users.show', $user)
            ->with($emailSent ? 'success' : 'error', $emailSent
                ? 'QR code email resent successfully.'
                : 'The QR code email could not be resent.');
    }
}
