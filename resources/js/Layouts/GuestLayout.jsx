import ApplicationLogo from '@/Components/ApplicationLogo';

export default function GuestLayout({ title, description, children }) {
    return (
        <div className="guest-shell">
            <div className="guest-card">
                <section className="guest-card__hero">
                    <div>
                        <ApplicationLogo />
                        <p className="eyebrow guest-card__hero-copy">Event Registration</p>
                        <h1>Professional QR code check-in for live events</h1>
                        <p className="guest-copy">
                            Keep registration, attendee records, and entrance verification organized from a clean
                            admin workspace built for event operations.
                        </p>
                    </div>

                    <div className="guest-card__hero-grid">
                        <div className="guest-feature">
                            <strong>Fast QR verification</strong>
                            <span>Designed for smooth attendee flow at the check-in desk.</span>
                        </div>
                        <div className="guest-feature">
                            <strong>Attendee records</strong>
                            <span>Maintain clear profiles, photos, and QR code readiness.</span>
                        </div>
                        <div className="guest-feature">
                            <strong>Live overview</strong>
                            <span>See registrations, check-ins, and recent activity at a glance.</span>
                        </div>
                        <div className="guest-feature">
                            <strong>Desk-friendly layout</strong>
                            <span>Readable cards and spacing for front-of-house staff.</span>
                        </div>
                    </div>
                </section>

                <section className="guest-card__panel">
                    <p className="eyebrow">Administrator Access</p>
                    <h2>{title}</h2>
                    <p className="guest-copy">{description}</p>

                    <div className="auth-card">{children}</div>
                </section>
            </div>
        </div>
    );
}
