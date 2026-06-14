import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dismissAnnouncement } from '@/lib/announcement-dismissal';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';
import { springTransition, useReducedMotion } from '@/lib/motion-presets';

export interface LatestAnnouncement {
    id: number;
    title: string;
    content: string;
    type: 'info' | 'success' | 'warning' | 'danger' | string;
    published_at: string | null;
}

interface AnnouncementModalProps {
    announcement: LatestAnnouncement | null;
    isOpen: boolean;
    onClose: () => void;
}

const typeConfig: Record<
    string,
    { label: string; badgeClass: string; icon: typeof Info }
> = {
    info: {
        label: 'BİLGİ',
        badgeClass: 'bg-blue-600/10 text-blue-700',
        icon: Info,
    },
    success: {
        label: 'BAŞARI',
        badgeClass: 'bg-emerald-600/10 text-emerald-700',
        icon: CheckCircle2,
    },
    warning: {
        label: 'UYARI',
        badgeClass: 'bg-amber-600/10 text-amber-700',
        icon: AlertTriangle,
    },
    danger: {
        label: 'KRİTİK',
        badgeClass: 'bg-rose-600/10 text-rose-700',
        icon: AlertCircle,
    },
};

export default function AnnouncementModal({
    announcement,
    isOpen,
    onClose,
}: AnnouncementModalProps) {
    const reduced = useReducedMotion();
    const [portalReady, setPortalReady] = useState(false);

    const visible = portalReady && !!announcement && isOpen;

    useBodyScrollLock(visible);

    useEffect(() => {
        setPortalReady(true);
    }, []);

    if (!announcement || !portalReady) return null;

    const config = typeConfig[announcement.type] ?? typeConfig.info;
    const Icon = config.icon;

    const handleDismissPermanently = () => {
        dismissAnnouncement(announcement.id);
        onClose();
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={false}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xl overflow-hidden overscroll-none"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="announcement-modal-title"
                    onClick={onClose}
                >
                    <motion.div
                        initial={reduced ? false : { scale: 0.96, y: 12 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={reduced ? { opacity: 0 } : { scale: 0.98, y: 8, opacity: 0 }}
                        transition={springTransition}
                        className="max-w-lg w-full max-h-[min(90dvh,640px)] flex flex-col rounded-[2rem] border border-orange-100 overflow-hidden bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-br from-orange-600 to-orange-700 px-6 py-5 text-white relative shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                                aria-label="Kapat"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <div className="space-y-3 text-left pr-10">
                                <div className="flex items-center gap-3">
                                    <div className="h-11 w-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                        <Bell className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <Badge className="bg-white/20 text-white border-0 text-[9px] font-black mb-2">
                                            DUYURU
                                        </Badge>
                                        <h2
                                            id="announcement-modal-title"
                                            className="text-xl font-black uppercase tracking-tight text-white leading-tight"
                                        >
                                            {announcement.title}
                                        </h2>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge className={`${config.badgeClass} border-0 text-[9px] font-black`}>
                                        <Icon className="h-3 w-3 mr-1 inline" />
                                        {config.label}
                                    </Badge>
                                    {announcement.published_at && (
                                        <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">
                                            {format(new Date(announcement.published_at), 'd MMMM yyyy', { locale: tr })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-6 min-h-0 flex-1 overflow-y-auto overscroll-contain">
                            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {announcement.content}
                            </div>
                        </div>

                        <div className="px-6 pb-6 flex flex-col gap-2 shrink-0 border-t border-slate-100 pt-4">
                            <Button
                                onClick={onClose}
                                className="w-full h-12 bg-slate-900 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all hover:scale-[1.01]"
                            >
                                Tamam
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={handleDismissPermanently}
                                className="w-full h-10 text-slate-500 hover:text-orange-600 font-bold uppercase tracking-widest text-[10px] rounded-xl"
                            >
                                Tekrar gösterme
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
