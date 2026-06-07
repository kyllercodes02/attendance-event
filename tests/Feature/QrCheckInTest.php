<?php

namespace Tests\Feature;

use App\Models\AttendanceRecord;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class QrCheckInTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_view_the_qr_check_in_page(): void
    {
        $this->withoutVite();

        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('qr-check-in.index'));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('QrCheckIn/Index')
            ->where('scannerStatus.label', 'System ready')
            ->where('verificationEndpoint', route('qr-check-in.verify'))
            ->etc()
        );
    }

    public function test_authenticated_user_can_verify_a_valid_qr_token(): void
    {
        $staff = User::factory()->create();
        $attendee = User::factory()->create([
            'name' => 'Jane Attendee',
            'email' => 'jane@example.com',
            'attendee_type' => 'Guest',
            'organization' => 'OpenAI Events',
            'position_title' => 'Visitor',
            'photo_path' => 'attendees/photos/jane.jpg',
            'qr_token' => str_repeat('a', 64),
            'password' => null,
        ]);

        $response = $this->actingAs($staff)->postJson(route('qr-check-in.verify'), [
            'qr_token' => $attendee->qr_token,
        ]);

        $response->assertOk();
        $response->assertJsonPath('message', 'QR code verified and attendee checked in successfully.');
        $response->assertJsonPath('check_in_status', 'checked_in');
        $response->assertJsonPath('attendee.name', 'Jane Attendee');
        $response->assertJsonPath('attendee.email', 'jane@example.com');
        $response->assertJsonPath('attendee.attendee_type', 'Guest');
        $response->assertJsonPath('attendee.organization', 'OpenAI Events');
        $response->assertJsonPath('attendee.position_title', 'Visitor');
        $response->assertJsonPath('attendee.verification_status', 'verified');
        $response->assertJsonMissingPath('attendee.qr_token');
        $response->assertJsonMissingPath('attendee.password');

        $this->assertDatabaseHas('attendance_records', [
            'user_id' => $attendee->id,
            'verification_status' => 'verified',
        ]);
        $this->assertSame(1, AttendanceRecord::query()->where('user_id', $attendee->id)->count());
    }

    public function test_scanning_the_same_valid_qr_token_again_returns_existing_check_in_information(): void
    {
        $staff = User::factory()->create();
        $attendee = User::factory()->create([
            'qr_token' => str_repeat('b', 64),
            'password' => null,
        ]);

        $attendanceRecord = AttendanceRecord::query()->create([
            'user_id' => $attendee->id,
            'checked_in_at' => now()->subMinutes(5),
            'verification_status' => 'verified',
        ]);

        $response = $this->actingAs($staff)->postJson(route('qr-check-in.verify'), [
            'qr_token' => $attendee->qr_token,
        ]);

        $response->assertOk();
        $response->assertJsonPath('message', 'This attendee has already been checked in.');
        $response->assertJsonPath('check_in_status', 'already_checked_in');
        $response->assertJsonPath('attendee.verification_status', 'verified');
        $response->assertJsonPath('attendee.checked_in_at', $attendanceRecord->checked_in_at?->toIso8601String());

        $this->assertSame(1, AttendanceRecord::query()->where('user_id', $attendee->id)->count());
    }

    public function test_authenticated_user_receives_a_clear_error_for_an_invalid_qr_token(): void
    {
        $staff = User::factory()->create();

        $response = $this->actingAs($staff)->postJson(route('qr-check-in.verify'), [
            'qr_token' => 'invalid-token',
        ]);

        $response->assertNotFound();
        $response->assertJson([
            'message' => 'The scanned QR code is not registered to a valid attendee.',
            'errors' => [
                'qr_token' => ['The scanned QR code is invalid.'],
            ],
        ]);
    }

    public function test_qr_token_is_required_for_verification(): void
    {
        $staff = User::factory()->create();

        $response = $this->actingAs($staff)->postJson(route('qr-check-in.verify'), []);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors('qr_token');
        $response->assertJsonPath('errors.qr_token.0', 'No QR code data was detected. Please scan the attendee QR code again.');
    }
}
