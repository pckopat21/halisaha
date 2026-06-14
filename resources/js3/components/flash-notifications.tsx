import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { type SharedData } from '@/types';
import { CheckCircle2, AlertCircle, Info, Trophy } from 'lucide-react';

export function FlashNotifications() {
    const { flash, errors } = usePage<SharedData>().props;

    useEffect(() => {
        // Handle Flash Success
        if (flash.success) {
            toast.success(flash.success, {
                icon: <Trophy className="h-5 w-5 text-emerald-500" />,
                description: 'İşlem başarıyla tamamlandı.',
                className: 'rounded-2xl border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-50 font-sans shadow-2xl',
            });
        }

        // Handle Flash Error
        if (flash.error) {
            toast.error(flash.error, {
                icon: <AlertCircle className="h-5 w-5 text-rose-500" />,
                description: 'Lütfen bilgileri kontrol edip tekrar deneyin.',
                className: 'rounded-2xl border-rose-500/20 bg-rose-50 dark:bg-rose-950/20 text-rose-950 dark:text-rose-50 font-sans shadow-2xl',
            });
        }

        // Handle Validation Errors (from Inertia errors object)
        const errorEntries = Object.entries(errors);
        if (errorEntries.length > 0) {
            // Only show one toast for validation errors to avoid spam
            toast.error('Giriş Hatası', {
                icon: <AlertCircle className="h-5 w-5 text-rose-500" />,
                description: `${errorEntries.length} alanda hata tespit edildi.`,
                className: 'rounded-2xl border-rose-500/20 bg-rose-50 dark:bg-rose-950/20 text-rose-950 dark:text-rose-50 font-sans shadow-2xl',
            });
        }
    }, [flash, errors]);

    return (
        <Toaster 
            position="bottom-right" 
            expand={false} 
            richColors 
            closeButton
            toastOptions={{
                duration: 5000,
                style: {
                    borderRadius: '1rem',
                }
            }}
        />
    );
}
