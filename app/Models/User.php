<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'attendee_type',
        'organization',
        'position_title',
        'photo_path',
        'qr_token',
        'qr_code_image_path',
        'email_sent_at',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'qr_token',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_sent_at' => 'datetime',
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function attendanceRecords(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    public function attendanceRecord(): HasOne
    {
        return $this->hasOne(AttendanceRecord::class);
    }

    public function latestAttendanceRecord(): HasOne
    {
        return $this->hasOne(AttendanceRecord::class)->latestOfMany('checked_in_at');
    }

    public function scopeAttendees(Builder $query): Builder
    {
        return $query->where(function (Builder $builder) {
            $builder
                ->whereNull('password')
                ->orWhereNotNull('qr_token');
        });
    }

    public function scopeCheckedInAttendees(Builder $query): Builder
    {
        return $query
            ->attendees()
            ->whereHas('attendanceRecords', fn (Builder $builder) => $builder->checkedIn());
    }

    public function hasQrCode(): bool
    {
        return filled($this->qr_token) && filled($this->qr_code_image_path);
    }
}
