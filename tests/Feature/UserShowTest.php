<?php

namespace Tests\Feature;

use App\Models\AttendanceRecord;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class UserShowTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_administrator_can_view_an_attendee_detail_page(): void
    {
        $this->withoutVite();

        $admin = User::factory()->create([
            'email' => 'admin@example.com',
            'qr_token' => null,
        ]);

        $attendee = User::factory()->create([
            'name' => 'Jane Attendee',
            'email' => 'jane@example.com',
            'attendee_type' => 'Guest',
            'organization' => 'OpenAI Events',
            'position_title' => 'Visitor',
            'photo_path' => 'attendees/photos/jane.jpg',
            'qr_token' => str_repeat('a', 64),
            'qr_code_image_path' => 'qrcodes/user-2.png',
            'email_sent_at' => now(),
        ]);

        AttendanceRecord::query()->create([
            'user_id' => $attendee->id,
            'checked_in_at' => now(),
            'verification_status' => 'verified',
        ]);

        $response = $this->actingAs($admin)->get(route('users.show', $attendee));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Users/Show')
            ->where('user.name', 'Jane Attendee')
            ->where('user.email', 'jane@example.com')
            ->where('user.attendee_type', 'Guest')
            ->where('user.organization', 'OpenAI Events')
            ->where('user.position_title', 'Visitor')
            ->where('user.qr_code_status', 'Available')
            ->where('user.email_sent_status', 'Sent')
            ->where('attendance.status', 'Checked in')
            ->where('attendance.verification_status', 'verified')
            ->etc()
        );
    }

    public function test_non_attendee_user_detail_page_returns_not_found(): void
    {
        $this->withoutVite();

        $admin = User::factory()->create([
            'email' => 'admin@example.com',
            'qr_token' => null,
        ]);

        $nonAttendee = User::factory()->create([
            'qr_token' => null,
            'password' => 'password',
        ]);

        $response = $this->actingAs($admin)->get(route('users.show', $nonAttendee));

        $response->assertNotFound();
    }
}
