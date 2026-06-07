export default function ScannerCard({ status }) {
    return (
        <section className="dashboard-card scanner-card">
            <div className="scanner-card__header">
                <div>
                    <p className="eyebrow">Scanner</p>
                    <h2>QR code capture area</h2>
                </div>

                <span className="scanner-status-pill">{status.label}</span>
            </div>

            <p className="form-helper">{status.description}</p>

            <div className="scanner-frame" aria-label="QR scanner placeholder">
                <div className="scanner-frame__corners" />
                <div className="scanner-frame__beam" />
                <div className="scanner-frame__content">
                    <span className="scanner-frame__icon">QR</span>
                    <strong>Camera preview placeholder</strong>
                    <p>Scanner access and live QR detection will appear here in the next step.</p>
                </div>
            </div>

            <div className="scanner-card__footer">
                <button type="button" className="button-primary">
                    Start QR Scan
                </button>
                <span className="form-helper">Use this station to scan one attendee at a time.</span>
            </div>
        </section>
    );
}
