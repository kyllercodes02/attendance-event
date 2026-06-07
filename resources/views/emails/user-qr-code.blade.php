<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Event Attendance QR Code</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f5f7fb; color: #172033; font-family: Arial, Helvetica, sans-serif;">
    <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border: 1px solid #d8e0ec; border-radius: 16px; padding: 32px;">
        <h1 style="margin: 0 0 16px; font-size: 24px;">Hello {{ $user->name }},</h1>

        <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.7;">
            Your event attendance QR code is ready. Please present this QR code during event check-in.
        </p>

        @if ($qrCodeDataUri)
            <div style="margin: 24px 0; text-align: center;">
                <img
                    src="{{ $qrCodeDataUri }}"
                    alt="Event attendance QR code"
                    style="display: inline-block; width: 280px; max-width: 100%; height: auto; border: 1px solid #d8e0ec; border-radius: 12px; padding: 12px; background-color: #ffffff;"
                >
            </div>
        @endif

        <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #5f6b85;">
            For convenience, the same QR code is also attached to this email as a PNG file.
        </p>
    </div>
</body>
</html>
