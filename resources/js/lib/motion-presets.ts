import { useEffect, useState } from 'react';
import type { Variants, Transition } from 'framer-motion';

export function useReducedMotion(): boolean {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReduced(mq.matches);
        const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
        if (typeof mq.addEventListener === 'function') {
            mq.addEventListener('change', handler);
            return () => mq.removeEventListener('change', handler);
        }
        return undefined;
    }, []);

    return reduced;
}

const instant: Transition = { duration: 0 };

// NOT: hidden state'lerinden opacity kaldırıldı — içerik animasyon olsa da olmasa da
// her zaman görünür kalır. Eski cache veya viewport timing sorunlarına karşı koruma.
export const fadeUp: Variants = {
    hidden: { y: 24 },
    visible: { y: 0 },
};

export const scaleIn: Variants = {
    hidden: { scale: 0.96 },
    visible: { scale: 1 },
};

export const staggerContainer: Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
};

export const staggerItem: Variants = {
    hidden: { y: 12 },
    visible: { y: 0 },
};

/** Mobil Safari’de negatif margin ile whileInView güvenilir tetiklenmeyebilir */
export const inViewViewport = { once: true, amount: 0.12 } as const;

/** Stagger grid: görünür başlar, viewport’ta animasyon */
export const staggerInView = (reduced: boolean) =>
    reduced
        ? {}
        : {
              initial: 'hidden' as const,
              whileInView: 'visible' as const,
              viewport: inViewViewport,
          };

export const defaultTransition: Transition = {
    duration: 0.5,
    ease: [0.22, 1, 0.36, 1],
};

export const springTransition: Transition = {
    type: 'spring',
    stiffness: 320,
    damping: 28,
};

export function motionProps(reduced: boolean) {
    return {
        initial: reduced ? 'visible' : 'hidden',
        whileInView: 'visible',
        viewport: inViewViewport,
        transition: reduced ? instant : defaultTransition,
    };
}

export function hoverLift(reduced: boolean) {
    return reduced ? {} : { y: -4, transition: { duration: 0.2 } };
}

export const sectionTitleClass = 'border-l-4 border-orange-600 pl-4';
