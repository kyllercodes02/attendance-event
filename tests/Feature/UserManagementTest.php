<?php

namespace Tests\Feature;

use App\Models\AttendanceRecord;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_administrator_can_view_the_attendee_edit_page(): void
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
        ]);

        $response = $this->actingAs($admin)->get(route('users.edit', $attendee));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Users/Edit')
            ->where('user.name', 'Jane Attendee')
            ->where('user.email', 'jane@example.com')
            ->where('user.qr_code_status', 'Available')
            ->etc()
        );
    }

    public function test_authenticated_administrator_can_update_an_attendee_without_regenerating_qr_details(): void
    {
        $this->withoutVite();
        Storage::fake('public');

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
            'photo_path' => 'attendees/photos/original.jpg',
            'qr_token' => str_repeat('a', 64),
            'qr_code_image_path' => 'qrcodes/user-2.png',
        ]);

        Storage::disk('public')->put('attendees/photos/original.jpg', 'original-photo');
        Storage::disk('public')->put('qrcodes/user-2.png', 'qr-image');

        $response = $this->actingAs($admin)
            ->from(route('users.edit', $attendee))
            ->put(route('users.update', $attendee), [
                'name' => 'Jane Updated',
                'email' => 'jane.updated@example.com',
                'attendee_type' => 'VIP',
                'organization' => 'Updated Org',
                'position_title' => 'Lead Guest',
                'photo' => UploadedFile::fake()->image('updated.jpg'),
            ]);

        $response->assertRedirect(route('users.index'));
        $response->assertSessionHas('success', 'Attendee updated successfully.');

        $attendee->refresh();

        $this->assertSame('Jane Updated', $attendee->name);
        $this->assertSame('jane.updated@example.com', $attendee->email);
        $this->assertSame('VIP', $attendee->attendee_type);
        $this->assertSame('Updated Org', $attendee->organization);
        $this->assertSame('Lead Guest', $attendee->position_title);
        $this->assertSame(str_repeat('a', 64), $attendee->qr_token);
        $this->assertSame('qrcodes/user-2.png', $attendee->qr_code_image_path);
        $this->assertNotSame('attendees/photos/original.jpg', $attendee->photo_path);

        Storage::disk('public')->assertMissing('attendees/photos/original.jpg');
        Storage::disk('public')->assertExists($attendee->photo_path);
        Storage::disk('public')->assertExists('qrcodes/user-2.png');
    }

    public function test_attendee_email_may_remain_the_same_when_updating(): void
    {
        $this->withoutVite();

        $admin = User::factory()->create([
            'email' => 'admin@example.com',
            'qr_token' => null,
        ]);

        $attendee = User::factory()->create([
            'email' => 'jane@example.com',
            'qr_token' => str_repeat('a', 64),
        ]);

        $response = $this->actingAs($admin)
            ->from(route('users.edit', $attendee))
            ->put(route('users.update', $attendee), [
                'name' => $attendee->name,
                'email' => 'jane@example.com',
                'attendee_type' => $attendee->attendee_type,
                'organization' => $attendee->organization,
                'position_title' => $attendee->position_title,
            ]);

        $response->assertRedirect(route('users.index'));
        $response->assertSessionDoesntHaveErrors();
    }

    public function test_authenticated_administrator_can_delete_an_attendee_and_related_attendance_record(): void
    {
        $this->withoutVite();
        Storage::fake('public');

        $admin = User::factory()->create([
            'email' => 'admin@example.com',
            'qr_token' => null,
        ]);

        $attendee = User::factory()->create([
            'email' => 'jane@example.com',
            'photo_path' => 'attendees/photos/jane.jpg',
            'qr_token' => str_repeat('a', 64),
            'qr_code_image_path' => 'qrcodes/user-2.png',
        ]);

        $otherAttendee = User::factory()->create([
            'email' => 'other@example.com',
            'qr_token' => str_repeat('b', 64),
            'qr_code_image_path' => 'qrcodes/user-3.png',
        ]);

        AttendanceRecord::query()->create([
            'user_id' => $attendee->id,
            'checked_in_at' => now(),
            'verification_status' => 'verified',
        ]);

        Storage::disk('public')->put('attendees/photos/jane.jpg', 'photo');
        Storage::disk('public')->put('qrcodes/user-2.png', 'qr-image');

        $response = $this->actingAs($admin)->delete(route('users.destroy', $attendee));

        $response->assertRedirect(route('users.index'));
        $response->assertSessionHas('success', 'Attendee deleted successfully.');

        $this->assertDatabaseMissing('users', [
            'id' => $attendee->id,
        ]);
        $this->assertDatabaseMissing('attendance_records', [
            'user_id' => $attendee->id,
        ]);
        $this->assertDatabaseHas('users', [
            'id' => $otherAttendee->id,
        ]);

        Storage::disk('public')->assertMissing('attendees/photos/jane.jpg');
        Storage::disk('public')->assertMissing('qrcodes/user-2.png');
    }

    public function test_non_attendee_user_edit_update_and_delete_routes_return_not_found(): void
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

        $this->actingAs($admin)->get(route('users.edit', $nonAttendee))->assertNotFound();
        $this->actingAs($admin)->put(route('users.update', $nonAttendee), [
            'name' => 'Nope',
            'email' => 'nope@example.com',
        ])->assertNotFound();
        $this->actingAs($admin)->delete(route('users.destroy', $nonAttendee))->assertNotFound();
    }
}
