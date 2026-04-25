import { Head, Link } from '@inertiajs/react';
import {
    Trophy,
    Users,
    ArrowRight,
    Flame,
    LayoutDashboard,
    LogIn,
    UserPlus,
    Zap,
    Shield,
    Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
    groupStandings: Array<{
        name: string;
        advance_count: number;
        rows: Array<{
            team: { name: string; unit?: string | null };
            played: number;
            won: number;
            drawn: number;
            lost: number;
            goals_for: number;
            goals_against: number;
            goal_difference: number;
            points: number;
        }>;
    }>;
    groupFixtures: Array<{
        group: string;
        home_team: string;
        away_team: string;
        scheduled_at: string | null;
        status: string;
        home_score: number | null;
        away_score: number | null;
        field?: string | null;
    }>;
    homepageStats: {
        summary: {
            total_goals: number;
            avg_goals: number;
            total_matches: number;
            played_matches: number;
            total_cards: number;
        };
        topScorers: Array<{ name: string; goals: number }>;
        topAssists: Array<{ name: string; assists: number }>;
    } | null;
    totalStats: {
        approvedTeams: number;
        activePlayers: number;
        totalMatches: number;
    };
    nextMatch: {
        home_team: string;
        away_team: string;
        scheduled_at: string;
        field?: string;
    } | null;
    auth: { user: any };
}

export default function Welcome({ 
    activeTournament, 
    approvedTeams = [], 
    groupStandings = [], 
    groupFixtures = [], 
    homepageStats = null, 
    totalStats,
    nextMatch = null,
    auth 
}: PageProps) {
    const [scrolled, setScrolled] = useState(false);
    
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const stats = [
        { label: "Onaylı Takım", value: totalStats?.approvedTeams || 0, icon: Shield },
        { label: "Aktif Sporcu", value: totalStats?.activePlayers || 0, icon: Users },
        { label: "Kritik Maç", value: totalStats?.totalMatches || 0, icon: Zap },
    ];

    const getMatchDateMeta = (dateString: string | null) => {
        if (!dateString) return { dayLabel: 'Tarih Yok', fullDate: '-', time: '-' };
        const matchDate = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
        let dayLabel = 'Ileri Tarih';
        if (isSameDay(matchDate, today)) dayLabel = 'Bugun';
        else if (isSameDay(matchDate, tomorrow)) dayLabel = 'Yarin';
        return {
            dayLabel,
            time: matchDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            fullDate: matchDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })
        };
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white font-sans overflow-x-hidden">
            <Head title="Birimler Arası Halı Saha Turnuvası - KGM Premium" />
            
            {/* Global Background Elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-orange-200/20 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-orange-100/20 blur-[100px] rounded-full" />
            </div>

            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-orange-100 py-3 shadow-sm' : 'bg-transparent py-6'}`}>
                <div className="container mx-auto flex items-center justify-between px-6 lg:px-12">
                    <div className="flex items-center gap-3 md:gap-4 group">
                        <div className="h-10 w-10 md:h-12 md:w-12 bg-orange-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/20 group-hover:rotate-3 transition-transform">
                            <Trophy className="h-5 w-5 md:h-6 md:w-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg md:text-xl font-black uppercase tracking-tighter leading-none">KARAYOLLARI <span className="text-orange-600">TURNUVA</span></span>
                            <span className="hidden md:block text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">KGM 5.BÖLGE MÜDÜRLÜĞÜ</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {auth?.user ? (
                            <Link href="/dashboard">
                                <Button className="bg-slate-900 text-white hover:bg-orange-600 font-bold uppercase tracking-widest text-[10px] rounded-xl h-10 px-6 transition-all shadow-md">
                                    <LayoutDashboard className="h-4 w-4 mr-2" /> DASHBOARD
                                </Button>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md p-1 rounded-2xl border border-orange-100 shadow-sm">
                                <Link href="/login">
                                    <Button variant="ghost" className="text-slate-600 hover:text-orange-600 font-bold uppercase tracking-widest text-[10px] h-9 px-4 md:px-6 rounded-xl">GİRİŞ</Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl h-9 px-4 md:px-6 transition-all shadow-sm">KAYIT OL</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="relative z-10">
                {/* Hero Section */}
                <section className="relative min-h-[85vh] flex flex-col items-center justify-center pt-24 px-6 overflow-hidden">
                    {/* Background Image Layer */}
                    <div className="absolute inset-0 z-0">
                        <img 
                            src="/images/premium/hero_elite.png" 
                            alt="Stadium" 
                            className="w-full h-full object-cover scale-105 opacity-30 lg:opacity-40" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-slate-50/40 to-slate-50" />
                    </div>

                    <div className="container mx-auto relative z-10 text-center max-w-5xl">
                        {activeTournament?.status === 'completed' && activeTournament.champion ? (
                            <div className="mb-8 animate-in fade-in zoom-in duration-1000">
                                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 mb-6 font-black text-[10px] uppercase tracking-widest">
                                    <Trophy className="h-4 w-4 fill-current" /> TURNUVA ŞAMPİYONU
                                </div>
                                <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-4 text-slate-900">
                                    {activeTournament.champion.name}
                                </h2>
                            </div>
                        ) : (
                            <Badge variant="outline" className="mb-6 border-orange-600/20 text-orange-600 font-black uppercase tracking-[0.4em] py-2 px-8 rounded-full bg-orange-600/5">
                                <Flame className="mr-2 h-4 w-4 fill-current animate-pulse text-orange-600" /> {activeTournament?.name || 'MÜCADELE BAŞLIYOR'}
                            </Badge>
                        )}
                        
                        <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-8 text-slate-900">
                            {activeTournament?.status === 'completed' ? (
                                <>ZAFER <br /> <span className="text-orange-600">TABLOSU</span></>
                            ) : (
                                <>GÜCÜNÜ <br /> <span className="text-orange-600">GÖSTER</span></>
                            )}
                        </h1>
                        
                        <p className="max-w-2xl mx-auto text-slate-500 text-lg md:text-xl font-medium mb-12 leading-relaxed">
                            {activeTournament?.status === 'completed' ? "Efsanevi mücadelenin galibi belli oldu. Tüm sonuçları aşağıdan inceleyebilirsiniz." : "KGM 5. Bölge Müdürlüğü birimleri arası geleneksel halı saha futbol şöleni."}
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/games">
                                <Button size="lg" className="h-14 px-10 bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:scale-105">
                                    {activeTournament?.status === 'completed' ? 'TÜM SONUÇLAR' : 'ŞİMDİ KATIL'}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Next Match Ribbon (Integrated) */}
                {nextMatch && (
                    <div className="container max-w-5xl px-6 -mt-10 mb-20">
                        <div className="bg-orange-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-orange-600/20 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Trophy className="h-32 w-32 -mr-10 -mt-10" />
                            </div>
                            <div className="relative z-10 flex-1 text-center md:text-left">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-2 block">SIRADAKİ HEYECAN</span>
                                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{nextMatch.home_team} <span className="text-orange-200">vs</span> {nextMatch.away_team}</h3>
                            </div>
                            <div className="relative z-10 flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/20">
                                <div className="text-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest block opacity-70 mb-1">{getMatchDateMeta(nextMatch.scheduled_at).dayLabel}</span>
                                    <span className="text-xl font-black">{getMatchDateMeta(nextMatch.scheduled_at).time}</span>
                                </div>
                                <div className="w-px h-8 bg-white/20" />
                                <div className="text-sm font-bold opacity-90">{nextMatch.field || 'Merkez Saha'}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Data Sections Grid */}
                <section className="container mx-auto px-6 mb-32 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Column 1: Standings */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="flex items-center justify-between border-l-4 border-orange-600 pl-4">
                                <h2 className="text-2xl font-black uppercase tracking-tighter">GRUP PUAN DURUMLARI</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {groupStandings?.map((group) => (
                                    <Card key={group.name} className="border-orange-100 bg-white rounded-[2rem] p-6 shadow-sm flex flex-col h-full">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="font-black text-orange-600 uppercase tracking-widest text-xs">{group.name}</h3>
                                            <Badge variant="secondary" className="bg-orange-50 text-orange-700 font-bold text-[9px] border-none">{group.rows.length} TAKIM</Badge>
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="grid grid-cols-[25px_1fr_30px_30px_30px] text-[9px] font-black text-slate-400 uppercase px-2 mb-2">
                                                <span>#</span><span>TAKIM</span><span className="text-center">O</span><span className="text-center">A</span><span className="text-center text-orange-600">P</span>
                                            </div>
                                            {group.rows.map((row, idx) => {
                                                const isAdvancing = idx < group.advance_count;
                                                return (
                                                    <div key={idx} className={`grid grid-cols-[25px_1fr_30px_30px_30px] items-center text-xs border rounded-xl px-2 py-2 transition-colors ${isAdvancing ? 'bg-orange-50/50 border-orange-200' : 'bg-slate-50/30 border-slate-50'}`}>
                                                        <span className={`h-5 w-5 flex items-center justify-center rounded-full text-[9px] font-black ${isAdvancing ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{idx + 1}</span>
                                                        <span className={`font-bold truncate pr-2 ${isAdvancing ? 'text-slate-900' : 'text-slate-700'}`}>{row.team.name}</span>
                                                        <span className="text-center text-slate-500 font-semibold">{row.played}</span>
                                                        <span className="text-center text-slate-500 font-semibold">{row.goal_difference}</span>
                                                        <span className="text-center font-black text-orange-600">{row.points}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {group.advance_count > 0 && (
                                            <div className="mt-4 pt-4 border-t border-slate-50">
                                                <p className="text-[8px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-1">
                                                    <Zap className="h-3 w-3" /> İLK {group.advance_count} TAKIM ÜST TURA ÇIKAR
                                                </p>
                                            </div>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Column 2: Last Matches (Fixtures) */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between border-l-4 border-slate-900 pl-4">
                                <h2 className="text-2xl font-black uppercase tracking-tighter">SON SONUÇLAR</h2>
                            </div>
                            <div className="bg-white border border-orange-100 rounded-[2rem] p-6 shadow-sm space-y-4">
                                {(groupFixtures || []).slice(0, 8).map((game, idx) => {
                                    const dateMeta = getMatchDateMeta(game.scheduled_at);
                                    return (
                                        <div key={idx} className="border-b border-slate-50 last:border-none pb-4 last:pb-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{game.group}</span>
                                                <span className="text-[9px] font-bold text-orange-600 uppercase">{dateMeta.fullDate}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="flex-1 text-xs font-bold text-slate-800 text-right truncate">{game.home_team}</span>
                                                <div className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-1 rounded-lg min-w-[45px] text-center">
                                                    {game.status === 'completed' ? `${game.home_score}-${game.away_score}` : dateMeta.time}
                                                </div>
                                                <span className="flex-1 text-xs font-bold text-slate-800 text-left truncate">{game.away_team}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <Link href="/games">
                                    <Button variant="ghost" className="w-full text-slate-400 font-black text-[10px] tracking-widest hover:text-orange-600 mt-4">TÜM FİKSTÜR</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Statistics Symmetry (3 Columns - Light Theme) */}
                <section className="bg-orange-50/50 border-y border-orange-100 py-24 px-6">
                    <div className="container mx-auto max-w-7xl">
                        <div className="text-center mb-16">
                            <Badge className="bg-orange-600 text-white border-none mb-4 px-4 py-1">PREMİUM STATS</Badge>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-slate-900">TURNUVA LİDERLERİ</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Summary */}
                            <Card className="bg-white border-orange-100 rounded-[2rem] p-8 shadow-sm flex flex-col h-full">
                                <h3 className="text-orange-600 font-black uppercase tracking-[0.2em] text-[10px] mb-8 flex items-center">
                                    <Zap className="mr-2 h-4 w-4" /> GENEL ÖZET
                                </h3>
                                <div className="space-y-6 flex-1">
                                    {[
                                        { label: 'Toplam Gol', value: homepageStats?.summary?.total_goals ?? 0 },
                                        { label: 'Maç Başı Ort.', value: homepageStats?.summary?.avg_goals ?? 0 },
                                        { label: 'Kart Sayısı', value: homepageStats?.summary?.total_cards ?? 0, color: 'text-orange-600' },
                                        { label: 'Oynanan Maç', value: homepageStats?.summary?.played_matches ?? 0 }
                                    ].map((s, i) => (
                                        <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-none">
                                            <span className="text-slate-500 text-sm font-bold">{s.label}</span>
                                            <span className={`text-2xl font-black tabular-nums ${s.color || 'text-slate-900'}`}>{s.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Scorers */}
                            <Card className="bg-white border-orange-100 rounded-[2rem] p-8 shadow-sm flex flex-col h-full">
                                <h3 className="text-orange-600 font-black uppercase tracking-[0.2em] text-[10px] mb-8 flex items-center">
                                    <Trophy className="mr-2 h-4 w-4" /> GOL KRALLIĞI
                                </h3>
                                <div className="space-y-4 flex-1">
                                    {(homepageStats?.topScorers ?? []).map((p, i) => (
                                        <div key={i} className="flex items-center justify-between bg-slate-50/50 rounded-2xl p-3 border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <span className="h-6 w-6 flex items-center justify-center bg-orange-600 text-white rounded-full text-[9px] font-black">{i + 1}</span>
                                                <span className="text-sm font-bold text-slate-700">{p.name}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">{p.goals} GOL</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Assists */}
                            <Card className="bg-white border-orange-100 rounded-[2rem] p-8 shadow-sm flex flex-col h-full">
                                <h3 className="text-orange-600 font-black uppercase tracking-[0.2em] text-[10px] mb-8 flex items-center">
                                    <Star className="mr-2 h-4 w-4" /> ASİST KRALLIĞI
                                </h3>
                                <div className="space-y-4 flex-1">
                                    {(homepageStats?.topAssists ?? []).map((p, i) => (
                                        <div key={i} className="flex items-center justify-between bg-slate-50/50 rounded-2xl p-3 border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <span className="h-6 w-6 flex items-center justify-center bg-slate-900 text-white rounded-full text-[9px] font-black">{i + 1}</span>
                                                <span className="text-sm font-bold text-slate-700">{p.name}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{p.assists} ASİST</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Big Stats Ribbon */}
                <section className="py-32 px-6">
                    <div className="container mx-auto max-w-5xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="flex flex-col items-center text-center gap-4">
                                    <div className="h-24 w-24 rounded-[2rem] bg-white border border-orange-100 flex items-center justify-center shadow-sm mb-2">
                                        <stat.icon className="h-10 w-10 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-5xl font-black text-slate-900 mb-1">{stat.value}</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-50 border-t border-slate-200 py-20 px-6">
                <div className="container mx-auto max-w-7xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-orange-600 rounded-xl flex items-center justify-center">
                                    <Trophy className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-xl font-black uppercase tracking-tighter text-slate-900">KARAYOLLARI <span className="text-orange-600">TURNUVA</span></span>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">© 2026 KGM 5.BÖLGE MÜDÜRLÜĞÜ</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <a href="#" className="hover:text-orange-600 transition-colors">KURALLAR</a>
                            <a href="#" className="hover:text-orange-600 transition-colors">GİZLİLİK</a>
                            <a href="#" className="hover:text-orange-600 transition-colors">DESTEK</a>
                            <a href="#" className="hover:text-orange-600 transition-colors">KGM WEB</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
