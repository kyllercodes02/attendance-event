import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import QrScanner from '@/Components/QrScanner';
import VisitorInfoCard from '@/Components/VisitorInfoCard';
import { playVoiceGreeting } from '@/utils/voiceGreeting';

export default function Index({ scannerStatus, verificationEndpoint }) {
    const [visitorResult, setVisitorResult] = useState(null);
    const [scannerResetKey, setScannerResetKey] = useState(0);
    const [scannerAutoStart, setScannerAutoStart] = useState(false);
    const [voiceGreetingNotice, setVoiceGreetingNotice] = useState('');
    const scanEventCounterRef = useRef(0);
    const lastGreetedEventRef = useRef(null);

    useEffect(() => {
        if (!visitorResult?.scanEventId) {
            return;
        }

        if (visitorResult.checkInStatus !== 'checked_in') {
            setVoiceGreetingNotice('');
            return;
        }

        if (lastGreetedEventRef.current === visitorResult.scanEventId) {
            return;
        }

        lastGreetedEventRef.current = visitorResult.scanEventId;
        setVoiceGreetingNotice('');

        playVoiceGreeting(visitorResult.attendee?.name, {
            onError: (message) => {
                setVoiceGreetingNotice(message);
            },
        });
    }, [visitorResult]);

    const resetScanner = (autoStart = false) => {
        setVisitorResult(null);
        setScannerAutoStart(autoStart);
        setVoiceGreetingNotice('');
        setScannerResetKey((current) => current + 1);
    };

    return (
        <>
            <Head title="QR Code Check-In" />

            <AuthenticatedLayout title="QR Code Check-In">
                <div className="check-in-layout">
                    <section className="dashboard-card check-in-hero page-hero">
                        <div className="page-header">
                            <div className="page-header__copy">
                                <div>
                                    <p className="eyebrow">Event Check-In</p>
                                    <h2>QR code entrance station</h2>
                                </div>

                                <p className="check-in-hero__copy">
                                    Scan each attendee&apos;s QR code from this station for quick, readable, one-at-a-time event entry verification.
                                </p>
                            </div>

                            <div className="page-header__actions">
                                <div className="overview-card">
                                    <span className="overview-card__label">Scanner status</span>
                                    <strong className="overview-card__value">{scannerStatus.label}</strong>
                                    <p>Station is configured for QR code check-in.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="check-in-grid">
                        {visitorResult ? (
                            <VisitorInfoCard
                                attendee={visitorResult.attendee}
                                message={visitorResult.message}
                                checkInStatus={visitorResult.checkInStatus}
                                voiceGreetingNotice={voiceGreetingNotice}
                                onClose={() => resetScanner(false)}
                                onCheckInAnother={() => resetScanner(true)}
                                onNextVisitor={() => resetScanner(true)}
                            />
                        ) : (
                            <QrScanner
                                status={scannerStatus}
                                verificationEndpoint={verificationEndpoint}
                                onVerified={({ attendee, message, checkInStatus }) => {
                                    scanEventCounterRef.current += 1;

                                    setVisitorResult({
                                        attendee,
                                        message,
                                        checkInStatus,
                                        scanEventId: scanEventCounterRef.current,
                                    });
                                }}
                                resetTrigger={scannerResetKey}
                                autoStart={scannerAutoStart}
                            />
                        )}

                        <section className="dashboard-card check-in-side-panel">
                            <div>
                                <p className="eyebrow">Station Guide</p>
                                <h3>Check-in overview</h3>
                            </div>

                            <div className="check-in-side-panel__stack">
                                <div className="check-in-stat">
                                    <span className="check-in-stat__label">Current mode</span>
                                    <strong>QR Code Check-In</strong>
                                </div>

                                <div className="check-in-stat">
                                    <span className="check-in-stat__label">Scanner status</span>
                                    <strong>{scannerStatus.label}</strong>
                                </div>

                                <div className="check-in-stat">
                                    <span className="check-in-stat__label">Verification flow</span>
                                    <p>Each scanned QR code is sent directly to the verification endpoint for attendee confirmation.</p>
                                </div>

                                <div className="check-in-stat">
                                    <span className="check-in-stat__label">Staff instruction</span>
                                    <p>Ask the attendee to hold their QR code steady inside the camera frame until verification is complete.</p>
                                </div>

                                <div className="check-in-stat">
                                    <span className="check-in-stat__label">Desk setup</span>
                                    <p>Keep lighting even and the camera clear so the scanner can read each QR code without delay.</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    );
}
