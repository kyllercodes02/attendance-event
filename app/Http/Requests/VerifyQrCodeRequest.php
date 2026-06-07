<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VerifyQrCodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'qr_token' => ['required', 'string', 'max:2048'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'qr_token.required' => 'No QR code data was detected. Please scan the attendee QR code again.',
            'qr_token.string' => 'The scanned QR code could not be read. Please try again.',
            'qr_token.max' => 'The scanned QR code is not valid. Please try again.',
        ];
    }
}
