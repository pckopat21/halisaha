export interface YoutubeEmbedOptions {
    autoplay?: boolean;
    mute?: boolean;
}

export function getYoutubeEmbedUrl(
    url: string | null | undefined,
    options: YoutubeEmbedOptions = { autoplay: true, mute: true },
): string | null {
    if (!url) return null;

    const { autoplay = true, mute = true } = options;

    try {
        const urlObj = new URL(url);
        let videoId: string | null = null;

        if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').filter(Boolean).pop() || null;
        } else if (urlObj.hostname.includes('youtu.be')) {
            videoId = urlObj.pathname.slice(1).split('/')[0] || null;
        }

        if (videoId) {
            const params = new URLSearchParams();
            if (autoplay) params.set('autoplay', '1');
            if (mute) params.set('mute', '1');
            params.set('rel', '0');
            params.set('playsinline', '1');
            return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
        }

        return url;
    } catch {
        return url;
    }
}
