import { Head, Link, usePage } from '@inertiajs/react';
import { 
    Trophy, 
    Users, 
    Calendar, 
    ArrowRight, 
    ShieldCheck, 
    MapPin, 
    Info, 
    CheckCircle2, 
    Flame,
    LayoutDashboard,
    LogIn,
    UserPlus,
    Clock,
    Medal,
    Zap,
    TrendingUp,
    Shield,
    Star,
    Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';

interface Player {
    id: number;
    first_name: string;
    last_name: string;
    is_captain?: boolean;
}

interface Team {
    id: number;
    name: string;
    unit: { name: string };
    players: Player[];
    captain?: Player;
}

interface Tournament {
    id: number;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
    champion?: {
        id: number;
        name: string;
        unit?: {
            name: string;
        };
    };
}

interface PageProps {
    activeTournament: Tournament | null;
    approvedTeams: Team[];
    auth: { user: any };
}

export default function Welcome({ activeTournament, approvedTeams, auth }: PageProps) {
    const [scrolled, setScrolled] = useState(false);
    
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const rules = [
        { icon: Users, title: "Kadro Sınırı", desc: "Takımlar en fazla 12 oyuncudan oluşur." },
        { icon: Medal, title: "Lisans Limiti", desc: "Kadroda en fazla 2 lisanslı oyuncu bulunabilir." },
        { icon: ShieldCheck, title: "Birim Kuralı", desc: "Oyuncular sadece kendi birimlerinin takımlarında yer alabilir." },
        { icon: Clock, title: "Sağlık Raporu", desc: "Tüm oyuncuların güncel sağlık raporu bulunması zorunludur." },
    ];

    const stats = [
        { label: "Onaylı Takım", value: approvedTeams.length, icon: Shield },
        { label: "Aktif Sporcu", value: approvedTeams.reduce((acc, team) => acc + (team.players?.length || 0), 0), icon: Users },
        { label: "Kritik Maç", value: "24+", icon: Zap },
        { label: "Fair Play", value: "%100", icon: Star },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white font-sans overflow-x-hidden">
            <Head title="Birimler Arası Halı Saha Turnuvası - KGM Premium" />
            
            {/* Global Gradient Overlays */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-50/30 blur-[150px] rounded-full" />
            </div>

            {/* Premium Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${scrolled ? 'bg-white/90 backdrop-blur-2xl border-slate-200 py-4 shadow-sm' : 'bg-transparent border-transparent py-8'}`}>
                <div className="container mx-auto flex items-center justify-between px-6 lg:px-12">
                    <div className="flex items-center gap-4 group">
                        <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(37,99,235,0.3)] group-hover:scale-110 transition-transform cursor-pointer">
                            <Trophy className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black uppercase tracking-tighter leading-none text-slate-900">HALISAHA<span className="text-blue-600">PRO</span></span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">ELITE TOURNAMENT SYSTEM</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {auth?.user ? (
                            <Link href="/dashboard">
                                <Button className="bg-slate-900 text-white hover:bg-blue-600 font-black uppercase tracking-widest text-[10px] rounded-2xl h-12 px-8 transition-all shadow-xl active:scale-95 border-none">
                                    <LayoutDashboard className="mr-2 h-4 w-4" /> DASHBOARD
                                </Button>
                            </Link>
                        ) : (
                            <div className="hidden md:flex items-center gap-3 bg-slate-100 p-1.5 rounded-[1.5rem] border border-slate-200 backdrop-blur-sm">
                                <Link href="/login">
                                    <Button variant="ghost" className="text-slate-600 hover:text-blue-600 hover:bg-white font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-2xl">
                                        GİRİŞ
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl h-11 px-8 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                                        KAYIT OL
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="relative z-10">
                <section className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden">
                    {/* Elite Background Image */}
                    <div className="absolute inset-0 z-0">
                        <img 
                            src="/images/premium/hero_elite.png" 
                            alt="Stadium Hero" 
                            className="w-full h-full object-cover scale-105 animate-slow-zoom opacity-30 lg:opacity-50"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-slate-50/20 to-slate-50" />
                        <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-slate-50 to-transparent" />
                    </div>

                    <div className="container mx-auto px-6 relative z-10 text-center">
                        {/* Champion Celebration if Tournament is Completed */}
                        {activeTournament?.status === 'completed' && activeTournament.champion ? (
                            <div className="mb-12 animate-in fade-in zoom-in duration-1000">
                                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 mb-6 backdrop-blur-md">
                                    <Trophy className="h-4 w-4 fill-current" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">TURNUVA ŞAMPİYONU</span>
                                </div>
                                <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-amber-400 via-amber-600 to-amber-800 drop-shadow-2xl">
                                    {activeTournament.champion.name}
                                </h2>
                                <p className="text-amber-700/60 font-black uppercase tracking-[0.4em] text-sm mb-12">
                                    {activeTournament.champion.unit?.name || 'GENEL BİRİM'}
                                </p>
                            </div>
                        ) : (
                            <Badge variant="outline" className="mb-8 border-blue-600/30 text-blue-600 font-extrabold uppercase tracking-[0.4em] py-2 px-8 rounded-full bg-blue-600/5 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                <Flame className="mr-2 h-3.5 w-3.5 fill-current animate-pulse text-blue-600" /> {activeTournament?.name || 'MÜCADELE YAKLAŞIYOR'}
                            </Badge>
                        )}
                        
                        <h1 className="text-5xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.85] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 text-slate-900">
                            {activeTournament?.status === 'completed' ? (
                                <>GURUR <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-amber-700 drop-shadow-xl">TABLOSU</span></>
                            ) : (
                                <>BİRİMLERİN <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-700 drop-shadow-xl">ZİRVESİ</span> <br /> BAŞLIYOR</>
                            )}
                        </h1>
                        
                        <p className="max-w-3xl mx-auto text-slate-600 text-lg md:text-xl font-medium leading-relaxed mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                            {activeTournament?.status === 'completed' ? 
                                "Zorlu mücadelenin ardından zirveye adını yazdıran takımı kutluyoruz. KGM tarihinin en prestijli turnuvası sona erdi." :
                                "Halı sahanın prestijini kurumsal gücünüzle birleştirin. KGM tarihinin en profesyonel turnuvasında yerinizi alın."}
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
                            {activeTournament?.status === 'completed' ? (
                                <Link href="/tournaments">
                                    <Button size="lg" className="h-16 px-12 bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-widest rounded-full shadow-xl shadow-amber-600/20 transition-all hover:scale-105 active:scale-95 group">
                                        TURNUVA ARŞİVİ <Trophy className="ml-3 h-5 w-5" />
                                    </Button>
                                </Link>
                            ) : (
                                <Link href="/register">
                                    <Button size="lg" className="h-16 px-12 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-full shadow-xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 group">
                                        ŞAMPİYONLUK İÇİN KAYDOL <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-2" />
                                    </Button>
                                </Link>
                            )}
                            <Link href="#teams">
                                <Button variant="ghost" className="h-16 px-12 border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 font-black uppercase tracking-widest text-[13px] rounded-full transition-all">
                                    TAKIMLARI İNCELE
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Live Stats Row */}
                <section className="container mx-auto px-6 mb-32 relative z-30">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                        {stats.map((stat, idx) => (
                            <Card key={idx} className="bg-white border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 group hover:border-blue-600/30 transition-all duration-500">
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-[0_10px_20px_rgba(37,99,235,0.2)] flex items-center justify-center mb-2 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                        <stat.icon className="h-7 w-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl md:text-5xl font-black tabular-nums tracking-tighter mb-1 text-slate-900 group-hover:text-blue-600 transition-colors">{stat.value}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">{stat.label}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Institutional Rules Section */}
                <section className="container mx-auto px-6 py-32 border-t border-slate-200">
                    <div className="flex flex-col items-center justify-center text-center gap-6 mb-24">
                        <Badge className="bg-blue-600/5 text-blue-600 border-none font-black uppercase tracking-widest px-8 py-2.5 rounded-full backdrop-blur-md">DİSİPLİN VE REKABET</Badge>
                        <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none text-slate-900">
                            TURNUVA <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-700 drop-shadow-xl">YÖNETMELİĞİ</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {rules.map((rule, idx) => (
                            <Card key={idx} className="bg-white hover:bg-slate-50 border border-slate-100 transition-all group rounded-[2.5rem] p-4 overflow-hidden relative shadow-xl shadow-slate-200/50">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <rule.icon className="h-24 w-24 text-slate-900" />
                                </div>
                                <CardContent className="p-8 relative z-10">
                                    <div className="h-16 w-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:rotate-12 transition-all duration-300">
                                        <rule.icon className="h-7 w-7 text-blue-600 group-hover:text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight mb-3 text-slate-900">{rule.title}</h3>
                                    <p className="text-slate-500 text-[13px] font-medium leading-relaxed">{rule.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Showcase Section (Premium Teams) */}
                <section id="teams" className="container mx-auto px-6 py-32 border-t border-slate-200">
                    <div className="flex flex-col items-center justify-center text-center gap-6 mb-24">
                        <Badge className="bg-indigo-50 text-indigo-600 border-none font-black uppercase tracking-widest px-8 py-2.5 rounded-full backdrop-blur-md">BAŞVURUSU ONAYLANANLAR</Badge>
                        <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none text-slate-900">
                            MÜCADELEYE HAZIR <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-700 drop-shadow-xl">EKİPLER</span>
                        </h2>
                        <div className="mt-8 h-14 px-10 border border-slate-200 bg-white shadow-sm rounded-2xl flex items-center justify-center font-black text-slate-400 uppercase text-[10px] tracking-[0.4em]">
                            TOPLAM: {approvedTeams.length} TAKIM
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                        {approvedTeams.map((team) => (
                            <div key={team.id} className="group relative">
                                <Card className="relative bg-white border-slate-200 group-hover:border-blue-600/30 transition-all duration-500 rounded-[3rem] p-0 overflow-hidden shadow-xl shadow-slate-200/50">
                                    <div className="p-10">
                                        <div className="flex items-start justify-between mb-10">
                                            <div className="h-20 w-20 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-2xl font-black text-white shadow-[0_10px_30px_rgba(37,99,235,0.3)] group-hover:scale-110 transition-transform">
                                                {team.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <Badge className="bg-slate-100 text-slate-500 border-slate-200 font-black uppercase text-[8px] tracking-[0.2em] py-2.5 px-5 rounded-full backdrop-blur-sm">
                                                {team.unit?.name || 'GENEL BİRİM'}
                                            </Badge>
                                        </div>

                                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 text-slate-900 group-hover:text-blue-600 transition-colors">{team.name}</h3>
                                        
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                                                <Users className="h-3.5 w-3.5 text-blue-600" />
                                                <span className="text-[10px] font-black text-slate-600 tracking-widest uppercase">{team.players?.length || 0} SPORCU</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                                                <Activity className="h-3.5 w-3.5 text-indigo-600" />
                                                <span className="text-[10px] font-black text-slate-600 tracking-widest uppercase">AKTİF KADRO</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-6 border-t border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                                <TrendingUp className="h-3 w-3" /> TAKIM KADROSU
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {team.players?.slice(0, 5).map(player => (
                                                    <Badge key={player.id} variant="secondary" className="bg-slate-100 text-slate-600 hover:text-blue-600 transition-colors py-1.5 px-4 border-none rounded-xl text-[9px] font-extrabold uppercase ring-1 ring-inset ring-slate-200">
                                                        {player.first_name} {player.last_name.charAt(0)}.
                                                    </Badge>
                                                ))}
                                                {(team.players?.length || 0) > 5 && (
                                                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 py-1.5 px-4 border-none rounded-xl text-[9px] font-black uppercase">
                                                        +{(team.players?.length || 0) - 5} DİĞER
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-emerald-50 p-5 text-center border-t border-emerald-100">
                                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                                            <CheckCircle2 className="h-3 w-3" /> KURALLARA UYGUN / ONAYLI
                                        </span>
                                    </div>
                                </Card>
                            </div>
                        ))}

                        {approvedTeams.length === 0 && (
                            <div className="col-span-full py-40 text-center bg-white/2 backdrop-blur-sm border border-dashed border-white/5 rounded-[4rem] group hover:bg-white/5 transition-all">
                                <Trophy className="h-24 w-24 text-white/10 mx-auto mb-8 animate-bounce opacity-20" />
                                <h3 className="text-2xl font-black text-white/20 uppercase tracking-tighter">İLK TAKIMLAR BEKLENİYOR</h3>
                                <p className="text-[10px] text-white/10 font-bold uppercase mt-4 tracking-[0.4em]">TAKIMINI KUR VE KURUMSAL REKABETTE YERİNİ AL!</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Elite CTA Section */}
                <section className="container mx-auto px-6 py-32">
                    <div className="relative p-12 lg:p-32 bg-gradient-to-br from-blue-600 to-blue-800 rounded-[5rem] overflow-hidden text-center shadow-2xl shadow-blue-600/30">
                        <div className="absolute inset-0 z-0 opacity-10">
                            <img src="/images/premium/hero_elite.png" alt="Overlay" className="w-full h-full object-cover scale-150 rotate-6" />
                        </div>
                        
                        <div className="relative z-10 max-w-4xl mx-auto space-y-12">
                            <h2 className="text-4xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-white leading-tight">
                                TAKIMINI KUR <br/> TARİH YAZ!
                            </h2>
                            <p className="text-white/80 text-xl font-medium tracking-wide">
                                Birimin için sahaya çık, şampiyonluk kupasını kurum muhafızlarına taşı.
                            </p>
                            
                            <div className="flex justify-center pt-8">
                                <Link href="/register">
                                    <Button size="lg" className="h-20 px-16 bg-white text-blue-600 hover:bg-slate-900 hover:text-white font-black uppercase tracking-widest text-lg rounded-full shadow-2xl transition-all active:scale-95 border-none">
                                        HEMEN ÜCRETSİZ KAYDOL <ArrowRight className="ml-4 h-6 w-6" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="container mx-auto px-6 py-32 border-t border-slate-200">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
                    <div className="space-y-6">
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Trophy className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-2xl font-black uppercase tracking-tighter leading-none text-slate-900">HALISAHA<span className="text-blue-600">PRO</span></span>
                        </div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed">
                            © 2026 KGM PREMİUM TOURNAMENT MANAGEMENT. <br />
                            TÜM HAKLARI SAKLIDIR.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-10">
                        {['Kurallar', 'Gizlilik', 'Destek', 'KGM Web'].map((item) => (
                            <a key={item} href="#" className="text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.3em]">
                                {item}
                            </a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
