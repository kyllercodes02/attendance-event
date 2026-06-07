import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit() {
    const { user, flash } = usePage().props;
    const { data, setData, post, processing, errors, progress } = useForm({
        _method: 'put',
        name: user.name || '',
        email: user.email || '',
        attendee_type: user.attendee_type || '',
        organization: user.organization || '',
        position_title: user.position_title || '',
        photo: null,
    });

    const submit = (event) => {
        event.preventDefault();
        post(`/users/${user.id}`, {
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title={`Edit ${user.name}`} />

            <AuthenticatedLayout title="Edit Attendee">
                <section className="dashboard-grid">
                    <article className="dashboard-card form-card">
                        <div className="dashboard-card__header form-card__header">
                            <div>
                                <p className="eyebrow">Attendee Management</p>
                                <h2>Update attendee details</h2>
                                <p className="form-helper">
                                    Edit attendee information without changing the existing QR token or QR code image.
                                </p>
                            </div>

                            <Link href="/users" className="button-secondary">
                                Back to List
                            </Link>
                        </div>

                        {flash?.error ? (
                            <div className="scanner-alert scanner-alert--error">{flash.error}</div>
                        ) : null}

                        {Object.keys(errors).length > 0 ? (
                            <div className="scanner-alert scanner-alert--error">
                                Please correct the highlighted attendee details and try again.
                            </div>
                        ) : null}

                        <form className="admin-form" onSubmit={submit}>
                            <div className="admin-form__grid">
                                <div className="field-group">
                                    <label htmlFor="name">Name</label>
                                    <input
                                        id="name"
                                        type="text"
                                        placeholder="Enter attendee full name"
                                        value={data.name}
                                        onChange={(event) => setData('name', event.target.value)}
                                        autoComplete="name"
                                    />
                                    {errors.name && <span className="field-error">{errors.name}</span>}
                                </div>

                                <div className="field-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="Enter attendee email"
                                        value={data.email}
                                        onChange={(event) => setData('email', event.target.value)}
                                        autoComplete="email"
                                    />
                                    {errors.email && <span className="field-error">{errors.email}</span>}
                                </div>

                                <div className="field-group">
                                    <label htmlFor="attendee_type">Attendee Category / Type</label>
                                    <input
                                        id="attendee_type"
                                        type="text"
                                        placeholder="Speaker, Guest, Staff, VIP"
                                        value={data.attendee_type}
                                        onChange={(event) => setData('attendee_type', event.target.value)}
                                    />
                                    {errors.attendee_type && <span className="field-error">{errors.attendee_type}</span>}
                                </div>

                                <div className="field-group">
                                    <label htmlFor="organization">Organization / Affiliation</label>
                                    <input
                                        id="organization"
                                        type="text"
                                        placeholder="Company or organization"
                                        value={data.organization}
                                        onChange={(event) => setData('organization', event.target.value)}
                                    />
                                    {errors.organization && <span className="field-error">{errors.organization}</span>}
                                </div>

                                <div className="field-group">
                                    <label htmlFor="position_title">Position / Title</label>
                                    <input
                                        id="position_title"
                                        type="text"
                                        placeholder="Role or title"
                                        value={data.position_title}
                                        onChange={(event) => setData('position_title', event.target.value)}
                                    />
                                    {errors.position_title && <span className="field-error">{errors.position_title}</span>}
                                </div>

                                <div className="field-group">
                                    <label htmlFor="photo">Photo Upload</label>
                                    <input
                                        id="photo"
                                        type="file"
                                        accept="image/*"
                                        onChange={(event) => setData('photo', event.target.files[0] || null)}
                                    />
                                    <span className="form-helper">
                                        Optional. Upload a new image only if you want to replace the current attendee photo.
                                    </span>
                                    {progress && (
                                        <span className="form-helper">Upload progress: {progress.percentage}%</span>
                                    )}
                                    {errors.photo && <span className="field-error">{errors.photo}</span>}
                                </div>
                            </div>

                            <div className="button-row">
                                <span className="form-helper">
                                    QR code status: {user.qr_code_status}. QR token editing is intentionally disabled.
                                </span>

                                <button className="button-primary" type="submit" disabled={processing}>
                                    {processing ? 'Updating attendee...' : 'Update attendee'}
                                </button>
                            </div>
                        </form>
                    </article>

                    <aside className="dashboard-grid__stack">
                        <article className="support-card dashboard-card">
                            <div>
                                <p className="eyebrow">Current Photo</p>
                                <h3>Existing attendee image</h3>
                            </div>

                            {user.photo_url ? (
                                <img className="detail-photo" src={user.photo_url} alt={`${user.name} attendee photo`} />
                            ) : (
                                <div className="detail-photo detail-photo--placeholder">No photo uploaded</div>
                            )}
                        </article>

                        <article className="support-card dashboard-card">
                            <div>
                                <p className="eyebrow">QR Protection</p>
                                <h3>What stays unchanged</h3>
                            </div>

                            <ul className="support-list">
                                <li>The attendee QR token is not editable from this page.</li>
                                <li>Updating profile details does not regenerate the QR code image.</li>
                                <li>Existing attendance check-in records remain linked to this attendee.</li>
                            </ul>
                        </article>
                    </aside>
                </section>
            </AuthenticatedLayout>
        </>
    );
}
