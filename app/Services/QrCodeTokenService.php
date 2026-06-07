<?php

namespace App\Services;

use App\Models\User;

class QrCodeTokenService
{
    public function generateUniqueToken(): string
    {
        do {
            $token = $this->generateCandidateToken();
        } while ($this->tokenExists($token));

        return $token;
    }

    protected function generateCandidateToken(): string
    {
        return bin2hex(random_bytes(32));
    }

    protected function tokenExists(string $token): bool
    {
        return User::query()
            ->where('qr_token', $token)
            ->exists();
    }
}
