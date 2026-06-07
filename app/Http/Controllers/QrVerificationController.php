<?php

namespace App\Http\Controllers;

use App\Http\Requests\VerifyQrCodeRequest;
use App\Models\AttendanceRecord;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class QrVerificationController extends Controller
{
    public function __invoke(VerifyQrCodeRequest $request): JsonResponse
    {
        $user = User::query()
            ->attendees()
            ->where('qr_token', $request->validated('qr_token'))
            ->first();

        if (! $user) {
            return response()->json([
                'message' => 'The scanned QR code is not registered to a valid attendee.',
                'errors' => [
                    'qr_token' => ['The scanned QR code is invalid.'],
                ],
            ], 404);
        }

        /** @var AttendanceRecord $attendanceRecord */
        [$attendanceRecord, $wasRecentlyCreated] = DB::transaction(function () use ($user): array {
            $attendanceRecord = AttendanceRecord::query()->firstOrCreate(
                ['user_id' => $user->id],
                [
                    'checked_in_at' => now(),
                    'verification_status' => 'verified',
                ],
            );

            return [$attendanceRecord->fresh(), $attendanceRecord->wasRecentlyCreated];
        });

        return response()->json([
            'message' => $wasRecentlyCreated
                ? 'QR code verified and attendee checked in successfully.'
                : 'This attendee has already been checked in.',
            'check_in_status' => $wasRecentlyCreated ? 'checked_in' : 'already_checked_in',
            'attendee' => [
                'name' => $user->name,
                'email' => $user->email,
                'attendee_type' => $user->attendee_type,
                'organization' => $user->organization,
                'position_title' => $user->position_title,
                'photo_url' => $user->photo_path ? Storage::disk('public')->url($user->photo_path) : null,
                'verification_status' => $attendanceRecord->verification_status,
                'checked_in_at' => $attendanceRecord->checked_in_at?->toIso8601String(),
                'checked_in_at_human' => $attendanceRecord->checked_in_at?->format('M d, Y h:i A'),
            ],
        ]);
    }
}
