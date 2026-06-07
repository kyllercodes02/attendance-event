<?php

namespace Tests\Feature;

use App\Services\QrCodeService;
use App\Models\User;
use Exception;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UserCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_administrator_can_create_an_attendee(): void
    {
        $this->withoutVite();
        Storage::fake('public');
        Mail::fake();

        $admin = User::factory()->create([
            'email' => 'admin@example.com',
            'qr_token' => null,
        ]);

        $response = $this->actingAs($admin)->post('/users', [
            'name' => 'Jane Attendee',
            'email' => 'jane@example.com',
            'attendee_type' => 'Guest',
            'organization' => 'OpenAI Events',
            'position_title' => 'Visitor',
            'photo' => UploadedFile::fake()->image('attendee.jpg'),
        ]);

        $response->assertRedirect(route('users.index'));

        $this->assertDatabaseHas('users', [
            'name' => 'Jane Attendee',
            'email' => 'jane@example.com',
            'attendee_type' => 'Guest',
            'organization' => 'OpenAI Events',
            'position_title' => 'Visitor',
            'password' => null,
        ]);

        $attendee = User::query()->where('email', 'jane@example.com')->firstOrFail();

        $this->assertNotNull($attendee->qr_token);
        $this->assertSame(64, strlen($attendee->qr_token));
        $this->assertSame('qrcodes/user-'.$attendee->id.'.png', $attendee->qr_code_image_path);
        $this->assertNotNull($attendee->email_sent_at);
        Storage::disk('public')->assertExists($attendee->photo_path);
        Storage::disk('public')->assertExists($attendee->qr_code_image_path);
        Mail::assertSent(\App\Mail\UserQrCodeMail::class, fn ($mail) => $mail->user->is($attendee));
    }

    public function test_email_must_be_unique_when_creating_an_attendee(): void
    {
        $this->withoutVite();
        Mail::fake();

        $admin = User::factory()->create([
            'email' => 'admin@example.com',
            'qr_token' => null,
        ]);

        User::factory()->create([
            'email' => 'existing@example.com',
        ]);

        $response = $this->actingAs($admin)
            ->from(route('users.create'))
            ->post('/users', [
                'name' => 'Duplicate User',
                'email' => 'existing@example.com',
            ]);

        $response->assertRedirect(route('users.create'));
        $response->assertSessionHasErrors('email');
        $response->assertSessionHasErrors([
            'email' => 'That email address is already registered to another attendee.',
        ]);
    }

    public function test_attendee_creation_continues_when_qr_email_sending_fails(): void
    {
        $this->withoutVite();
        Storage::fake('public');

        Mail::shouldReceive('to')
            ->once()
            ->andReturnSelf();
        Mail::shouldReceive('send')
            ->once()
            ->andThrow(new Exception('SMTP unavailable'));

        $admin = User::factory()->create([
            'email' => 'admin@example.com',
            'qr_token' => null,
        ]);

        $response = $this->actingAs($admin)->post('/users', [
            'name' => 'Email Failure User',
            'email' => 'failure@example.com',
        ]);

        $response->assertRedirect(route('users.index'));
        $response->assertSessionHas('warning');

        $attendee = User::query()->where('email', 'failure@example.com')->firstOrFail();

        $this->assertNotNull($attendee->qr_token);
        $this->assertNotNull($attendee->qr_code_image_path);
        $this->assertNull($attendee->email_sent_at);
        Storage::disk('public')->assertExists($attendee->qr_code_image_path);
    }

    public function test_attendee_creation_returns_a_friendly_error_when_qr_generation_fails(): void
    {
        $this->withoutVite();
        Storage::fake('public');
        Mail::fake();

        $admin = User::factory()->create([
            'email' => 'admin@example.com',
            'qr_token' => null,
        ]);

        $qrCodeService = $this->mock(QrCodeService::class);
        $qrCodeService->shouldReceive('generateForUser')
            ->once()
            ->andThrow(new Exception('QR generation failed'));

        $response = $this->actingAs($admin)
            ->from(route('users.create'))
            ->post('/users', [
                'name' => 'Broken QR User',
                'email' => 'broken@example.com',
                'photo' => UploadedFile::fake()->image('broken.jpg'),
            ]);

        $response->assertRedirect(route('users.create'));
        $response->assertSessionHas('error', 'The attendee could not be saved because the QR code could not be prepared. Please try again.');

        $this->assertDatabaseMissing('users', [
            'email' => 'broken@example.com',
        ]);

        Storage::disk('public')->assertMissing('attendees/photos/broken.jpg');
        Mail::assertNothingSent();
    }
}
