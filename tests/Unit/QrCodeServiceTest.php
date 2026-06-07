<?php

namespace Tests\Unit;

use App\Models\User;
use App\Services\QrCodeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class QrCodeServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_generates_and_stores_a_qr_code_image_for_a_user(): void
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'qr_token' => str_repeat('a', 64),
            'qr_code_image_path' => null,
        ]);

        $path = app(QrCodeService::class)->generateForUser($user);

        $this->assertSame('qrcodes/user-'.$user->id.'.png', $path);
        Storage::disk('public')->assertExists($path);
        $this->assertNotEmpty(Storage::disk('public')->get($path));
    }
}
