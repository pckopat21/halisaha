import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            {/* KGM Arka Plan Görseli */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ 
                    backgroundImage: "url('/assets/images/kgm_tournament_bg.png')",
                }}
            >
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl">
                        <div className="flex flex-col items-center gap-4 mb-6">
                            <Link href={route('home')} className="flex flex-col items-center gap-2 font-medium">
                                <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 border border-white/20 shadow-inner">
                                    <AppLogoIcon className="size-8 text-[#FF8C00] drop-shadow-[0_0_8px_rgba(255,140,0,0.5)]" />
                                </div>
                                <span className="sr-only">{title}</span>
                            </Link>

                            <div className="space-y-2 text-center text-white">
                                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                                <p className="text-slate-200 text-center text-sm font-medium">{description}</p>
                            </div>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
