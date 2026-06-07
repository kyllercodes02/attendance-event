export default function VisitorInfoCard({
    attendee,
    message,
    checkInStatus,
    voiceGreetingNotice,
    onClose,
    onCheckInAnother,
    onNextVisitor,
}) {
    const isAlreadyCheckedIn = checkInStatus === 'already_checked_in';
    const statusClass = isAlreadyCheckedIn
        ? 'scanner-status-pill dashboard-status-badge--warning'
        : 'scanner-status-pill';
    const messageClass = isAlreadyCheckedIn
        ? 'scanner-alert scanner-alert--info'
        : 'scanner-alert scanner-alert--success';

    return (
        <section className="dashboard-card visitor-card">
            <div className="visitor-card__header">
                <div>
                    <p className="eyebrow">Check-In Result</p>
                    <h2>{isAlreadyCheckedIn ? 'Attendee already checked in' : 'Check-in successful'}</h2>
                </div>

                <span className={statusClass}>
                    {isAlreadyCheckedIn ? 'Already checked in' : 'Verified'}
                </span>
            </div>

            <div className={messageClass}>
                <span className="scanner-alert__label">Status message</span>
                <span className="visitor-card__message">{message}</span>
                {voiceGreetingNotice ? <span className="form-helper">{voiceGreetingNotice}</span> : null}
            </div>

            <div className="visitor-card__body">
                <div className="visitor-card__photo-wrap">
                    {attendee.photo_url ? (
                        <img
                            src={attendee.photo_url}
                            alt={`${attendee.name} attendee photo`}
                            className="visitor-card__photo"
                        />
                    ) : (
                        <div className="visitor-card__photo visitor-card__photo--placeholder">
                            No attendee photo
                        </div>
                    )}
                </div>

                <div className="visitor-card__details">
                    <div className="visitor-card__detail">
                        <span className="visitor-card__label">Attendee Name</span>
                        <strong>{attendee.name}</strong>
                    </div>

                    <div className="visitor-card__detail">
                        <span className="visitor-card__label">Category / Type</span>
                        <span>{attendee.attendee_type || 'Not provided'}</span>
                    </div>

                    <div className="visitor-card__detail">
                        <span className="visitor-card__label">Organization / Affiliation</span>
                        <span>{attendee.organization || 'Not provided'}</span>
                    </div>

                    <div className="visitor-card__detail">
                        <span className="visitor-card__label">Email</span>
                        <span>{attendee.email}</span>
                    </div>

                    <div className="visitor-card__detail">
                        <span className="visitor-card__label">Check-In Time</span>
                        <span>{attendee.checked_in_at_human || 'Recorded just now'}</span>
                    </div>
                </div>
            </div>

            <div className="visitor-card__footer">
                <button type="button" className="button-secondary" onClick={onClose}>
                    Close Result
                </button>
                <button type="button" className="button-primary" onClick={onCheckInAnother}>
                    Check In Another Attendee
                </button>
                <button type="button" className="button-primary visitor-card__next-button" onClick={onNextVisitor}>
                    Continue Scanning
                </button>
            </div>
        </section>
    );
}
