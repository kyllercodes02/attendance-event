import { Head, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

function verificationBadgeClass(status) {
    const value = (status || '').toLowerCase();

    if (value.includes('verified') || value.includes('success')) {
        return 'dashboard-status-badge';
    }

    if (value.includes('pending')) {
        return 'dashboard-status-badge dashboard-status-badge--warning';
    }

    if (value.includes('invalid') || value.includes('failed')) {
        return 'dashboard-status-badge dashboard-status-badge--error';
    }

    return 'dashboard-status-badge dashboard-status-badge--neutral';
}

export default function Dashboard() {
    const { auth, stats, recentCheckIns } = usePage().props;

    useEffect(() => {
        router.reload({
            only: ['stats', 'recentCheckIns'],
            preserveScroll: true,
            preserveState: true,
        });
    }, []);

    const summaryCards = [
        {
            label: 'Total Registered Attendees',
            value: stats.total_registered_attendees,
            tone: 'registered',
        },
        {
            label: 'Total Checked-In Attendees',
            value: stats.total_checked_in_attendees,
            tone: 'checked-in',
        },
        {
            label: 'Total Pending Attendees',
            value: stats.total_pending_attendees,
            tone: 'pending',
        },
    ];

    return (
        <>
            <Head title="Dashboard" />

            <AuthenticatedLayout title="Dashboard">
                <section className="dashboard-card page-hero">
                    <div className="page-header">
                        <div className="page-header__copy">
                            <div>
                                <p className="eyebrow">Operations Overview</p>
                                <h2>Welcome back, {auth.user?.name}</h2>
                            </div>
                            <p>
                                Review registration totals, monitor attendee arrivals, and keep the event entrance desk
                                moving with a clean QR code check-in workflow.
                            </p>
                        </div>

                        <div className="page-header__actions">
                            <div className="overview-card">
                                <span className="overview-card__label">Today&apos;s focus</span>
                                <strong className="overview-card__value">{stats.total_pending_attendees}</strong>
                                <p>Attendees still waiting to check in</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="dashboard-summary-grid">
                    {summaryCards.map((card) => (
                        <article key={card.label} className={`dashboard-stat-card dashboard-stat-card--${card.tone}`}>
                            <span className="dashboard-stat-card__label">{card.label}</span>
                            <strong className="dashboard-stat-card__value">{card.value}</strong>
                        </article>
                    ))}
                </section>

                <section className="dashboard-grid">
                    <article className="dashboard-card dashboard-grid__stack">
                        <div>
                            <p className="eyebrow">Registration Status</p>
                            <h3>Attendee flow at a glance</h3>
                        </div>

                        <ul className="dashboard-list">
                            <li>Track how many attendees are already inside the event versus still waiting in the queue.</li>
                            <li>Use the QR Code Check-In station for quick verification at the entrance.</li>
                            <li>Open attendee records to confirm profile details, photo availability, and QR code status.</li>
                        </ul>
                    </article>

                    <article className="dashboard-card dashboard-grid__stack">
                        <div>
                            <p className="eyebrow">Front Desk Notes</p>
                            <h3>{stats.total_pending_attendees} attendees are still expected</h3>
                        </div>

                        <div className="section-card">
                            <span className="section-card__label">Recommended use</span>
                            <p>Keep this dashboard visible on the admin screen while the QR scanner runs on the check-in station.</p>
                        </div>

                        <div className="section-card">
                            <span className="section-card__label">Recent updates</span>
                            <p>New attendee arrivals appear in the activity table below as check-ins are recorded.</p>
                        </div>
                    </article>
                </section>

                <section className="dashboard-card dashboard-card--table">
                    <div className="dashboard-card__header">
                        <div>
                            <p className="eyebrow">Recent Activity</p>
                            <h3>Recent Check-Ins</h3>
                        </div>
                    </div>

                    {recentCheckIns.length > 0 ? (
                        <div className="dashboard-table-wrap">
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th>Attendee Name</th>
                                        <th>Check-In Time</th>
                                        <th>Verification Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentCheckIns.map((record) => (
                                        <tr key={record.id}>
                                            <td>{record.name}</td>
                                            <td>{record.checked_in_at_human}</td>
                                            <td>
                                                <span className={verificationBadgeClass(record.verification_status)}>
                                                    {record.verification_status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="dashboard-empty-state">
                            No recent check-ins yet. This section will update as attendees are checked in.
                        </p>
                    )}
                </section>
            </AuthenticatedLayout>
        </>
    );
}
