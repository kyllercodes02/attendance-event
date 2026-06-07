import { useForm, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import NavLink from '@/Components/NavLink';

export default function AuthenticatedLayout({ title, children }) {
    const { props, url } = usePage();
    const { auth } = props;
    const logoutForm = useForm({});

    const logout = () => {
        logoutForm.post('/logout');
    };

    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <div className="admin-sidebar__top">
                    <ApplicationLogo />

                    <nav className="admin-nav" aria-label="Primary navigation">
                        <NavLink href="/dashboard" active={url === '/dashboard'}>
                            Dashboard
                        </NavLink>
                        <NavLink href="/qr-check-in" active={url.startsWith('/qr-check-in')}>
                            QR Check-In
                        </NavLink>
                        <NavLink href="/users" active={url.startsWith('/users')}>
                            Attendees
                        </NavLink>
                    </nav>
                </div>

                <div className="admin-sidebar__bottom">
                    <div className="admin-user-card">
                        <span className="admin-user-card__label">Signed in as</span>
                        <strong>{auth.user?.name}</strong>
                        <span className="app-shell__meta">{auth.user?.email}</span>
                    </div>

                    <button className="button-secondary button-secondary--full" type="button" onClick={logout} disabled={logoutForm.processing}>
                        {logoutForm.processing ? 'Logging out...' : 'Log out'}
                    </button>
                </div>
            </aside>

            <div className="admin-main">
                <header className="admin-main__header">
                    <div className="page-header">
                        <div className="page-header__copy">
                            <div>
                                <p className="eyebrow">QR Code Event Attendance System</p>
                                <h1>{title}</h1>
                            </div>
                            <p className="page-header__meta">
                                Manage attendee registration and QR code check-in from a focused event operations workspace.
                            </p>
                        </div>

                        <div className="page-header__actions">
                            <span className="status-pill">QR Code Check-In Only</span>
                        </div>
                    </div>
                </header>

                <main className="admin-main__content">{children}</main>
            </div>
        </div>
    );
}
