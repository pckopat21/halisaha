import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2Z" />
            <path d="m12 12-4 3" />
            <path d="m12 12 4 3" />
            <path d="m12 12 0-5" />
            <path d="M12 7l3 2" />
            <path d="M12 7l-3 2" />
            <path d="M8 9l-2 3" />
            <path d="M16 9l2 3" />
            <path d="M6 12l2 3" />
            <path d="M18 12l-2 3" />
            <path d="M8 15h8" />
        </svg>
    );
}
