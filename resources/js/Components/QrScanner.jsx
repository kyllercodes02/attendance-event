import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Scanner } from '@yudiel/react-qr-scanner';

const DUPLICATE_SCAN_WINDOW_MS = 4000;

function cameraErrorMessage(error) {
    if (!error || typeof error !== 'object') {
        return 'The camera could not be started. Please try again.';
    }

    switch (error.name || error.kind) {
        case 'permission-denied':
        case 'NotAllowedError':
        case 'SecurityError':
            return 'Camera access was denied. Please allow camera permission to scan attendee QR codes.';
        case 'no-camera':
        case 'NotFoundError':
            return 'No camera was found on this device.';
        case 'insecure-context':
            return 'Camera access requires a secure connection such as HTTPS or localhost.';
        case 'NotReadableError':
        case 'in-use':
            return 'The camera is currently unavailable. Close other apps using the camera and try again.';
        default:
            return error.message || 'The camera could not be started. Please try again.';
    }
}

export default function QrScanner({ status, verificationEndpoint, onVerified, resetTrigger, autoStart = false }) {
    const [isStarted, setIsStarted] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [statusMessage, setStatusMessage] = useState(status.description);
    const [lastToken, setLastToken] = useState('');
    const lastSubmittedRef = useRef({ token: '', at: 0 });

    useEffect(() => {
        setIsStarted(autoStart);
        setIsVerifying(false);
        setErrorMessage('');
        setLastToken('');
        setStatusMessage(status.description);
        lastSubmittedRef.current = { token: '', at: 0 };
    }, [autoStart, resetTrigger, status.description]);

    const submitToken = async (token) => {
        const now = Date.now();

        if (
            lastSubmittedRef.current.token === token &&
            now - lastSubmittedRef.current.at < DUPLICATE_SCAN_WINDOW_MS
        ) {
            setStatusMessage('That QR code was just scanned. Hold steady while the system avoids a duplicate request.');
            return;
        }

        lastSubmittedRef.current = { token, at: now };
        setIsVerifying(true);
        setErrorMessage('');
        setLastToken(token);
        setStatusMessage('QR code detected. Sending the token for verification...');

        try {
            const response = await axios.post(verificationEndpoint, {
                qr_token: token,
            });

            setStatusMessage(response.data.message || 'QR token sent successfully.');
            setIsStarted(false);
            onVerified?.({
                attendee: response.data.attendee,
                message: response.data.message || 'QR token sent successfully.',
                checkInStatus: response.data.check_in_status || 'checked_in',
            });
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || 'The QR token could not be sent for verification.'
            );

            if (error.response?.status === 422) {
                setStatusMessage('The scan could not be completed. Please try scanning the attendee QR code again.');
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const handleScan = (detectedCodes) => {
        const detectedToken = detectedCodes.find((code) => code.rawValue)?.rawValue?.trim();

        if (!detectedToken || isVerifying) {
            return;
        }

        void submitToken(detectedToken);
    };

    const handleCameraError = (error) => {
        setErrorMessage(cameraErrorMessage(error));
        setIsStarted(false);
    };

    return (
        <section className="dashboard-card scanner-card">
            <div className="scanner-card__header">
                <div>
                    <p className="eyebrow">Scanner</p>
                    <h2>QR code capture area</h2>
                </div>

                <span className="scanner-status-pill">
                    {isVerifying ? 'Verifying scan...' : status.label}
                </span>
            </div>

            <p className="form-helper">{statusMessage}</p>

            <div className="scanner-live-area">
                {isStarted ? (
                    <div className="scanner-live-frame">
                        <Scanner
                            onScan={handleScan}
                            onError={handleCameraError}
                            formats={['qr_code']}
                            allowMultiple
                            scanDelay={DUPLICATE_SCAN_WINDOW_MS}
                            paused={isVerifying}
                            sound={false}
                            constraints={{
                                facingMode: 'environment',
                            }}
                            components={{
                                audio: false,
                                finder: false,
                                tracker: false,
                                onOff: false,
                                torch: false,
                                zoom: false,
                            }}
                            classNames={{
                                container: 'qr-scanner__container',
                                video: 'qr-scanner__video',
                            }}
                        />

                        <div className="scanner-overlay" aria-hidden="true">
                            <div className="scanner-overlay__corners" />
                            <div className={`scanner-overlay__beam${isVerifying ? ' scanner-overlay__beam--paused' : ''}`} />
                            <div className="scanner-overlay__copy">
                                <strong>{isVerifying ? 'Processing scan' : 'Align QR code inside the frame'}</strong>
                                <p>{isVerifying ? 'Please wait while the token is sent.' : 'Use the rear camera for the best result.'}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="scanner-frame" aria-label="QR scanner placeholder">
                        <div className="scanner-frame__corners" />
                        <div className="scanner-frame__beam" />
                        <div className="scanner-frame__content">
                            <span className="scanner-frame__icon">QR</span>
                            <strong>Camera is ready to start</strong>
                            <p>Start the QR scanner to request camera access and scan attendee QR codes.</p>
                        </div>
                    </div>
                )}
            </div>

            {errorMessage ? (
                <div className="scanner-alert scanner-alert--error">{errorMessage}</div>
            ) : null}

            {lastToken ? (
                <div className="scanner-alert scanner-alert--info">
                    <span className="scanner-alert__label">Last scanned QR token</span>
                    <code>{lastToken}</code>
                </div>
            ) : null}

            <div className="scanner-card__footer">
                <button
                    type="button"
                    className="button-primary"
                    onClick={() => {
                        setErrorMessage('');
                        setIsStarted((current) => !current);
                    }}
                    disabled={isVerifying}
                >
                    {isStarted ? 'Stop QR Scan' : 'Start QR Scan'}
                </button>
                <span className="form-helper">
                    {isVerifying
                        ? 'Verification request in progress.'
                        : 'Only QR code scanning is enabled on this check-in station.'}
                </span>
            </div>
        </section>
    );
}
