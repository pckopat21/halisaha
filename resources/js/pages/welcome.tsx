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
    Calendar,
    MapPin,
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
    liveMatches: Array<{
        id: number;
        group: string;
        home_team: string;
        away_team: string;
        home_score: number;
        away_score: number;
        minute: number;
        field?: string;
    }>;
    lastResults: Array<{
        group: string;
        home_team: string;
        away_team: string;
        scheduled_at: string | null;
        status: string;
        home_score: number | null;
        away_score: number | null;
        field?: string | null;
    }>;
    upcomingFixtures: Array<{
        group: string;
        home_team: string;
        away_team: string;
        scheduled_at: string | null;
        status: string;
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
    liveMatches = [],
    lastResults = [], 
    upcomingFixtures = [],
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

                {/* Live Matches Section (Symmetrical Karayolları Style) */}
                {liveMatches.length > 0 && (
                    <section className="container mx-auto px-6 mb-24 max-w-7xl relative z-30">
                        <div className="flex items-center gap-3 mb-10 border-l-4 border-orange-600 pl-4">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-600"></span>
                            </span>
                            <h2 className="text-2xl font-black uppercase tracking-tighter">CANLI MAÇ MERKEZİ</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {liveMatches.map((match) => (
                                <Link key={match.id} href={`/games/${match.id}`} className="group">
                                    <Card className="border-orange-200 bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl shadow-orange-600/5 hover:border-orange-600 transition-all duration-500 overflow-hidden relative border-2">
                                        {/* Decorative Pulse Background */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent pointer-events-none" />
                                        
                                        <div className="relative z-10 flex flex-col gap-6">
                                            {/* Top Metadata */}
                                            <div className="flex items-center justify-between pb-4 border-b border-orange-100">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{match.group}</span>
                                                <div className="flex items-center gap-2 bg-orange-600 text-white px-3 py-1 rounded-full shadow-md shadow-orange-600/20">
                                                    <span className="text-[11px] font-black tabular-nums">{match.minute}'</span>
                                                </div>
                                            </div>

                                            {/* Symmetrical Match UI */}
                                            <div className="flex items-center justify-between gap-4">
                                                {/* Home Team */}
                                                <div className="flex-1 flex flex-col items-center gap-3">
                                                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500">
                                                        <span className="text-2xl font-black">{match.home_team.charAt(0)}</span>
                                                    </div>
                                                    <span className="text-sm font-black text-slate-900 uppercase tracking-tighter text-center">{match.home_team}</span>
                                                </div>

                                                {/* Score Central */}
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="bg-slate-900 text-white px-6 py-4 rounded-[1.5rem] flex items-center gap-4 shadow-xl">
                                                        <span className="text-4xl font-black tabular-nums">{match.home_score}</span>
                                                        <span className="text-2xl font-black text-orange-500">:</span>
                                                        <span className="text-4xl font-black tabular-nums">{match.away_score}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
                                                        <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">CANLI</span>
                                                    </div>
                                                </div>

                                                {/* Away Team */}
                                                <div className="flex-1 flex flex-col items-center gap-3">
                                                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500">
                                                        <span className="text-2xl font-black">{match.away_team.charAt(0)}</span>
                                                    </div>
                                                    <span className="text-sm font-black text-slate-900 uppercase tracking-tighter text-center">{match.away_team}</span>
                                                </div>
                                            </div>

                                            {/* Footer Info */}
                                            <div className="flex items-center justify-center pt-4 border-t border-orange-100">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Zap className="h-3 w-3 text-orange-600" /> {match.field || 'Merkez Saha'}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Next Match Section (Card Compatible Style) - Only if no live matches */}
                {nextMatch && liveMatches.length === 0 && (
                    <section className="container mx-auto px-6 mb-24 max-w-7xl relative z-30">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-10 border-l-0 md:border-l-4 border-orange-600 pl-0 md:pl-4 text-center md:text-left">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">SIRADAKİ HEYECAN</h2>
                        </div>
                        
                        <div className="flex justify-center w-full">
                            <div className="w-full max-w-2xl lg:max-w-3xl">
                                <Card className="border-orange-200 bg-white/80 backdrop-blur-md rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-orange-600/5 border-2 relative overflow-hidden group">
                                    {/* Decorative Background Icon */}
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
                                        <Trophy className="h-48 w-48 -mr-12 -mt-12" />
                                    </div>
                                    
                                    <div className="relative z-10 flex flex-col gap-6 md:gap-8">
                                        {/* Top Info */}
                                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-orange-100">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-orange-600" />
                                                <span className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">
                                                    {getMatchDateMeta(nextMatch.scheduled_at).dayLabel} • {getMatchDateMeta(nextMatch.scheduled_at).time}
                                                </span>
                                            </div>
                                            <Badge variant="outline" className="border-orange-600/20 text-orange-600 font-black text-[8px] md:text-[9px] uppercase tracking-widest bg-orange-600/5 px-3 py-1">
                                                YAKLAŞAN MAÇ
                                            </Badge>
                                        </div>

                                        {/* Symmetrical Teams UI - Responsive Stack */}
                                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
                                            {/* Home Team */}
                                            <div className="flex-1 flex flex-col items-center gap-3 md:gap-4 w-full">
                                                <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-50 rounded-2xl md:rounded-3xl flex items-center justify-center border border-orange-100 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                                    <span className="text-2xl md:text-3xl font-black">{nextMatch.home_team.charAt(0)}</span>
                                                </div>
                                                <span className="text-base md:text-xl font-black text-slate-900 uppercase tracking-tighter text-center">{nextMatch.home_team}</span>
                                            </div>

                                            {/* VS Central */}
                                            <div className="flex flex-row md:flex-col items-center gap-4 md:gap-3">
                                                <div className="hidden md:block h-1 w-12 bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
                                                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-900 text-white rounded-full flex items-center justify-center text-lg md:text-2xl font-black shadow-xl ring-4 ring-orange-50 shrink-0">
                                                    VS
                                                </div>
                                                <div className="hidden md:block h-1 w-12 bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
                                            </div>

                                            {/* Away Team */}
                                            <div className="flex-1 flex flex-col items-center gap-3 md:gap-4 w-full">
                                                <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-50 rounded-2xl md:rounded-3xl flex items-center justify-center border border-orange-100 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                                    <span className="text-2xl md:text-3xl font-black">{nextMatch.away_team.charAt(0)}</span>
                                                </div>
                                                <span className="text-base md:text-xl font-black text-slate-900 uppercase tracking-tighter text-center">{nextMatch.away_team}</span>
                                            </div>
                                        </div>

                                        {/* Footer Info */}
                                        <div className="flex items-center justify-center pt-6 border-t border-orange-100">
                                            <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-orange-600" /> {nextMatch.field || 'Merkez Saha'}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </section>
                )}

                {/* Standings Grid Section */}
                <section className="container mx-auto px-6 mb-32 max-w-7xl relative z-10">
                    <div className="flex items-center justify-between border-l-4 border-orange-600 pl-4 mb-12">
                        <h2 className="text-3xl font-black uppercase tracking-tighter">GRUP PUAN DURUMLARI</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {groupStandings?.map((group) => (
                            <Card key={group.name} className="border-orange-100 bg-white rounded-[2.5rem] p-8 shadow-sm flex flex-col h-full hover:shadow-xl transition-all duration-500">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-black text-orange-600 uppercase tracking-widest text-xs">{group.name}</h3>
                                    <Badge variant="secondary" className="bg-orange-50 text-orange-700 font-bold text-[9px] border-none">{group.rows.length} TAKIM</Badge>
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="grid grid-cols-[25px_1fr_30px_30px_30px] text-[9px] font-black text-slate-400 uppercase px-2 mb-2">
                                        <span>#</span><span>TAKIM</span><span className="text-center">O</span><span className="text-center">A</span><span className="text-center text-orange-600">P</span>
                                    </div>
                                    {group.rows.map((row, idx) => {
                                        const isAdvancing = idx < group.advance_count;
                                        return (
                                            <div key={idx} className={`grid grid-cols-[25px_1fr_30px_30px_30px] items-center text-xs border rounded-xl px-2 py-2.5 transition-colors ${isAdvancing ? 'bg-orange-50/50 border-orange-100' : 'bg-slate-50/30 border-slate-50'}`}>
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
                                    <div className="mt-6 pt-6 border-t border-slate-50">
                                        <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
                                            <Zap className="h-4 w-4" /> İLK {group.advance_count} TAKIM ÜST TURA ÇIKAR
                                        </p>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Symmetrical Results & Upcoming Section */}
                <section className="container mx-auto px-6 mb-32 max-w-7xl relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Column 1: Last Results */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between border-l-4 border-slate-900 pl-4">
                                <h2 className="text-2xl font-black uppercase tracking-tighter">SON SONUÇLAR</h2>
                                <Link href="/games" className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline">TÜMÜ</Link>
                            </div>
                            <div className="bg-white border border-orange-100 rounded-[2.5rem] p-8 shadow-sm space-y-4">
                                {lastResults.length > 0 ? lastResults.map((game, idx) => {
                                    const dateMeta = getMatchDateMeta(game.scheduled_at);
                                    return (
                                        <div key={idx} className="border-b border-slate-50 last:border-none pb-4 last:pb-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{game.group}</span>
                                                <span className="text-[9px] font-bold text-orange-600 uppercase">{dateMeta.fullDate}</span>
                                            </div>
                                            <div className="grid grid-cols-[1fr_50px_1fr] items-center gap-4">
                                                <span className="text-xs font-bold text-slate-800 text-right truncate">{game.home_team}</span>
                                                <div className="bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-lg text-center">
                                                    {game.home_score}-{game.away_score}
                                                </div>
                                                <span className="text-xs font-bold text-slate-800 text-left truncate">{game.away_team}</span>
                                            </div>
                                        </div>
                                    )
                                }) : (
                                    <p className="text-center text-slate-400 py-12 text-sm font-medium italic">Henüz tamamlanan maç yok.</p>
                                )}
                            </div>
                        </div>

                        {/* Column 2: Upcoming Matches */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between border-l-4 border-orange-600 pl-4">
                                <h2 className="text-2xl font-black uppercase tracking-tighter">GELECEK MAÇLAR</h2>
                                <Link href="/games" className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline">FİKSTÜR</Link>
                            </div>
                            <div className="bg-white border border-orange-100 rounded-[2.5rem] p-8 shadow-sm space-y-4">
                                {upcomingFixtures.length > 0 ? upcomingFixtures.map((game, idx) => {
                                    const dateMeta = getMatchDateMeta(game.scheduled_at);
                                    return (
                                        <div key={idx} className="border-b border-slate-50 last:border-none pb-4 last:pb-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{game.group}</span>
                                                <span className="text-[9px] font-bold text-orange-600 uppercase">{dateMeta.dayLabel === 'Bugun' ? 'BUGÜN' : dateMeta.fullDate}</span>
                                            </div>
                                            <div className="grid grid-cols-[1fr_60px_1fr] items-center gap-4">
                                                <span className="text-xs font-bold text-slate-800 text-right truncate">{game.home_team}</span>
                                                <div className="bg-orange-50 text-orange-600 text-[10px] font-black px-2 py-1 rounded-lg text-center border border-orange-100">
                                                    {dateMeta.time}
                                                </div>
                                                <span className="text-xs font-bold text-slate-800 text-left truncate">{game.away_team}</span>
                                            </div>
                                        </div>
                                    )
                                }) : (
                                    <p className="text-center text-slate-400 py-12 text-sm font-medium italic">Planlanmış maç bulunmuyor.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Statistics Symmetry (3 Columns - Light Theme) */}
                <section className="bg-orange-50/50 border-y border-orange-100 py-24 px-6 relative z-10">
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
                <section className="py-32 px-6 relative z-10">
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
            <footer className="bg-slate-50 border-t border-slate-200 py-20 px-6 relative z-10">
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
