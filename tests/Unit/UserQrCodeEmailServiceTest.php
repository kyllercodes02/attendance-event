<?php

namespace Tests\Unit;

use App\Mail\UserQrCodeMail;
use App\Models\User;
use App\Services\UserQrCodeEmailService;
use Exception;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class UserQrCodeEmailServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_updates_the_sent_timestamp_after_sending(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'qr_token' => str_repeat('a', 64),
            'qr_code_image_path' => 'qrcodes/user-1.png',
            'email_sent_at' => null,
        ]);

        $result = app(UserQrCodeEmailService::class)->send($user);

        $this->assertTrue($result);
        $this->assertNotNull($user->fresh()->email_sent_at);
        Mail::assertSent(UserQrCodeMail::class, fn ($mail) => $mail->user->is($user));
    }

    public function test_it_returns_false_when_email_sending_fails(): void
    {
        Mail::shouldReceive('to')
            ->once()
            ->andReturnSelf();
        Mail::shouldReceive('send')
            ->once()
            ->andThrow(new Exception('Mail failure'));

        $user = User::factory()->create([
            'qr_token' => str_repeat('b', 64),
            'qr_code_image_path' => 'qrcodes/user-1.png',
            'email_sent_at' => null,
        ]);

        $result = app(UserQrCodeEmailService::class)->send($user);

        $this->assertFalse($result);
        $this->assertNull($user->fresh()->email_sent_at);
    }
}
