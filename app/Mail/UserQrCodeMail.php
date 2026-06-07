<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Attachment;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class UserQrCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Event Attendance QR Code',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.user-qr-code',
            with: [
                'user' => $this->user,
                'qrCodeDataUri' => $this->qrCodeDataUri(),
            ],
        );
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        if (
            blank($this->user->qr_code_image_path) ||
            ! Storage::disk('public')->exists($this->user->qr_code_image_path)
        ) {
            return [];
        }

        return [
            Attachment::fromStorageDisk('public', $this->user->qr_code_image_path)
                ->as('event-attendance-qr.png')
                ->withMime('image/png'),
        ];
    }

    protected function qrCodeDataUri(): ?string
    {
        if (blank($this->user->qr_code_image_path) || ! Storage::disk('public')->exists($this->user->qr_code_image_path)) {
            return null;
        }

        $contents = Storage::disk('public')->get($this->user->qr_code_image_path);

        return 'data:image/png;base64,'.base64_encode($contents);
    }
}
