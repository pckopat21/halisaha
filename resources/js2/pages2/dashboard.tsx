import { 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell, 
    Tooltip as RechartsTooltip, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid,
    AreaChart,
    Area
} from 'recharts';
import { Head, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { 
    Trophy, 
    Users, 
    Calendar, 
    Activity, 
    ChevronRight, 
    PlayCircle, 
    Target, 
    Medal, 
    Clock, 
    LayoutDashboard,
    ArrowUpRight,
    Search,
    Bell,
    TrendingUp,
    PieChart as PieChartIcon,
    CheckCircle2,
    Timer as TimerIcon,
    MapPin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Stats {
    tournaments_count: number;
    teams_count: number;
    games_count: number;
    players_count: number;
    top_scorer?: {
        id: number;
        first_name: string;
        last_name: string;
        goals_count: number;
        unit?: { name: string };
    };
    goals_by_unit: { name: string, goals_count: number }[];
    match_trends: { date: string, goals: number }[];
}

interface Game {
    id: number;
    home_team: { name: string; unit?: { name: string } };
    away_team: { name: string; unit?: { name: string } };
    home_score: number;
    away_score: number;
    status: string;
    scheduled_at: string;
    started_at: string | null;
    field?: { id: number; name: string; location: string | null };
}

interface Props {
    stats: Stats;
    recent_games: Game[];
    upcoming_games: Game[];
    live_games: Game[];
    active_tournament: any;
    latest_champion_tournament?: {
        id: number;
        name: string;
        year: number;
        champion: {
            id: number;
            name: string;
            unit: { name: string };
        };
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kontrol Merkezi', href: '/dashboard' },
];

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard({ stats, recent_games, upcoming_games, live_games, active_tournament, latest_champion_tournament }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const getMatchMinute = (game: Game) => {
        if (!game.started_at) return 1;
        const start = new Date(game.started_at);
        const diff = Math.floor((currentTime.getTime() - start.getTime()) / 60000);
        return Math.min(90, Math.max(1, diff + 1));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kontrol Merkezi" />
            
            <div className="p-4 md:p-8 space-y-8 font-sans animate-in fade-in duration-500">
                
                {/* Global Search & Notifications Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">
                            HOŞ GELDİN, <span className="text-blue-600">{auth.user.name.split(' ')[0]}</span>
                        </h1>
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Turnuva yönetim sistemi hazır ve nazır.</p>
                    </div>
                </div>

                {latest_champion_tournament && (
                    <div className="animate-in fade-in slide-in-from-top duration-1000">
                        <Card className="border-none bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 dark:from-amber-900 dark:via-amber-700 dark:to-orange-950 text-amber-950 dark:text-amber-100 shadow-[0_30px_60px_rgba(245,158,11,0.2)] rounded-[3rem] overflow-hidden relative group">
                            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            <div className="absolute -right-20 -bottom-20 opacity-30 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                                <Trophy className="h-96 w-96 text-white" />
                            </div>
                            
                            <CardContent className="p-8 md:p-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex items-center gap-8">
                                    <div className="h-28 w-28 md:h-36 md:w-36 bg-white/20 dark:bg-black/20 backdrop-blur-3xl rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white/50 dark:border-white/10 shrink-0">
                                        <Trophy className="h-16 w-16 md:h-20 md:w-20 text-amber-600 dark:text-amber-400 animate-bounce" />
                                    </div>
                                    <div>
                                        <Badge className="bg-white/30 dark:bg-white/10 text-amber-900 dark:text-amber-200 border-none font-black text-[10px] px-5 py-2 rounded-full uppercase tracking-[0.4em] mb-4">SON TURNUVA ŞAMPİYONU</Badge>
                                        <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-3">
                                            {latest_champion_tournament.champion.name}
                                        </h2>
                                        <div className="flex items-center gap-4">
                                            <p className="font-black uppercase tracking-widest text-[10px] opacity-80 bg-black/10 dark:bg-white/5 px-4 py-2 rounded-xl">
                                                {latest_champion_tournament.champion.unit.name}
                                            </p>
                                            <p className="font-black uppercase tracking-widest text-[10px] opacity-60">
                                                {latest_champion_tournament.name} • {latest_champion_tournament.year}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <Link href={route('tournaments.show', latest_champion_tournament.id)}>
                                    <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-[1.5rem] px-10 py-8 text-xl font-black uppercase tracking-tighter shadow-2xl transition-all hover:scale-105 active:scale-95 group">
                                        ZİRVEYE GİT
                                        <ArrowUpRight className="ml-3 h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Hero Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="group relative overflow-hidden border-none bg-blue-600 text-white shadow-2xl transition-all hover:scale-[1.02]">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Trophy className="h-24 w-24" />
                        </div>
                        <CardContent className="p-8">
                            <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">Turnuva Sayısı</p>
                            <h3 className="text-5xl font-black tabular-nums">{stats.tournaments_count}</h3>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden border-none bg-emerald-600 text-white shadow-2xl transition-all hover:scale-[1.02]">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Users className="h-24 w-24" />
                        </div>
                        <CardContent className="p-8">
                            <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">Toplam Takım</p>
                            <h3 className="text-5xl font-black tabular-nums">{stats.teams_count}</h3>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden border-none bg-neutral-900 text-white shadow-2xl transition-all hover:scale-[1.02]">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Activity className="h-24 w-24" />
                        </div>
                        <CardContent className="p-8">
                            <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">Toplam Maç</p>
                            <h3 className="text-5xl font-black tabular-nums">{stats.games_count}</h3>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden border-none bg-amber-500 text-white shadow-2xl transition-all hover:scale-[1.02]">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Target className="h-24 w-24" />
                        </div>
                        <CardContent className="p-8">
                            <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">Oyuncu Sayısı</p>
                            <h3 className="text-5xl font-black tabular-nums">{stats.players_count}</h3>
                        </CardContent>
                    </Card>
                </div>

                {/* Live Matches Spotlight */}
                {live_games.length > 0 && (
                    <div className="animate-in zoom-in duration-700">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px bg-rose-500/20 flex-1" />
                            <Badge className="bg-rose-600 text-white border-none font-black text-[10px] items-center gap-2 uppercase tracking-[0.3em] px-6 py-2 rounded-full shadow-lg shadow-rose-600/30">
                                <span className="w-2 h-2 bg-white rounded-full animate-ping" /> ŞİMDİ CANLI
                            </Badge>
                            <div className="h-px bg-rose-500/20 flex-1" />
                        </div>
                        
                        <div className={`grid grid-cols-1 ${live_games.length > 1 ? 'lg:grid-cols-2' : ''} gap-8`}>
                            {live_games.map((game) => (
                                <Card key={game.id} className="border-none bg-slate-900 text-white rounded-[3rem] overflow-hidden shadow-2xl shadow-rose-600/20 group relative">
                                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                                    <div className="absolute -top-32 -left-32 w-64 h-64 bg-rose-600/20 blur-[120px] rounded-full pointer-events-none" />
                                    <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
                                    
                                    <CardContent className="p-10 relative z-10 backdrop-blur-sm border border-white/5 rounded-[3rem]">
                                        <div className="flex items-center justify-between gap-8">
                                            {/* Home Team */}
                                            <div className="flex-1 flex flex-col items-center gap-4 text-center">
                                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-black text-blue-400 shadow-inner">
                                                    {(game.home_team?.name || '?').charAt(0)}
                                                </div>
                                                <span className="font-black uppercase tracking-tight text-sm md:text-lg line-clamp-1">{game.home_team?.name || 'BELİRLENMEDİ'}</span>
                                            </div>

                                            {/* Live Score */}
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="flex items-center gap-6">
                                                    <span className="text-5xl md:text-7xl font-black tabular-nums drop-shadow-2xl">{game.home_score}</span>
                                                    <span className="text-2xl font-black text-rose-500 animate-pulse">:</span>
                                                    <span className="text-5xl md:text-7xl font-black tabular-nums drop-shadow-2xl">{game.away_score}</span>
                                                </div>
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="bg-rose-600/20 border border-rose-500/30 px-6 py-1.5 rounded-full flex items-center gap-3 backdrop-blur-md">
                                                        <TimerIcon className="h-4 w-4 text-rose-500 animate-spin-slow" />
                                                        <span className="font-black text-rose-500 text-xs tabular-nums tracking-widest">{getMatchMinute(game)}' DAKİKA</span>
                                                    </div>
                                                    {game.field && (
                                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-white/40 uppercase tracking-widest mt-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {game.field.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Away Team */}
                                            <div className="flex-1 flex flex-col items-center gap-4 text-center">
                                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-black text-slate-400 shadow-inner">
                                                    {(game.away_team?.name || '?').charAt(0)}
                                                </div>
                                                <span className="font-black uppercase tracking-tight text-sm md:text-lg line-clamp-1">{game.away_team?.name || 'BELİRLENMEDİ'}</span>
                                            </div>
                                        </div>

                                        <Link href={route('games.show', game.id)} className="mt-8 block">
                                            <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] transition-all hover:scale-[1.01]">
                                                MAÇI CANLI TAKİP ET
                                                <Activity className="ml-3 h-4 w-4 text-rose-600" />
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Analytical Intelligence Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Goal Distribution Pie Chart */}
                    <Card className="border-none shadow-xl bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-8 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black uppercase tracking-tighter">Birim Gol Dağılımı</CardTitle>
                                <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">BİRİMLERİN TURNUVA KATKISI</CardDescription>
                            </div>
                            <PieChartIcon className="h-5 w-5 text-blue-600" />
                        </CardHeader>
                        <CardContent className="h-[300px] p-4">
                            {stats.goals_by_unit.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.goals_by_unit}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="goals_count"
                                            label={({name, percent}) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                                        >
                                            {stats.goals_by_unit.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip 
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">Veri bulunamadı</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Performance Trends Area Chart */}
                    <Card className="border-none shadow-xl bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-8 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black uppercase tracking-tighter">Maç Heyecanı Trendi</CardTitle>
                                <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">GÜNLÜK TOPLAM GOL SAYISI</CardDescription>
                            </div>
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                        </CardHeader>
                        <CardContent className="h-[300px] p-4">
                            {stats.match_trends.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.match_trends}>
                                        <defs>
                                            <linearGradient id="colorGoals" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis 
                                            dataKey="date" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fontSize: 10, fontWeight: 'bold' }}
                                            tickFormatter={(val) => format(new Date(val), 'd MMM', { locale: tr })}
                                        />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                        <RechartsTooltip 
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Area type="monotone" dataKey="goals" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorGoals)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">Henüz maç verisi yok</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Upcoming Matches Section */}
                        <Card className="border-none shadow-xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-8 flex flex-row items-center justify-between border-b border-neutral-100 dark:border-white/5">
                                <div>
                                    <CardTitle className="text-xl font-black uppercase tracking-tighter">Yaklaşan Maçlar</CardTitle>
                                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">PROGRAMDAKİ İLK 5 MÜSABAKA</CardDescription>
                                </div>
                                <Calendar className="h-5 w-5 text-blue-600" />
                            </CardHeader>
                            <CardContent className="p-0">
                                {upcoming_games.length > 0 ? (
                                    <div className="divide-y divide-neutral-100 dark:divide-white/5">
                                        {upcoming_games.map((game) => (
                                            <Link key={game.id} href={route('games.show', game.id)} className="flex items-center justify-between p-6 hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors group">
                                                <div className="flex flex-1 items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-black text-xs text-muted-foreground group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                        {game.home_team.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="font-black text-sm uppercase tracking-tight">{game.home_team.name}</span>
                                                </div>
                                                
                                                <div className="flex flex-col items-center gap-1 mx-4 min-w-[100px]">
                                                    <div className="bg-slate-100 dark:bg-white/5 px-4 py-1.5 rounded-full border border-border">
                                                        <span className="text-lg font-black tabular-nums">{format(new Date(game.scheduled_at), 'HH:mm')}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{format(new Date(game.scheduled_at), 'd MMMM', { locale: tr })}</span>
                                                        {game.field && (
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-blue-600/60 flex items-center gap-1 mt-0.5">
                                                                <MapPin className="h-2.5 w-2.5" />
                                                                {game.field.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-1 items-center justify-end gap-4">
                                                    <span className="font-black text-sm uppercase tracking-tight text-right">{game.away_team.name}</span>
                                                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-black text-xs text-muted-foreground group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                        {game.away_team.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
                                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center opacity-20">
                                            <Clock className="h-8 w-8" />
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">Planlı bir maç bulunmuyor.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-8">
                        
                        {/* Featured Stats: Top Scorer */}
                        <Card className="border-none shadow-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-white rounded-[2.5rem] overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none group-hover:rotate-12 transition-transform">
                                <Medal className="h-32 w-32" />
                            </div>
                            <CardHeader className="p-8">
                                <Badge className="bg-white/20 text-white border-none font-black text-[9px] uppercase tracking-widest mb-4">ALTIN AYAKKABI ADAYI</Badge>
                                <CardTitle className="text-2xl font-black uppercase tracking-tighter">EN GOLCÜ OYUNCU</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 flex items-center gap-6">
                                {stats.top_scorer ? (
                                    <>
                                        <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center text-3xl font-black shadow-2xl">
                                            {stats.top_scorer.first_name[0]}{stats.top_scorer.last_name[0]}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black uppercase tracking-tight">{stats.top_scorer.first_name} {stats.top_scorer.last_name}</h4>
                                            <p className="text-xs font-bold uppercase opacity-80 mb-2">{stats.top_scorer.unit?.name}</p>
                                            <Badge className="bg-white text-orange-600 font-black px-4 py-1.5 rounded-full text-lg tabular-nums shadow-lg">{stats.top_scorer.goals_count} GOL</Badge>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-xs font-black uppercase opacity-60">Henüz veri toplanıyor...</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Results Preview */}
                        <Card className="border-none shadow-xl bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-8 border-b border-neutral-100 dark:border-white/5">
                                <CardTitle className="text-xl font-black uppercase tracking-tighter">Son Sonuçlar</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {recent_games.slice(0, 3).map((game) => (
                                        <div key={game.id} className="flex items-center justify-between pb-4 border-b border-neutral-50 dark:border-white/5 last:border-none">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-blue-600 uppercase">{game.home_team.name}</span>
                                                <span className="text-[10px] font-black text-rose-600 uppercase">{game.away_team.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-black tabular-nums">{game.home_score}</span>
                                                <span className="text-lg font-black tabular-nums opacity-20">-</span>
                                                <span className="text-lg font-black tabular-nums">{game.away_score}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <Link href={route('games.index')}>
                                        <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-blue-600">TÜM SONUÇLARI GÖR</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
