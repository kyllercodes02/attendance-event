<?php

namespace App\Services;

use App\Models\User;
use F9WebLtd\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;

class QrCodeService
{
    public function generateForUser(User $user): string
    {
        $path = $this->pathForUser($user);
        $disk = Storage::disk('public');

        if (filled($user->qr_code_image_path) && $user->qr_code_image_path !== $path) {
            $disk->delete($user->qr_code_image_path);
        }

        $disk->put(
            $path,
            QrCode::format('png')->size(300)->margin(1)->generate($user->qr_token)
        );

        return $path;
    }

    protected function pathForUser(User $user): string
    {
        return sprintf('qrcodes/user-%d.png', $user->id);
    }
}
