<?php

namespace App\Http\Controllers;

use App\Models\AttendanceRecord;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $totalRegisteredAttendees = User::query()->attendees()->count();

        $totalCheckedInAttendees = User::query()->checkedInAttendees()->count();

        $recentCheckIns = AttendanceRecord::query()
            ->with(['user:id,name'])
            ->forAttendees()
            ->latestCheckIns()
            ->limit(8)
            ->get()
            ->map(fn (AttendanceRecord $record) => [
                'id' => $record->id,
                'name' => $record->user?->name,
                'checked_in_at' => $record->checked_in_at?->toDateTimeString(),
                'checked_in_at_human' => $record->checked_in_at?->format('M d, Y h:i A'),
                'verification_status' => $record->verification_status,
            ]);

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_registered_attendees' => $totalRegisteredAttendees,
                'total_checked_in_attendees' => $totalCheckedInAttendees,
                'total_pending_attendees' => max($totalRegisteredAttendees - $totalCheckedInAttendees, 0),
            ],
            'recentCheckIns' => $recentCheckIns,
        ]);
    }
}
