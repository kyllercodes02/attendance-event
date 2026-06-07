export default function AppLayout({ children }) {
    return (
        <div className="app-shell">
            <header className="app-shell__header">
                <div>
                    <p className="eyebrow">Laravel 12 • React • Inertia</p>
                    <h1>QR Code Event Attendance System</h1>
                </div>
                <span className="status-pill">Base project ready</span>
            </header>

            <main>{children}</main>
        </div>
    );
}
