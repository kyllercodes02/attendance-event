import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create() {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors, progress } = useForm({
        name: '',
        email: '',
        attendee_type: '',
        organization: '',
        position_title: '',
        photo: null,
    });

    const submit = (event) => {
        event.preventDefault();
        post('/users');
    };

    return (
        <>
            <Head title="Create Attendee" />

            <AuthenticatedLayout title="Create Attendee">
                <section className="dashboard-grid">
                    <article className="dashboard-card form-card">
                        <div className="dashboard-card__header form-card__header">
                            <div>
                                <p className="eyebrow">Attendee Management</p>
                                <h2>Add a new attendee</h2>
                                <p className="form-helper">
                                    Enter the attendee details required for event registration and attendee-facing display.
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
                                    <span className="form-helper">Optional. Upload a clear attendee photo for check-in display.</span>
                                    {progress && (
                                        <span className="form-helper">Upload progress: {progress.percentage}%</span>
                                    )}
                                    {errors.photo && <span className="field-error">{errors.photo}</span>}
                                </div>
                            </div>

                            <div className="button-row">
                                <span className="form-helper">
                                    A QR code will be prepared automatically after the attendee is saved.
                                </span>

                                <button className="button-primary" type="submit" disabled={processing}>
                                    {processing ? 'Saving attendee...' : 'Save attendee'}
                                </button>
                            </div>
                        </form>
                    </article>

                    <aside className="dashboard-grid__stack">
                        <article className="support-card dashboard-card">
                            <div>
                                <p className="eyebrow">Registration Notes</p>
                                <h3>Suggested profile details</h3>
                            </div>

                            <ul className="support-list">
                                <li>Use the attendee&apos;s official name to match their QR code registration record.</li>
                                <li>Keep category and organization details consistent for easier front desk validation.</li>
                                <li>Upload a clear photo when available so staff can confirm the attendee quickly.</li>
                            </ul>
                        </article>

                        <article className="support-card dashboard-card">
                            <div>
                                <p className="eyebrow">QR Code Flow</p>
                                <h3>What happens after saving</h3>
                            </div>

                            <div className="section-card">
                                <span className="section-card__label">Next step</span>
                                <p>The attendee record is saved first, then the QR code can be used for event check-in.</p>
                            </div>

                            <div className="section-card">
                                <span className="section-card__label">Best practice</span>
                                <p>Review the attendee detail page after saving to confirm photo, email, and QR code status.</p>
                            </div>
                        </article>
                    </aside>
                </section>
            </AuthenticatedLayout>
        </>
    );
}
