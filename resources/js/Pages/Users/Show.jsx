import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

function badgeClass(status) {
    const value = (status || '').toLowerCase();

    if (value.includes('available') || value.includes('checked in')) {
        return 'dashboard-status-badge';
    }

    if (value.includes('pending') || value.includes('not checked')) {
        return 'dashboard-status-badge dashboard-status-badge--warning';
    }

    if (value.includes('failed') || value.includes('missing')) {
        return 'dashboard-status-badge dashboard-status-badge--error';
    }

    return 'dashboard-status-badge dashboard-status-badge--neutral';
}

function DetailItem({ label, value }) {
    return (
        <div className="detail-item">
            <span className="detail-item__label">{label}</span>
            <span className="detail-item__value">{value || 'Not provided'}</span>
        </div>
    );
}

export default function Show() {
    const { user, attendance, flash } = usePage().props;
    const resendQrEmailForm = useForm({});

    return (
        <>
            <Head title={`${user.name} / Attendee Details`} />

            <AuthenticatedLayout title="Attendee Details">
                <div className="detail-layout">
                    <section className="dashboard-card detail-hero page-hero">
                        <div className="detail-hero__copy">
                            <div>
                                <p className="eyebrow">Attendee Profile</p>
                                <h2>{user.name}</h2>
                                <p className="form-helper">
                                    View registration details, QR code readiness, and the attendee&apos;s current event check-in state.
                                </p>
                            </div>

                            <div className="detail-hero__actions">
                                <Link href="/users" className="button-secondary">
                                    Back to Attendees
                                </Link>
                                <Link href={`/users/${user.id}/edit`} className="button-secondary">
                                    Edit Attendee
                                </Link>
                                <button
                                    type="button"
                                    className="button-primary"
                                    onClick={() => resendQrEmailForm.post(`/users/${user.id}/resend-qr-email`)}
                                    disabled={resendQrEmailForm.processing}
                                >
                                    {resendQrEmailForm.processing ? 'Resending QR Email...' : 'Resend QR Email'}
                                </button>
                            </div>
                        </div>

                        {flash?.success ? (
                            <div className="scanner-alert scanner-alert--info">{flash.success}</div>
                        ) : null}

                        {flash?.error ? (
                            <div className="scanner-alert scanner-alert--error">{flash.error}</div>
                        ) : null}

                        <div className="detail-grid">
                            <div className="detail-media-card">
                                <span className="detail-section-label">Photo</span>
                                {user.photo_url ? (
                                    <img className="detail-photo" src={user.photo_url} alt={`${user.name} attendee photo`} />
                                ) : (
                                    <div className="detail-photo detail-photo--placeholder">No photo uploaded</div>
                                )}
                            </div>

                            <div className="detail-info-card">
                                <DetailItem label="Name" value={user.name} />
                                <DetailItem label="Email" value={user.email} />
                                <DetailItem label="Category / Type" value={user.attendee_type} />
                                <DetailItem label="Organization / Affiliation" value={user.organization} />
                                <DetailItem label="Position / Title" value={user.position_title} />
                                <DetailItem label="Created" value={user.created_at_human} />
                            </div>
                        </div>

                        <div className="detail-grid">
                            <div className="detail-highlight-card">
                                <span className="detail-section-label">QR Code Status</span>
                                <strong className="detail-highlight-card__value">{user.qr_code_status}</strong>
                                <p className="form-helper">Use this attendee&apos;s QR code for event entrance verification.</p>
                            </div>

                            <div className="detail-highlight-card">
                                <span className="detail-section-label">Check-In Status</span>
                                <strong className="detail-highlight-card__value">{attendance.status}</strong>
                                <p className="form-helper">{attendance.checked_in_at_human || 'Waiting for attendee arrival.'}</p>
                            </div>
                        </div>
                    </section>

                    <div className="detail-columns">
                        <section className="dashboard-card detail-panel">
                            <div className="detail-panel__header">
                                <div>
                                    <p className="eyebrow">QR Code</p>
                                    <h3>Attendance QR Status</h3>
                                </div>
                                <span className={badgeClass(user.qr_code_status)}>
                                    {user.qr_code_status}
                                </span>
                            </div>

                            {user.qr_code_url ? (
                                <div className="detail-qr-wrap">
                                    <img className="detail-qr" src={user.qr_code_url} alt={`${user.name} QR code`} />
                                </div>
                            ) : (
                                <p className="dashboard-empty-state">QR code image is not available for this attendee yet.</p>
                            )}

                            <div className="detail-stack">
                                <DetailItem label="QR Email Status" value={user.email_sent_status} />
                                <DetailItem label="Email Sent Time" value={user.email_sent_at_human || 'Not sent yet'} />
                            </div>
                        </section>

                        <section className="dashboard-card detail-panel">
                            <div className="detail-panel__header">
                                <div>
                                    <p className="eyebrow">Attendance</p>
                                    <h3>Check-In Status</h3>
                                </div>
                                <span className={badgeClass(attendance.status)}>
                                    {attendance.status}
                                </span>
                            </div>

                            <div className="detail-stack">
                                <DetailItem label="Current Status" value={attendance.status} />
                                <DetailItem label="Check-In Time" value={attendance.checked_in_at_human || 'Not checked in yet'} />
                                <DetailItem label="Verification Status" value={attendance.verification_status || 'No attendance record yet'} />
                            </div>
                        </section>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    );
}
