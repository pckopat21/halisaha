const STORAGE_KEY = 'halisaha_dismissed_announcement_id';

export function getDismissedAnnouncementId(): number | null {
    if (typeof window === 'undefined') return null;

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const id = parseInt(raw, 10);
        return Number.isNaN(id) ? null : id;
    } catch {
        return null;
    }
}

export function dismissAnnouncement(announcementId: number): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, String(announcementId));
    } catch {
        // ignore quota / private mode
    }
}

export function shouldShowAnnouncement(announcementId: number): boolean {
    return getDismissedAnnouncementId() !== announcementId;
}
