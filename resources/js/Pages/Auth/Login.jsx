import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Login() {
    const form = useForm({
        email: '',
        password: '',
    });

    const submit = (event) => {
        event.preventDefault();
        form.post('/login', {
            onFinish: () => form.reset('password'),
        });
    };

    return (
        <>
            <Head title="Login" />

            <GuestLayout
                title="Sign in"
                description="Use your administrator account to access the event registration and QR code check-in dashboard."
            >
                <form className="auth-form" onSubmit={submit}>
                    {Object.keys(form.errors).length > 0 ? (
                        <div className="scanner-alert scanner-alert--error">
                            Please review the highlighted login details and try again.
                        </div>
                    ) : null}

                    <div className="field-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={form.data.email}
                            onChange={(event) => form.setData('email', event.target.value)}
                            autoComplete="username"
                            autoFocus
                        />
                        {form.errors.email && <div className="field-error">{form.errors.email}</div>}
                    </div>

                    <div className="field-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={form.data.password}
                            onChange={(event) => form.setData('password', event.target.value)}
                            autoComplete="current-password"
                        />
                        {form.errors.password && <div className="field-error">{form.errors.password}</div>}
                    </div>

                    <div className="button-row">
                        <p className="form-helper">Email and password are the only required credentials for admin access.</p>
                        <button className="button-primary" type="submit" disabled={form.processing}>
                            {form.processing ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
            </GuestLayout>
        </>
    );
}
