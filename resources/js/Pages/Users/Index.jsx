import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

function statusClass(status) {
    const value = (status || '').toLowerCase();

    if (value.includes('available') || value.includes('sent')) {
        return 'table-status table-status--success';
    }

    if (value.includes('pending')) {
        return 'table-status table-status--warning';
    }

    if (value.includes('failed') || value.includes('missing')) {
        return 'table-status table-status--error';
    }

    return 'table-status table-status--neutral';
}

export default function Index() {
    const { users, flash } = usePage().props;
    const deleteForm = useForm({});

    const destroyAttendee = (user) => {
        if (!window.confirm(`Delete attendee "${user.name}"? This will also remove the attendee's related attendance record.`)) {
            return;
        }

        deleteForm.delete(`/users/${user.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Attendees" />

            <AuthenticatedLayout title="Attendees">
                <section className="dashboard-card page-hero">
                    <div className="page-header">
                        <div className="page-header__copy">
                            <div>
                                <p className="eyebrow">Attendee Directory</p>
                                <h2>Registered attendees</h2>
                            </div>
                            <p>
                                Review attendee profiles, QR code readiness, and communication status from one organized list.
                            </p>
                        </div>

                        <div className="page-header__actions">
                            <Link href="/users/create" className="button-primary">
                                Create Attendee
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="dashboard-card dashboard-card--table">
                    <div className="dashboard-card__header">
                        <div>
                            <p className="eyebrow">Attendee Management</p>
                            <h2>Attendee list</h2>
                        </div>
                    </div>

                    {flash?.success ? (
                        <div className="scanner-alert scanner-alert--success">{flash.success}</div>
                    ) : null}

                    {flash?.error ? (
                        <div className="scanner-alert scanner-alert--error">{flash.error}</div>
                    ) : null}

                    {users.data.length > 0 ? (
                        <>
                            <div className="dashboard-table-wrap">
                                <table className="dashboard-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Category / Type</th>
                                            <th>Organization / Affiliation</th>
                                            <th>QR Code Status</th>
                                            <th>Email Sent Status</th>
                                            <th>Created Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.data.map((user) => (
                                            <tr key={user.id}>
                                                <td>
                                                    <div className="table-cell-stack">
                                                        <Link href={`/users/${user.id}`} className="table-link table-cell-strong">
                                                            {user.name}
                                                        </Link>
                                                        <span className="table-subtext">Created {user.created_at_human}</span>
                                                    </div>
                                                </td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <div className="table-cell-stack">
                                                        <span>{user.attendee_type || 'Not provided'}</span>
                                                        {user.position_title ? (
                                                            <span className="table-subtext">{user.position_title}</span>
                                                        ) : null}
                                                    </div>
                                                </td>
                                                <td>{user.organization || 'Not provided'}</td>
                                                <td>
                                                    <span className={statusClass(user.qr_code_status)}>
                                                        {user.qr_code_status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={statusClass(user.email_sent_status)}>
                                                        {user.email_sent_status}
                                                    </span>
                                                </td>
                                                <td>{user.created_at_human}</td>
                                                <td>
                                                    <div className="table-actions">
                                                        <Link href={`/users/${user.id}/edit`} className="table-action-link">
                                                            Edit
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            className="table-action-link table-action-link--danger"
                                                            onClick={() => destroyAttendee(user)}
                                                            disabled={deleteForm.processing}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="pagination">
                                {users.links.map((link, index) => (
                                    <Link
                                        key={`${link.label}-${index}`}
                                        href={link.url || '#'}
                                        className={link.active ? 'pagination__link pagination__link--active' : 'pagination__link'}
                                        aria-disabled={link.url ? 'false' : 'true'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        preserveScroll
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="dashboard-empty-state">
                            No registered attendees found yet. Attendees will appear here once they are added to the system.
                        </p>
                    )}
                </section>
            </AuthenticatedLayout>
        </>
    );
}
