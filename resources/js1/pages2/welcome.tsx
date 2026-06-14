import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    Trophy,
    Users,
    ArrowRight,
    Flame,
    LayoutDashboard,
    Zap,
    Shield,
    Star,
    Calendar,
    MapPin,
    Tv,
    Image as ImageIcon,
    Activity,
    ChevronRight,
    TrendingUp,
    Target,
    Play,
    X,
    ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isValid } from 'date-fns';
import { tr } from 'date-fns/locale/tr';

interface Player {
    id: number;
    first_name: string;
    last_name: string;
    is_captain?: boolean;
}

interface Team {
    id: number;
    name: string;
    unit?: { name: string };
    players?: Player[];
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
        group: any;
        home_team: any;
        away_team: any;
        home_score: number;
        away_score: number;
        minute: number;
        current_minute?: number;
        field?: any;
        live_stream_url?: string | null;
        homeTeam?: any;
        awayTeam?: any;
    }>;
    lastResults: Array<{
        id: number;
        group: any;
        home_team: any;
        away_team: any;
        scheduled_at: string | null;
        status: string;
        home_score: number | null;
        away_score: number | null;
        field?: any;
        live_stream_url?: string | null;
        homeTeam?: any;
        awayTeam?: any;
    }>;
    upcomingFixtures: Array<{
        id?: number;
        group: any;
        home_team: any;
        away_team: any;
        scheduled_at: string | null;
        status: string;
        field?: any;
        homeTeam?: any;
        awayTeam?: any;
    }>;
    homepageStats: {
        summary: {
            total_goals: number;
            avg_goals: number;
            total_matches: number;
            played_matches: number;
            total_cards: number;
        };
        topScorers: Array<{ name: string; goals: number; team_name?: string }>;
        topAssists: Array<{ name: string; assists: number; team_name?: string }>;
    } | null;
    totalStats: {
        approvedTeams: number;
        activePlayers: number;
        totalMatches: number;
    };
    announcements?: any[];
    galleries?: any[];
    predictionLeaderboard?: any[];
    userPredictions?: any[];
    nextMatch: {
        id?: number;
        home_team: any;
        away_team: any;
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
    announcements = [],
    galleries = [],
    predictionLeaderboard = [],
    nextMatch = null,
    userPredictions = [],
    auth 
}: PageProps) {
    const [scrolled, setScrolled] = useState(false);
    const [predictingGame, setPredictingGame] = useState<any | null>(null);
    const [liveStreamMatch, setLiveStreamMatch] = useState<any | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [predictionError, setPredictionError] = useState<string | null>(null);
    const [viewingLeader, setViewingLeader] = useState<any | null>(null);
    const [leaderPredictions, setLeaderPredictions] = useState<any[]>([]);
    const [loadingLeaderPredictions, setLoadingLeaderPredictions] = useState(false);

    const predictionForm = useForm({
        game_id: '',
        home_score: '',
        away_score: '',
    });

    const predictionsMap = useMemo(() => {
        const map: Record<number, any> = {};
        (userPredictions || []).forEach((p: any) => { map[p.game_id] = p; });
        return map;
    }, [userPredictions]);

    const getExistingPrediction = (gameId: number | undefined) => gameId ? predictionsMap[gameId] : null;

    const openPredictionModal = (game: any) => {
        const existing = getExistingPrediction(game?.id);
        predictionForm.setData({
            game_id: String(game?.id || ''),
            home_score: existing ? String(existing.home_score) : '',
            away_score: existing ? String(existing.away_score) : '',
        });
        setPredictingGame(game);
    };

    useEffect(() => {
        setIsMounted(true);
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handlePredictionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!predictingGame?.id || !auth?.user || submitting) return;
        setPredictionError(null);
        setSubmitting(true);
        router.post('/predictions', {
            game_id: predictingGame.id,
            home_score: parseInt(predictionForm.data.home_score) || 0,
            away_score: parseInt(predictionForm.data.away_score) || 0,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setPredictingGame(null);
                predictionForm.reset();
                setSubmitting(false);
            },
            onError: (errors: any) => {
                setPredictionError(Object.values(errors).flat().join(', '));
                setSubmitting(false);
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const fetchLeaderPredictions = async (user: any) => {
        setViewingLeader(user);
        setLoadingLeaderPredictions(true);
        try {
            const response = await fetch(`/predictions/user/${user.id}`);
            const data = await response.json();
            setLeaderPredictions(data.predictions);
        } catch (error) {
            console.error('Leader predictions fetch error:', error);
        } finally {
            setLoadingLeaderPredictions(false);
        }
    };

    const getTeamName = (team: any) => {
        if (!team) return '-';
        if (typeof team === 'string') return team;
        return team?.name || '-';
    };

    const getTeamInitial = (team: any) => {
        const name = getTeamName(team);
        return name?.charAt(0).toUpperCase() || '-';
    };

    const getMatchDateMeta = (dateString: string | null) => {
        if (!dateString) return { dayLabel: 'Tarih Yok', fullDate: '-', time: '-' };
        const matchDate = new Date(dateString);
        if (isNaN(matchDate.getTime())) return { dayLabel: 'Geçersiz Tarih', fullDate: '-', time: '-' };
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
        let dayLabel = 'İleri Tarih';
        if (isSameDay(matchDate, today)) dayLabel = 'Bugün';
        else if (isSameDay(matchDate, tomorrow)) dayLabel = 'Yarın';
        return {
            dayLabel,
            time: matchDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            fullDate: matchDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })
        };
    };

    const getYoutubeEmbedUrl = (url: string | null | undefined): string | null => {
        if (!url) return null;
        try {
            const urlObj = new URL(url);
            let videoId: string | null = null;
            if (urlObj.hostname.includes('youtube.com')) {
                videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop() || null;
            } else if (urlObj.hostname.includes('youtu.be')) {
                videoId = urlObj.pathname.slice(1);
            }
            if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
            return url;
        } catch {
            return url;
        }
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-[#fafafa] text-slate-900 selection:bg-orange-500 selection:text-white font-sans overflow-x-hidden">
            <Head title={activeTournament?.name || "Birimler Arası Halı Saha Turnuvası - KGM Arena"} />
            
            {/* Global Background Elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-orange-200/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-blue-100/10 blur-[120px] rounded-full" />
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
                                <>GÜCÜNÜ <br /> <span className="text-orange-600">GÖSTER</span></>
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

                {/* Canlı Maç Merkezi - Ayrı Bölüm */}
                {((liveMatches || []).length > 0 || (upcomingFixtures || []).length > 0) && (
                    <section className="container mx-auto px-6 mb-32 max-w-7xl relative z-30">
                        <div className="flex items-center gap-3 border-l-4 border-orange-600 pl-4 mb-12">
                            <h2 className="text-3xl font-black uppercase tracking-tighter">{(liveMatches || []).length > 0 ? 'CANLI MAÇ MERKEZİ' : 'SIRADAKİ HEYECAN'}</h2>
                        </div>

                        {(liveMatches || []).length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {liveMatches.map((match) => (
                                    <div key={match?.id} className="group/card">
                                        <Link href={`/games/${match?.id}`}>
                                            <Card className="border-orange-200 bg-white/80 backdrop-blur-md rounded-2xl md:rounded-[2rem] px-3 py-5 md:p-6 shadow-xl shadow-orange-600/5 hover:border-orange-600 transition-all border-2 relative cursor-pointer hover:shadow-2xl hover:scale-[1.01]">
                                                <div className="flex flex-col gap-3 md:gap-4">
                                                    <div className="flex items-center justify-between pb-3 border-b border-orange-100">
                                                        <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{typeof match?.group === 'object' ? match?.group?.name : match?.group || 'Grup'}</span>
                                                        <div className="flex items-center gap-2">
                                                            <Badge className="bg-orange-600 text-white px-3 py-0.5 rounded-full font-black tabular-nums text-[10px]">{match?.current_minute || match?.minute || '0'}'</Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 md:gap-4">
                                                        <div className="flex-1 text-right min-w-0">
                                                            <span className="text-[10px] md:text-sm font-black uppercase leading-tight block truncate">{getTeamName(match?.home_team || match?.homeTeam)}</span>
                                                        </div>
                                                        <div className="flex flex-col items-center gap-1 shrink-0">
                                                            <div className="bg-slate-900 text-white px-3 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-4 shadow-xl border border-white/10">
                                                                <span className="text-xl md:text-3xl font-black tabular-nums">{match?.home_score ?? 0}</span>
                                                                <span className="text-sm md:text-xl font-black text-orange-500">:</span>
                                                                <span className="text-xl md:text-3xl font-black tabular-nums">{match?.away_score ?? 0}</span>
                                                            </div>
                                                            <span className="text-[8px] font-black text-orange-600 animate-pulse uppercase tracking-widest">CANLI</span>
                                                        </div>
                                                        <div className="flex-1 text-left min-w-0">
                                                            <span className="text-[10px] md:text-sm font-black uppercase leading-tight block truncate">{getTeamName(match?.away_team || match?.awayTeam)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                        {match?.live_stream_url && (
                                            <Button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiveStreamMatch(match); }}
                                                className="w-full mt-2 h-10 md:h-11 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-[9px] md:text-[10px] rounded-xl md:rounded-2xl shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                                            >
                                                <Play className="h-3.5 w-3.5 fill-current" />
                                                <span>CANLI İZLE</span>
                                                <Tv className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {(upcomingFixtures || []).slice(0, 2).map((game, idx) => {
                                    const dateMeta = getMatchDateMeta(game?.scheduled_at);
                                    const existingPred = getExistingPrediction(game?.id);
                                    return (
                                        <Card key={idx} className="border-orange-100 bg-white/80 backdrop-blur-md rounded-2xl md:rounded-[2rem] px-3 py-5 md:p-6 shadow-sm hover:shadow-lg transition-all border">
                                            <div className="flex flex-col gap-3 md:gap-4">
                                                <div className="flex items-center justify-between pb-3 border-b border-orange-50">
                                                    <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{typeof game?.group === 'object' ? game?.group?.name : game?.group || 'Grup'}</span>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-3 w-3 text-orange-500" />
                                                        <span className="text-[9px] md:text-[10px] font-bold text-orange-600 uppercase">{dateMeta.dayLabel === 'Bugün' ? 'BUGÜN' : dateMeta.fullDate}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 md:gap-4">
                                                    <div className="flex-1 text-right min-w-0">
                                                        <span className="text-[10px] md:text-sm font-black uppercase leading-tight block truncate">{getTeamName(game?.home_team || game?.homeTeam)}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1 shrink-0">
                                                        <div className="bg-orange-50 text-orange-600 px-2.5 md:px-4 py-1.5 rounded-lg flex items-center gap-1.5 border border-orange-100 shadow-sm">
                                                            <span className="text-[10px] md:text-sm font-black tabular-nums">{dateMeta.time}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 text-left min-w-0">
                                                        <span className="text-[10px] md:text-sm font-black uppercase leading-tight block truncate">{getTeamName(game?.away_team || game?.awayTeam)}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => openPredictionModal(game)}
                                                    className={`flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all hover:scale-[1.02] cursor-pointer ${
                                                        existingPred
                                                            ? 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700'
                                                            : 'bg-slate-900 hover:bg-orange-600 border-transparent text-white shadow-lg'
                                                    }`}
                                                >
                                                    <Target className="h-3.5 w-3.5" />
                                                    <span>{existingPred ? 'Tahmini Görüntüle / Güncelle' : 'Skor Tahmini Yap'}</span>
                                                </button>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}

                {/* Duyurular - Ayrı Bölüm */}
                {(announcements || []).length > 0 && (
                    <section className="container mx-auto px-6 mb-32 max-w-7xl relative z-30">
                        <div className="flex items-center gap-3 border-l-4 border-slate-950 pl-4 mb-12">
                            <h2 className="text-3xl font-black uppercase tracking-tighter">DUYURULAR</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(announcements || []).slice(0, 3).map((ann, idx) => (
                                <Card key={idx} className="border-orange-100 bg-white/80 backdrop-blur-md rounded-2xl md:rounded-[2rem] p-5 md:p-6 shadow-sm hover:shadow-md transition-all border-l-4 border-l-orange-600">
                                    <div className="flex justify-between items-center mb-3">
                                        <Badge className="bg-orange-600/10 text-orange-600 border-none text-[8px] font-black px-3 py-1">YENİ</Badge>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">
                                            {ann?.published_at ? format(new Date(ann.published_at), 'd MMMM', { locale: tr }) : '-'}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-black uppercase mb-2 leading-tight">{ann?.title || 'Duyuru'}</h3>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{ann?.content || ''}</p>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}

                <section className="container mx-auto px-6 mb-32 max-w-7xl relative z-10">
                    <div className="flex items-center justify-between border-l-4 border-orange-600 pl-4 mb-12">
                        <h2 className="text-3xl font-black uppercase tracking-tighter">GRUP PUAN DURUMLARI</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(groupStandings || []).map((group) => (
                            <Card key={group?.name} className="border-orange-100 bg-white rounded-[2.5rem] p-8 shadow-sm flex flex-col h-full hover:shadow-xl transition-all duration-500">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-black text-orange-600 uppercase tracking-widest text-xs">{group?.name || 'Grup'}</h3>
                                    <Badge variant="secondary" className="bg-orange-50 text-orange-700 font-bold text-[9px] border-none">İLK {group?.advance_count ?? 0} TUR ATLAR</Badge>
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="grid grid-cols-[25px_1fr_30px_30px_30px] text-[9px] font-black text-slate-400 uppercase px-2 mb-2">
                                        <span>#</span><span>TAKIM</span><span className="text-center">O</span><span className="text-center">A</span><span className="text-center text-orange-600 font-black">P</span>
                                    </div>
                                    {(group?.rows || []).map((row, idx) => {
                                        const isAdvancing = idx < group.advance_count;
                                        return (
                                            <div key={idx} className={`grid grid-cols-[25px_1fr_30px_30px_30px] items-center text-xs border rounded-xl px-2 py-2.5 transition-colors ${isAdvancing ? 'bg-orange-50/50 border-orange-100' : 'bg-slate-50/30 border-slate-50'}`}>
                                                <span className={`h-5 w-5 flex items-center justify-center rounded-full text-[9px] font-black ${isAdvancing ? 'bg-orange-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500'}`}>{idx + 1}</span>
                                                <span className={`font-bold truncate pr-2 ${isAdvancing ? 'text-slate-900' : 'text-slate-700'}`}>{row?.team?.name || 'Takım'}</span>
                                                <span className="text-center text-slate-500 font-semibold">{row?.played ?? 0}</span>
                                                <span className="text-center text-slate-500 font-semibold">{row?.goal_difference ?? 0}</span>
                                                <span className="text-center font-black text-orange-600">{row?.points ?? 0}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

                <section className="container mx-auto px-6 mb-32 max-w-7xl relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <div className="flex items-center justify-between border-l-4 border-slate-900 pl-4">
                                <h2 className="text-2xl font-black uppercase tracking-tighter">SON SONUÇLAR</h2>
                                <Link href="/games" className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline">TÜMÜ</Link>
                            </div>
                            <div className="bg-white border border-orange-100 rounded-[2.5rem] p-8 shadow-sm space-y-4">
                                {(lastResults || []).length > 0 ? lastResults.map((game, idx) => {
                                    const dateMeta = getMatchDateMeta(game?.scheduled_at);
                                    return (
                                        <div key={idx} className="border-b border-slate-50 last:border-none pb-4 last:pb-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{typeof game?.group === 'object' ? game?.group?.name : game?.group || 'Grup'}</span>
                                                <span className="text-[9px] font-bold text-orange-600 uppercase">{dateMeta.fullDate}</span>
                                            </div>
                                            <Link href={`/games/${game?.id}`}>
                                                <div className="flex items-center justify-between mb-2 hover:bg-slate-50 rounded-xl px-1 py-1 -mx-1 transition-colors cursor-pointer">
                                                    <div className="grid grid-cols-[1fr_50px_1fr] items-center gap-4 flex-1">
                                                        <span className="text-xs font-bold text-slate-800 text-right truncate">{getTeamName(game?.home_team || game?.homeTeam)}</span>
                                                        <div className="bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-lg text-center">
                                                            {game?.home_score ?? 0}-{game?.away_score ?? 0}
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-800 text-left truncate">{getTeamName(game?.away_team || game?.awayTeam)}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                            {game?.live_stream_url && (
                                                <button
                                                    onClick={() => setLiveStreamMatch(game)}
                                                    className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 transition-colors cursor-pointer"
                                                >
                                                    <Play className="h-3 w-3 fill-current" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Maçı İzle</span>
                                                </button>
                                            )}
                                        </div>
                                    )
                                }) : (
                                    <p className="text-center text-slate-400 py-12 text-sm font-medium italic text-[10px] uppercase">Henüz tamamlanan maç yok.</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center justify-between border-l-4 border-orange-600 pl-4">
                                <h2 className="text-2xl font-black uppercase tracking-tighter">GELECEK MAÇLAR</h2>
                                <Link href="/games" className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline">FİKSTÜR</Link>
                            </div>
                            <div className="bg-white border border-orange-100 rounded-[2.5rem] p-8 shadow-sm space-y-4">
                                {(upcomingFixtures || []).length > 0 ? upcomingFixtures.map((game, idx) => {
                                    const dateMeta = getMatchDateMeta(game?.scheduled_at);
                                    return (
                                        <div key={idx} className="border-b border-slate-50 last:border-none pb-4 last:pb-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{typeof game?.group === 'object' ? game?.group?.name : game?.group || 'Grup'}</span>
                                                <span className="text-[9px] font-bold text-orange-600 uppercase">{dateMeta.dayLabel === 'Bugün' ? 'BUGÜN' : dateMeta.fullDate}</span>
                                            </div>
                                            <div className="grid grid-cols-[1fr_60px_1fr] items-center gap-4">
                                                <span className="text-xs font-bold text-slate-800 text-right truncate">{getTeamName(game?.home_team || game?.homeTeam)}</span>
                                                <div className="bg-orange-50 text-orange-600 text-[10px] font-black px-2 py-1 rounded-lg text-center border border-orange-100">
                                                    {dateMeta.time}
                                                </div>
                                                <span className="text-xs font-bold text-slate-800 text-left truncate">{getTeamName(game?.away_team || game?.awayTeam)}</span>
                                            </div>
                                            <button
                                                onClick={() => openPredictionModal(game)}
                                                className={`flex items-center justify-center gap-1.5 w-full mt-2 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                                                    getExistingPrediction(game?.id)
                                                        ? 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700'
                                                        : 'bg-orange-50 hover:bg-orange-100 border-orange-100 text-orange-600'
                                                }`}
                                            >
                                                <Target className="h-3 w-3" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">
                                                    {getExistingPrediction(game?.id) ? 'Tahmini Görüntüle / Güncelle' : 'Tahmin Yap'}
                                                </span>
                                            </button>
                                        </div>
                                    )
                                }) : (
                                    <p className="text-center text-slate-400 py-12 text-sm font-medium italic text-[10px] uppercase">Planlanmış maç bulunmuyor.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-orange-50/50 border-y border-orange-100 py-32 px-6 relative z-10">
                    <div className="container mx-auto max-w-7xl">
                        <div className="text-center mb-20">
                            <Badge className="bg-orange-600 text-white border-none mb-4 px-10 py-2.5 rounded-full uppercase font-black text-[10px] tracking-[0.4em]">ARENA ANALYTICS</Badge>
                            <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter text-slate-900">TURNUVA LİDERLERİ</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Card className="bg-white border-none rounded-[2.5rem] p-10 shadow-xl shadow-orange-600/5 flex flex-col h-full border-t-4 border-slate-900">
                                <h3 className="text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] mb-10 flex items-center">
                                    <Zap className="mr-3 h-5 w-5 text-orange-600" /> GENEL ÖZET
                                </h3>
                                <div className="space-y-8 flex-1">
                                    {[
                                        { label: 'Toplam Gol', value: homepageStats?.summary?.total_goals ?? 0, icon: Target },
                                        { label: 'Maç Başı Ort.', value: homepageStats?.summary?.avg_goals ?? 0, icon: Activity },
                                        { label: 'Kart Sayısı', value: homepageStats?.summary?.total_cards ?? 0, color: 'text-orange-600', icon: Shield },
                                        { label: 'Oynanan Maç', value: homepageStats?.summary?.played_matches ?? 0, icon: Calendar }
                                    ].map((s, i) => (
                                        <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-6 last:border-none">
                                            <div className="flex items-center gap-3">
                                                <s.icon className="h-4 w-4 text-slate-300" />
                                                <span className="text-slate-500 text-sm font-bold uppercase tracking-widest text-[10px]">{s.label}</span>
                                            </div>
                                            <span className={`text-3xl font-black tabular-nums ${s.color || 'text-slate-900'}`}>{s.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <Card className="bg-white border-none rounded-[2.5rem] p-10 shadow-xl shadow-orange-600/5 flex flex-col h-full border-t-4 border-orange-600">
                                <h3 className="text-orange-600 font-black uppercase tracking-[0.2em] text-[10px] mb-10 flex items-center">
                                    <Trophy className="mr-3 h-5 w-5" /> GOL KRALLIĞI
                                </h3>
                                <div className="space-y-6 flex-1">
                                    {(homepageStats?.topScorers || []).map((p, i) => (
                                        <div key={i} className="flex items-center justify-between bg-slate-50/50 rounded-2xl p-4 border border-slate-100 hover:bg-orange-50/50 transition-all">
                                            <div className="flex items-center gap-4">
                                                <span className="h-10 w-10 flex items-center justify-center bg-orange-600 text-white rounded-xl text-[14px] font-black shadow-lg shadow-orange-600/20">
                                                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                                                </span>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black uppercase text-slate-900">{p?.name || 'Oyuncu'}</span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{p?.team_name || 'KGM Birimi'}</span>
                                                </div>
                                            </div>
                                            <Badge className="bg-slate-900 text-white border-none font-black text-[10px] px-3 py-1 rounded-lg">{p?.goals ?? 0} GOL</Badge>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <Card className="bg-white border-none rounded-[2.5rem] p-10 shadow-xl shadow-orange-600/5 flex flex-col h-full border-t-4 border-blue-600">
                                <h3 className="text-blue-600 font-black uppercase tracking-[0.2em] text-[10px] mb-10 flex items-center">
                                    <Star className="mr-3 h-5 w-5" /> ASİST KRALLIĞI
                                </h3>
                                <div className="space-y-6 flex-1">
                                    {(homepageStats?.topAssists || []).map((p, i) => (
                                        <div key={i} className="flex items-center justify-between bg-slate-50/50 rounded-2xl p-4 border border-slate-100 hover:bg-blue-50/50 transition-all">
                                            <div className="flex items-center gap-4">
                                                <span className="h-10 w-10 flex items-center justify-center bg-blue-600 text-white rounded-xl text-[14px] font-black shadow-lg shadow-blue-600/20">
                                                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                                                </span>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black uppercase text-slate-900">{p?.name || 'Oyuncu'}</span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{p?.team_name || 'KGM Birimi'}</span>
                                                </div>
                                            </div>
                                            <Badge className="bg-slate-900 text-white border-none font-black text-[10px] px-3 py-1 rounded-lg">{p?.assists ?? 0} ASİST</Badge>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                </section>

                <section className="py-24 px-6 relative z-10">
                    <div className="container mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            <div className="lg:col-span-4 space-y-8">
                                <div className="flex items-center gap-3 border-l-4 border-orange-600 pl-4">
                                    <h2 className="text-2xl font-black uppercase tracking-tighter">TAHMİN LİDERLERİ</h2>
                                </div>
                                <Card className="bg-slate-950 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5"><TrendingUp className="h-24 w-24" /></div>
                                    <div className="space-y-4 relative z-10">
                                        {(predictionLeaderboard || []).map((user, i) => (
                                            <div 
                                                key={i} 
                                                onClick={() => fetchLeaderPredictions(user)}
                                                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className="text-lg font-black text-orange-600 italic">#{i+1}</span>
                                                    <span className="text-xs font-black uppercase truncate max-w-[100px] group-hover:text-orange-500 transition-colors">{user?.name || 'Kullanıcı'}</span>
                                                </div>
                                                <Badge className="bg-orange-600 text-white border-none font-black text-[10px] px-3">{user?.total_points ?? 0} P</Badge>
                                            </div>
                                        ))}
                                        {(!predictionLeaderboard || predictionLeaderboard.length === 0) && <p className="text-center py-10 text-white/20 font-black uppercase text-[10px] tracking-widest">Veri bekleniyor...</p>}
                                    </div>
                                </Card>
                            </div>

                            <div className="lg:col-span-8 space-y-8">
                                <div className="flex items-center gap-3 border-l-4 border-orange-600 pl-4">
                                    <h2 className="text-2xl font-black uppercase tracking-tighter">ANLARI ÖLÜMSÜZLEŞTİR</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {(galleries || []).slice(0, 2).map((img, idx) => (
                                        <motion.div key={img?.id || idx} whileHover={{ y: -5 }} className="relative h-64 rounded-[2.5rem] overflow-hidden shadow-xl group">
                                            <img src={img?.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent p-8 flex flex-col justify-end text-white">
                                                <p className="text-lg font-black uppercase tracking-tighter">{img?.title || 'Fotoğraf'}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {(!galleries || galleries.length === 0) && <p className="text-center py-20 text-slate-300 font-bold uppercase text-[10px] col-span-2 border-2 border-dashed border-slate-100 rounded-[2.5rem]">Henüz fotoğraf eklenmedi</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-32 px-6 relative z-10 bg-white">
                    <div className="container mx-auto max-w-5xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                            {[
                                { label: "ONAYLI TAKIM", value: totalStats?.approvedTeams || 0, icon: Shield },
                                { label: "AKTİF SPORCU", value: totalStats?.activePlayers || 0, icon: Users },
                                { label: "KRİTİK MAÇ", value: totalStats?.totalMatches || 0, icon: Zap },
                            ].map((stat, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-6 group">
                                    <div className="h-24 w-24 rounded-[2.5rem] bg-orange-50 border border-orange-100 flex items-center justify-center shadow-lg shadow-orange-600/5 group-hover:bg-orange-600 transition-all">
                                        <stat.icon className="h-10 w-10 text-orange-600 group-hover:text-white transition-all" />
                                    </div>
                                    <div>
                                        <h3 className="text-6xl font-black text-slate-900 mb-1 tabular-nums tracking-tighter">{stat.value}</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-slate-50 border-t border-slate-200 py-24 px-6 relative z-10">
                <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-orange-600 rounded-xl flex items-center justify-center">
                                <Trophy className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-black uppercase tracking-tighter text-slate-900">KARAYOLLARI <span className="text-orange-600 italic">TURNUVA</span></span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">© 2026 KGM 5.BÖLGE MÜDÜRLÜĞÜ. TÜM HAKLARI SAKLIDIR.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {['KURALLAR', 'GİZLİLİK', 'DESTEK', 'KGM WEB'].map(l => (
                            <a key={l} href="#" className="hover:text-orange-600 transition-colors border-b-2 border-transparent hover:border-orange-600 pb-1">{l}</a>
                        ))}
                    </div>
                </div>
            </footer>

            <AnimatePresence>
                {predictingGame && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-950/90 backdrop-blur-xl"
                        onClick={() => setPredictingGame(null)}
                    >
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="bg-white rounded-t-3xl md:rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl text-slate-950 border border-slate-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg md:text-xl font-black uppercase tracking-tight">
                                    SKOR <span className="text-orange-600">TAHMİNİ</span>
                                </h2>
                                <button onClick={() => setPredictingGame(null)} className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {!auth?.user ? (
                                <div className="text-center py-8">
                                    <p className="text-sm text-slate-500 mb-4">Tahmin yapmak için giriş yapmanız gerekiyor.</p>
                                    <Link href="/login">
                                        <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-2 rounded-xl">Giriş Yap</Button>
                                    </Link>
                                </div>
                            ) : (
                                <form onSubmit={handlePredictionSubmit} className="space-y-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 text-center">
                                            <p className="text-[10px] font-black uppercase text-slate-500 mb-3 truncate px-1">{getTeamName(predictingGame?.home_team || predictingGame?.homeTeam)}</p>
                                            <input
                                                type="number"
                                                min="0"
                                                max="99"
                                                required
                                                placeholder="0"
                                                className="w-full h-16 md:h-20 bg-slate-50 rounded-2xl text-center text-3xl md:text-4xl font-black border-none ring-2 ring-slate-100 focus:ring-orange-500 focus:bg-white transition-all"
                                                value={predictionForm.data.home_score}
                                                onChange={e => predictionForm.setData('home_score', e.target.value)}
                                            />
                                        </div>
                                        <div className="text-2xl font-black text-slate-300 pt-5">:</div>
                                        <div className="flex-1 text-center">
                                            <p className="text-[10px] font-black uppercase text-slate-500 mb-3 truncate px-1">{getTeamName(predictingGame?.away_team || predictingGame?.awayTeam)}</p>
                                            <input
                                                type="number"
                                                min="0"
                                                max="99"
                                                required
                                                placeholder="0"
                                                className="w-full h-16 md:h-20 bg-slate-50 rounded-2xl text-center text-3xl md:text-4xl font-black border-none ring-2 ring-slate-100 focus:ring-orange-500 focus:bg-white transition-all"
                                                value={predictionForm.data.away_score}
                                                onChange={e => predictionForm.setData('away_score', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {predictionError && (
                                        <div className="text-red-500 text-xs text-center font-bold bg-red-50 rounded-xl py-2 px-3">
                                            {predictionError}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full h-12 md:h-14 bg-slate-900 text-white hover:bg-orange-600 font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all hover:scale-[1.02] border-none text-[10px] md:text-xs"
                                    >
                                        {submitting
                                            ? 'GÖNDERİLİYOR...'
                                            : getExistingPrediction(predictingGame?.id)
                                                ? 'TAHMİNİ GÜNCELLE'
                                                : 'TAHMİNİ KAYDET'
                                        }
                                    </Button>
                                </form>
                            )}
                        </motion.div>
                    </motion.div>
                )}

                {liveStreamMatch && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 bg-slate-950/98 backdrop-blur-3xl"
                        onClick={() => setLiveStreamMatch(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-slate-900 rounded-[2.5rem] w-full max-w-5xl shadow-2xl border border-white/10 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30">
                                        <Tv className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter text-white">
                                            CANLI <span className="text-red-500">YAYIN</span>
                                        </h2>
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                                            {getTeamName(liveStreamMatch?.home_team || liveStreamMatch?.homeTeam)} vs {getTeamName(liveStreamMatch?.away_team || liveStreamMatch?.awayTeam)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <a
                                        href={liveStreamMatch?.live_stream_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hidden md:flex items-center gap-2 text-[10px] font-black text-white/50 hover:text-white uppercase tracking-widest transition-colors"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        YouTube'da Aç
                                    </a>
                                    <Button
                                        onClick={() => setLiveStreamMatch(null)}
                                        variant="ghost"
                                        className="h-12 w-12 rounded-2xl text-white/50 hover:bg-white/10 hover:text-white transition-all"
                                    >
                                        <X className="h-6 w-6" />
                                    </Button>
                                </div>
                            </div>
                            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                <iframe
                                    src={getYoutubeEmbedUrl(liveStreamMatch?.live_stream_url) || ''}
                                    className="absolute inset-0 w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    title="Canlı Yayın"
                                />
                            </div>
                            <div className="p-4 md:p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                    <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Canlı</span>
                                </div>
                                <div className="bg-white/10 text-white px-5 py-2 rounded-xl text-xs font-black">
                                    {getTeamName(liveStreamMatch?.home_team || liveStreamMatch?.homeTeam)} {liveStreamMatch?.home_score ?? 0} - {liveStreamMatch?.away_score ?? 0} {getTeamName(liveStreamMatch?.away_team || liveStreamMatch?.awayTeam)}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                {viewingLeader && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6 bg-slate-950/95 backdrop-blur-md"
                        onClick={() => setViewingLeader(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[80vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-5 md:p-8 border-b border-slate-100 bg-slate-50">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="h-10 w-10 md:h-12 md:w-12 bg-orange-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/20">
                                        <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter text-slate-900 leading-tight">
                                            {viewingLeader.name} <span className="text-orange-600">TAHMİNLERİ</span>
                                        </h2>
                                        <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 md:mt-1">
                                            TOPLAM {viewingLeader.total_points} PUAN • {viewingLeader.total_predictions} TAHMİN
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => setViewingLeader(null)}
                                    variant="ghost"
                                    className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all p-0"
                                >
                                    <X className="h-5 w-5 md:h-6 md:w-6" />
                                </Button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-3 md:space-y-4 custom-scrollbar">
                                {loadingLeaderPredictions ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <div className="h-10 w-10 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin"></div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yükleniyor...</p>
                                    </div>
                                ) : leaderPredictions.length > 0 ? (
                                    leaderPredictions.map((pred, i) => (
                                        <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{pred.game?.group?.name || 'GRUP'}</span>
                                                <Badge className={`${pred.status === 'calculated' ? (pred.points > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') : 'bg-slate-100 text-slate-500'} border-none font-black text-[9px] px-2`}>
                                                    {pred.status === 'calculated' ? `+${pred.points} PUAN` : 'BEKLİYOR'}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 md:gap-4">
                                                <div className="flex-1 text-right text-[10px] md:text-xs font-black uppercase truncate">{getTeamName(pred.game?.home_team || pred.game?.homeTeam)}</div>
                                                <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-white rounded-lg border border-slate-100 shadow-sm">
                                                    <span className="text-base md:text-lg font-black tabular-nums">{pred.home_score}</span>
                                                    <span className="text-slate-300 font-bold">-</span>
                                                    <span className="text-base md:text-lg font-black tabular-nums">{pred.away_score}</span>
                                                </div>
                                                <div className="flex-1 text-left text-[10px] md:text-xs font-black uppercase truncate">{getTeamName(pred.game?.away_team || pred.game?.awayTeam)}</div>
                                            </div>
                                            {pred.game?.status === 'completed' && (
                                                <div className="mt-3 pt-3 border-t border-slate-200/50 text-center">
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                        MAÇ SONUCU: {pred.game?.home_score} - {pred.game?.away_score}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center py-20 text-slate-300 font-black uppercase text-[10px] tracking-widest">Henüz tahmin bulunmuyor.</p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
