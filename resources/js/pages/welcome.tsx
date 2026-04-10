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
    Medal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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
}

interface PageProps {
    activeTournament: Tournament | null;
    approvedTeams: Team[];
    auth: { user: any };
}

export default function Welcome({ activeTournament, approvedTeams, auth }: PageProps) {
    const rules = [
        { icon: Users, title: "Kadro Sınırı", desc: "Takımlar en fazla 12 oyuncudan oluşur." },
        { icon: Medal, title: "Lisans Limiti", desc: "Kadroda en fazla 2 lisanslı oyuncu bulunabilir." },
        { icon: ShieldCheck, title: "Birim Kuralı", desc: "Oyuncular sadece kendi birimlerinin takımlarında yer alabilir." },
        { icon: Clock, title: "Sağlık Raporu", desc: "Tüm oyuncuların güncel sağlık raporu bulunması zorunludur." },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-blue-600 selection:text-white font-sans overflow-x-hidden">
            <Head title="Birimler Arası Halı Saha Turnuvası" />
            
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50/50 dark:bg-blue-900/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-muted/30 blur-[120px] rounded-full" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-border bg-background/80 backdrop-blur-xl">
                <div className="container mx-auto h-20 flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 text-white">
                            <Trophy className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-black uppercase tracking-tighter leading-none">HALISAHA<span className="text-blue-600">PRO</span></span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Tournament Management</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {auth?.user ? (
                            <Link href="/dashboard">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl h-11 px-6 transition-all shadow-lg shadow-blue-600/20">
                                    <LayoutDashboard className="mr-2 h-4 w-4" /> DASHBOARD
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground font-black uppercase tracking-widest text-[10px] h-11 px-6">
                                        <LogIn className="mr-2 h-4 w-4" /> GİRİŞ
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="bg-primary text-primary-foreground hover:bg-blue-600 font-black uppercase tracking-widest text-[10px] rounded-xl h-11 px-6 transition-all shadow-xl">
                                        <UserPlus className="mr-2 h-4 w-4" /> KAYIT OL
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <main className="relative pt-32">
                {/* Hero Section */}
                <section className="container mx-auto px-6 py-20 text-center relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-blue-50 dark:bg-blue-900/5 blur-[100px] rounded-full pointer-events-none" />
                    
                    <Badge variant="outline" className="mb-8 border-blue-100 text-blue-600 font-black uppercase tracking-[0.3em] py-2 px-6 rounded-full bg-blue-50/50 backdrop-blur-sm dark:border-blue-500/30 dark:text-blue-400 dark:bg-blue-500/5">
                        <Flame className="mr-2 h-3.5 w-3.5 fill-current animate-pulse text-blue-600" /> {activeTournament?.name || 'YENİ SEZON BAŞLIYOR'}
                    </Badge>
                    
                    <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
                        BİRİMLER ARASI <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600">MÜCADELE</span> <br />
                        RUHU
                    </h1>
                    
                    <p className="max-w-2xl mx-auto text-muted-foreground text-lg md:text-xl font-medium leading-relaxed mb-12">
                        Dostluğun rekabetle buluştuğu, birimini temsil etme gururunun sahalara taşındığı en prestijli organizasyon.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                        <Link href="/register">
                            <Button size="lg" className="h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-[2rem] shadow-2xl shadow-blue-600/30 group">
                                ŞİMDİ TAKIMINI KUR <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-2" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2 text-muted-foreground font-black uppercase text-[10px] tracking-widest px-6 py-3 border border-border rounded-full bg-muted/30 shadow-sm">
                            <Users className="h-4 w-4 text-blue-500" /> {approvedTeams.length} ONAYLI TAKIM
                        </div>
                    </div>
                </section>

                {/* Rules Section */}
                <section className="container mx-auto px-6 py-32 border-t border-border/50">
                    <div className="flex flex-col items-center mb-20 text-center">
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">TURNUVA KURALLARI</h2>
                        <div className="h-1.5 w-24 bg-blue-600 rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {rules.map((rule, idx) => (
                            <Card key={idx} className="bg-card border-border hover:border-blue-200 dark:hover:border-blue-500/20 transition-all group rounded-[2rem] p-4 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
                                <CardContent className="p-8">
                                    <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-500">
                                        <rule.icon className="h-7 w-7 text-blue-600 group-hover:text-white" />
                                    </div>
                                    <h3 className="text-lg font-black uppercase tracking-tight mb-3">{rule.title}</h3>
                                    <p className="text-muted-foreground text-sm font-medium leading-relaxed">{rule.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Teams Showcase */}
                <section className="container mx-auto px-6 py-32 border-t border-border/50">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-4">BAŞVURU YAPAN <br/><span className="text-blue-600">EKİPLER</span></h2>
                            <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest">Sahaya ayak basmaya hak kazanan onaylı takımlar</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-14 px-8 border border-border bg-muted/30 rounded-2xl flex items-center justify-center font-black text-muted-foreground uppercase text-[10px] tracking-[0.2em]">
                                TOPLAM: {approvedTeams.length} TAKIM
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {approvedTeams.map((team) => (
                            <div key={team.id} className="group relative">
                                <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full pointer-events-none" />
                                
                                <Card className="relative bg-card border-border group-hover:border-blue-200 dark:hover:border-blue-500/20 transition-all duration-500 rounded-[3rem] p-0 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
                                    <div className="p-10">
                                        <div className="flex items-start justify-between mb-10">
                                            <div className="h-20 w-20 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-3xl font-black text-white shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                                {team.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <Badge className="bg-muted text-muted-foreground font-black uppercase text-[8px] tracking-[0.2em] py-2 px-4 rounded-xl border-none">
                                                {team.unit?.name || 'BİRİM'}
                                            </Badge>
                                        </div>

                                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">{team.name}</h3>
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 mb-8">
                                            <Users className="h-3 w-3" /> {team.players?.length || 0} OYUNCU KADRODA
                                        </p>

                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">KADRO ÖZETİ</p>
                                            <div className="flex flex-wrap gap-2">
                                                {team.players?.slice(0, 4).map(player => (
                                                    <Badge key={player.id} variant="secondary" className="bg-muted text-muted-foreground hover:text-foreground transition-colors py-1 px-3 border-none rounded-lg text-[9px] font-bold uppercase">
                                                        {player.first_name} {player.last_name.charAt(0)}.
                                                    </Badge>
                                                ))}
                                                {(team.players?.length || 0) > 4 && (
                                                    <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-600/20 text-blue-600 py-1 px-3 border-none rounded-lg text-[9px] font-black uppercase">
                                                        +{(team.players?.length || 0) - 4} DİĞER
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t border-border bg-muted/10 p-6 text-center">
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2">
                                            <CheckCircle2 className="h-3 w-3 text-emerald-500" /> KATILIM ONAYLANDI
                                        </span>
                                    </div>
                                </Card>
                            </div>
                        ))}

                        {approvedTeams.length === 0 && (
                            <div className="col-span-full py-20 text-center bg-muted/10 border border-dashed border-border rounded-[3rem]">
                                <Trophy className="h-20 w-20 text-muted-foreground/20 mx-auto mb-6" />
                                <p className="text-xl font-black text-muted-foreground/30 uppercase tracking-tighter">İLK TAKIMLAR BEKLENİYOR</p>
                                <p className="text-[10px] text-muted-foreground/40 font-bold uppercase mt-2 tracking-widest">TAKIMINI KUR VE ONAY ALARAK BURADA YERİNİ AL!</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Final Call to Action */}
                <section className="container mx-auto px-6 py-32">
                    <div className="relative p-12 md:p-24 bg-slate-900 dark:bg-blue-950/20 border border-transparent dark:border-white/5 rounded-[4rem] overflow-hidden text-center shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                        
                        <h2 className="relative text-4xl md:text-7xl font-black uppercase tracking-tighter text-white mb-8">
                            TAKIMINI TOPLA <br/> MÜCADELEYE KATIL!
                        </h2>
                        <p className="relative max-w-xl mx-auto text-slate-400 text-lg md:text-xl mb-12 font-medium opacity-80">
                            Hemen kaydol, takımını kur ve birimini şampiyonluğa taşı.
                        </p>
                        
                        <div className="relative flex justify-center">
                            <Link href="/register">
                                <Button size="lg" className="h-16 px-12 bg-white text-slate-900 hover:bg-blue-600 hover:text-white font-black uppercase tracking-widest text-base rounded-full shadow-2xl transition-all active:scale-95">
                                    ŞİMDİ ÜCRETSİZ KAYDOL <ArrowRight className="ml-3 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="container mx-auto px-6 py-20 border-t border-border">
                <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-3">
                            <Trophy className="h-6 w-6 text-blue-600" />
                            <span className="text-xl font-black uppercase tracking-tighter">HALISAHA<span className="text-blue-600 font-black">PRO</span></span>
                        </div>
                        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest leading-none">© 2026 TÜM HAKLARI SAKLIDIR. | BİRİMLER ARASI HALI SAHA SİSTEMİ</p>
                    </div>

                    <div className="flex items-center gap-8">
                        <a href="#" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">Kullanım Koşulları</a>
                        <a href="#" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">Gizlilik Politikası</a>
                        <a href="#" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">Destek</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
