<?php

namespace Tests\Feature;

use App\Mail\UserQrCodeMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class UserQrCodeEmailControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_administrator_can_resend_an_attendee_qr_code_email(): void
    {
        Mail::fake();

        $admin = User::factory()->create([
            'email' => 'admin@example.com',
            'qr_token' => null,
        ]);

        $attendee = User::factory()->create([
            'email' => 'attendee@example.com',
            'qr_token' => str_repeat('a', 64),
            'qr_code_image_path' => 'qrcodes/user-2.png',
            'email_sent_at' => null,
        ]);

        $response = $this->actingAs($admin)->post(route('users.qr-email.store', $attendee));

        $response
            ->assertRedirect(route('users.show', $attendee))
            ->assertSessionHas('success', 'QR code email resent successfully.');

        $this->assertNotNull($attendee->fresh()->email_sent_at);
        Mail::assertSent(UserQrCodeMail::class, fn (UserQrCodeMail $mail) => $mail->user->is($attendee));
    }

    public function test_resend_qr_email_returns_not_found_for_non_attendee_users(): void
    {
        Mail::fake();

        $admin = User::factory()->create([
            'email' => 'admin@example.com',
            'qr_token' => null,
        ]);

        $nonAttendee = User::factory()->create([
            'qr_token' => null,
            'password' => 'password',
        ]);

        $response = $this->actingAs($admin)->post(route('users.qr-email.store', $nonAttendee));

        $response->assertNotFound();
        Mail::assertNothingSent();
    }
}
