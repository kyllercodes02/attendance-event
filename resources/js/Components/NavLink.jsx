import { Link } from '@inertiajs/react';

export default function NavLink({ href, active = false, children }) {
    const className = active ? 'nav-link nav-link--active' : 'nav-link';

    return (
        <Link href={href} className={className}>
            {children}
        </Link>
    );
}
