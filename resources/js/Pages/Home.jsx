import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const nextSteps = [
    'Define event, attendee, and attendance data models when requirements are finalized.',
    'Add authentication only when access rules for organizers and staff are confirmed.',
    'Introduce QR generation and scan flows after the core attendance process is approved.',
];

export default function Home({ appName, systemTitle }) {
    return (
        <>
            <Head title="Home" />

            <AppLayout>
                <section className="hero-card">
                    <div>
                        <p className="eyebrow">Project foundation</p>
                        <h2>{systemTitle}</h2>
                        <p className="hero-copy">
                            This starter keeps the stack intentionally small: Laravel handles routing and backend
                            concerns, while React pages are delivered through Inertia for a clean single-repo
                            workflow.
                        </p>
                    </div>

                    <div className="meta-grid">
                        <article className="meta-card">
                            <span className="meta-card__label">Backend</span>
                            <strong>{appName}</strong>
                            <p>Laravel 12 with only default framework tables.</p>
                        </article>
                        <article className="meta-card">
                            <span className="meta-card__label">Frontend</span>
                            <strong>React + Inertia</strong>
                            <p>JavaScript-based pages, layouts, and Vite bundling.</p>
                        </article>
                    </div>
                </section>

                <section className="content-grid">
                    <article className="panel">
                        <h3>Prepared structure</h3>
                        <ul className="checklist">
                            <li><code>resources/js/Pages</code> for route-backed screens</li>
                            <li><code>resources/js/Layouts</code> for shared page shells</li>
                            <li><code>resources/css/app.css</code> for app-level styles</li>
                            <li><code>routes/web.php</code> for Inertia-backed web routes</li>
                        </ul>
                    </article>

                    <article className="panel">
                        <h3>Recommended next steps</h3>
                        <ol className="roadmap">
                            {nextSteps.map((step) => (
                                <li key={step}>{step}</li>
                            ))}
                        </ol>
                    </article>
                </section>
            </AppLayout>
        </>
    );
}
