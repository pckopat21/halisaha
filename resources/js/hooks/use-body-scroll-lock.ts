import { useEffect } from 'react';

/**
 * Modal açıkken arka plan scroll'unu kilitler; kapanınca konumu geri yükler.
 * Yalnızca modal gerçekten görünürken `locked: true` verin (portal/hydration sonrası).
 */
export function useBodyScrollLock(locked: boolean) {
    useEffect(() => {
        if (typeof document === 'undefined') return;

        const { body } = document;
        const html = document.documentElement;

        if (!locked) {
            return;
        }

        const scrollY = window.scrollY;

        const prev = {
            bodyOverflow: body.style.overflow,
            bodyPosition: body.style.position,
            bodyTop: body.style.top,
            bodyLeft: body.style.left,
            bodyRight: body.style.right,
            bodyWidth: body.style.width,
            bodyPaddingRight: body.style.paddingRight,
            htmlOverflow: html.style.overflow,
        };

        const scrollbarWidth = window.innerWidth - html.clientWidth;

        body.style.position = 'fixed';
        body.style.top = `-${scrollY}px`;
        body.style.left = '0';
        body.style.right = '0';
        body.style.width = '100%';
        body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            body.style.paddingRight = `${scrollbarWidth}px`;
        }
        html.style.overflow = 'hidden';

        return () => {
            body.style.overflow = prev.bodyOverflow;
            body.style.position = prev.bodyPosition;
            body.style.top = prev.bodyTop;
            body.style.left = prev.bodyLeft;
            body.style.right = prev.bodyRight;
            body.style.width = prev.bodyWidth;
            body.style.paddingRight = prev.bodyPaddingRight;
            html.style.overflow = prev.htmlOverflow;
            window.scrollTo(0, scrollY);
        };
    }, [locked]);
}

/** Sayfa unmount / tam yenileme sonrası takılı kalan inline stilleri temizler */
export function releaseBodyScrollLock() {
    if (typeof document === 'undefined') return;
    const { body } = document;
    const html = document.documentElement;
    const top = body.style.top;
    const scrollY = top ? Math.abs(parseInt(top, 10) || 0) : window.scrollY;

    body.style.removeProperty('position');
    body.style.removeProperty('top');
    body.style.removeProperty('left');
    body.style.removeProperty('right');
    body.style.removeProperty('width');
    body.style.removeProperty('overflow');
    body.style.removeProperty('padding-right');
    html.style.removeProperty('overflow');
    window.scrollTo(0, scrollY);
}
