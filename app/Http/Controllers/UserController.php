<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\AttendanceRecord;
use App\Models\User;
use App\Services\QrCodeService;
use App\Services\QrCodeTokenService;
use App\Services\UserQrCodeEmailService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::query()
            ->attendees()
            ->latest()
            ->paginate(10)
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'attendee_type' => $user->attendee_type,
                'organization' => $user->organization,
                'position_title' => $user->position_title,
                'qr_code_status' => $user->qr_token && $user->qr_code_image_path ? 'Available' : 'Missing',
                'email_sent_status' => $user->email_sent_at ? 'Sent' : 'Pending',
                'created_at_human' => $user->created_at?->format('M d, Y'),
            ])
            ->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Users/Create');
    }

    public function show(User $user): Response
    {
        $user = $this->attendeeOrFail($user);

        $user->load('latestAttendanceRecord');

        /** @var AttendanceRecord|null $attendanceRecord */
        $attendanceRecord = $user->latestAttendanceRecord;

        return Inertia::render('Users/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'attendee_type' => $user->attendee_type,
                'organization' => $user->organization,
                'position_title' => $user->position_title,
                'photo_url' => $user->photo_path ? Storage::disk('public')->url($user->photo_path) : null,
                'qr_code_url' => $user->qr_code_image_path ? Storage::disk('public')->url($user->qr_code_image_path) : null,
                'qr_code_status' => $user->hasQrCode() ? 'Available' : 'Missing',
                'email_sent_status' => $user->email_sent_at ? 'Sent' : 'Pending',
                'email_sent_at_human' => $user->email_sent_at?->format('M d, Y h:i A'),
                'created_at_human' => $user->created_at?->format('M d, Y h:i A'),
            ],
            'attendance' => [
                'status' => $attendanceRecord?->checked_in_at ? 'Checked in' : 'Not checked in',
                'checked_in_at_human' => $attendanceRecord?->checked_in_at?->format('M d, Y h:i A'),
                'verification_status' => $attendanceRecord?->verification_status,
            ],
        ]);
    }

    public function edit(User $user): Response
    {
        $user = $this->attendeeOrFail($user);

        return Inertia::render('Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'attendee_type' => $user->attendee_type,
                'organization' => $user->organization,
                'position_title' => $user->position_title,
                'photo_url' => $user->photo_path ? Storage::disk('public')->url($user->photo_path) : null,
                'qr_code_status' => $user->hasQrCode() ? 'Available' : 'Missing',
            ],
        ]);
    }

    public function store(
        StoreUserRequest $request,
        QrCodeTokenService $qrCodeTokenService,
        QrCodeService $qrCodeService,
        UserQrCodeEmailService $userQrCodeEmailService
    ): RedirectResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('photo')) {
            $validated['photo_path'] = $request->file('photo')->store('attendees/photos', 'public');
        }

        unset($validated['photo']);

        $storedPhotoPath = $validated['photo_path'] ?? null;

        try {
            $user = DB::transaction(function () use ($validated, $qrCodeTokenService, $qrCodeService) {
                $user = User::query()->create([
                    ...$validated,
                    'qr_token' => $qrCodeTokenService->generateUniqueToken(),
                ]);

                $user->forceFill([
                    'qr_code_image_path' => $qrCodeService->generateForUser($user),
                ])->save();

                return $user;
            });
        } catch (Throwable $throwable) {
            report($throwable);

            if ($storedPhotoPath) {
                Storage::disk('public')->delete($storedPhotoPath);
            }

            return back()
                ->withInput()
                ->with('error', 'The attendee could not be saved because the QR code could not be prepared. Please try again.');
        }

        $emailSent = $userQrCodeEmailService->send($user);

        return redirect()
            ->route('users.index')
            ->with($emailSent ? 'success' : 'warning', $emailSent
                ? 'Attendee created and QR code email sent successfully.'
                : 'Attendee created, but the QR code email could not be sent.');
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $user = $this->attendeeOrFail($user);

        $validated = $request->validated();
        $oldPhotoPath = $user->photo_path;
        $newPhotoPath = null;

        if ($request->hasFile('photo')) {
            $newPhotoPath = $request->file('photo')->store('attendees/photos', 'public');
            $validated['photo_path'] = $newPhotoPath;
        }

        unset($validated['photo']);

        try {
            $user->fill($validated)->save();
        } catch (Throwable $throwable) {
            report($throwable);

            if ($newPhotoPath) {
                Storage::disk('public')->delete($newPhotoPath);
            }

            return back()
                ->withInput()
                ->with('error', 'The attendee could not be updated. Please try again.');
        }

        if ($newPhotoPath && $oldPhotoPath && $oldPhotoPath !== $newPhotoPath) {
            Storage::disk('public')->delete($oldPhotoPath);
        }

        return redirect()
            ->route('users.index')
            ->with('success', 'Attendee updated successfully.');
    }

    public function destroy(User $user): RedirectResponse
    {
        $user = $this->attendeeOrFail($user);

        $photoPath = $user->photo_path;
        $qrCodeImagePath = $user->qr_code_image_path;

        try {
            $user->delete();
        } catch (Throwable $throwable) {
            report($throwable);

            return redirect()
                ->route('users.index')
                ->with('error', 'The attendee could not be deleted. Please try again.');
        }

        if ($photoPath) {
            Storage::disk('public')->delete($photoPath);
        }

        if ($qrCodeImagePath) {
            Storage::disk('public')->delete($qrCodeImagePath);
        }

        return redirect()
            ->route('users.index')
            ->with('success', 'Attendee deleted successfully.');
    }

    protected function attendeeOrFail(User $user): User
    {
        abort_unless(
            User::query()->attendees()->whereKey($user->getKey())->exists(),
            404
        );

        return $user;
    }
}
