<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceRecord extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'checked_in_at',
        'verification_status',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'checked_in_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeCheckedIn(Builder $query): Builder
    {
        return $query->whereNotNull('checked_in_at');
    }

    public function scopeForAttendees(Builder $query): Builder
    {
        return $query->whereHas('user', fn (Builder $builder) => $builder->attendees());
    }

    public function scopeLatestCheckIns(Builder $query): Builder
    {
        return $query
            ->checkedIn()
            ->orderByDesc('checked_in_at')
            ->orderByDesc('id');
    }
}
