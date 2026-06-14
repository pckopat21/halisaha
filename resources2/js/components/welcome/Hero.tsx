import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";
import { Trophy, Flame } from "lucide-react";

interface HeroProps {
    activeTournament: any;
}

export default function Hero({ activeTournament }: HeroProps) {
    return (
        <section className="relative min-h-[85vh] flex flex-col items-center justify-center pt-24 px-6 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img src="/images/premium/hero_elite.png" alt="Stadium" className="w-full h-full object-cover scale-105 opacity-30 lg:opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#fafafa] via-transparent to-[#fafafa]" />
            </div>

            <div className="container mx-auto relative z-10 text-center max-w-5xl">
                {activeTournament?.status === 'completed' && activeTournament?.champion ? (
                    <div className="mb-8 animate-in fade-in zoom-in duration-1000">
                        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 mb-6 font-black text-[10px] uppercase tracking-widest">
                            <Trophy className="h-4 w-4 fill-current" /> TURNUVA ŞAMPİYONU
                        </div>
                        <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-4 text-slate-900">
                            {activeTournament?.champion?.name || 'Şampiyon'}
                        </h2>
                    </div>
                ) : (
                    <Badge variant="outline" className="mb-6 border-orange-600/20 text-orange-600 font-black uppercase tracking-[0.4em] py-2 px-8 rounded-full bg-orange-600/5 backdrop-blur-sm">
                        <Flame className="mr-2 h-4 w-4 fill-current animate-pulse text-orange-600" /> {activeTournament?.name || 'MÜCADELE BAŞLIYOR'}
                    </Badge>
                )}

                <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-8 text-slate-900 drop-shadow-sm">
                    {activeTournament?.status === 'completed' ? (
                        <>ZAFER <br /> <span className="text-orange-600">TABLOSU</span></>
                    ) : (
                        <>BİRİMLERİN <br /> <span className="text-orange-600">ZİRVESİ</span></>
                    )}
                </h1>

                <p className="max-w-2xl mx-auto text-slate-500 text-lg md:text-xl font-medium mb-12 leading-relaxed">
                    {activeTournament?.status === 'completed' ? "Efsanevi mücadelenin galibi belli oldu. Tüm sonuçları aşağıdan inceleyebilirsiniz." : "KGM 5. Bölge Müdürlüğü birimleri arası geleneksel halı saha futbol şöleni."}
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/games">
                        <Button size="lg" className="h-16 px-12 bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:scale-105">
                            {activeTournament?.status === 'completed' ? 'TÜM SONUÇLAR' : 'ŞİMDİ KATIL'}
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-bounce">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">KEŞFET</span>
                <div className="w-px h-12 bg-gradient-to-b from-orange-600 to-transparent" />
            </div>
        </section>
    );
}
