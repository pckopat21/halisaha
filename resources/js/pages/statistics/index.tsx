import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Trophy, Goal, Target, Shield, AlertTriangle, TrendingUp, Users, Activity, ChevronRight, BarChart3, PieChart as PieChartIcon, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

interface Props {
    tournaments: any[];
    selectedTournament: any;
    stats: {
        summary: any;
        topScorers: any[];
        topAssists: any[];
        bestDefenses: any[];
        bestAttacks: any[];
        topDuos: any[];
        dreamTeam: any[];
        records: any;
        goalDistribution: any[];
        fairPlay: any[];
        unitGoals: any[];
        trends: any[];
        topCards?: {
            players: any[];
        };
        compare: {
            players: any[];
            teams: any[];
        };
    };
}

export default function Index({ tournaments, selectedTournament, stats }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'İstatistikler', href: '/statistics' },
        { title: selectedTournament?.name || 'Genel Bakış', href: '#' },
    ];

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const [cardSearch, setCardSearch] = useState('');
    const [cardSort, setCardSort] = useState<'points' | 'yellow' | 'red'>('points');
    const [cardPage, setCardPage] = useState(1);
    const cardPerPage = 8;

    // Comparison Center States
    const [compareMode, setCompareMode] = useState<'players' | 'teams'>('players');
    
    const playersList = stats.compare?.players || [];
    const teamsList = stats.compare?.teams || [];

    const [comparePlayer1Id, setComparePlayer1Id] = useState<number | null>(playersList[0]?.id || null);
    const [comparePlayer2Id, setComparePlayer2Id] = useState<number | null>(playersList[1]?.id || null);
    
    const [compareTeam1Id, setCompareTeam1Id] = useState<number | null>(teamsList[0]?.id || null);
    const [compareTeam2Id, setCompareTeam2Id] = useState<number | null>(teamsList[1]?.id || null);

    const [searchP1, setSearchP1] = useState('');
    const [searchP2, setSearchP2] = useState('');
    const [searchT1, setSearchT1] = useState('');
    const [searchT2, setSearchT2] = useState('');

    const [isOpenP1, setIsOpenP1] = useState(false);
    const [isOpenP2, setIsOpenP2] = useState(false);
    const [isOpenT1, setIsOpenT1] = useState(false);
    const [isOpenT2, setIsOpenT2] = useState(false);

    const allCardPlayers = stats.topCards?.players || [];
    const filteredCardPlayers = allCardPlayers
        .filter((player: any) => {
            const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
            const unitName = (player.unit?.name || '').toLowerCase();
            const query = cardSearch.toLowerCase();
            return fullName.includes(query) || unitName.includes(query);
        })
        .sort((a: any, b: any) => {
            const aYellow = parseInt(a.yellow_cards_count || 0);
            const bYellow = parseInt(b.yellow_cards_count || 0);
            const aRed = parseInt(a.red_cards_count || 0);
            const bRed = parseInt(b.red_cards_count || 0);

            if (cardSort === 'yellow') {
                if (bYellow !== aYellow) return bYellow - aYellow;
                return bRed - aRed;
            }
            if (cardSort === 'red') {
                if (bRed !== aRed) return bRed - aRed;
                return bYellow - aYellow;
            }
            // default 'points': weight = red * 3 + yellow
            const aPoints = (aRed * 3) + aYellow;
            const bPoints = (bRed * 3) + bYellow;
            if (bPoints !== aPoints) return bPoints - aPoints;
            return bRed - aRed;
        });

    const totalCardPages = Math.max(1, Math.ceil(filteredCardPlayers.length / cardPerPage));
    const paginatedCardPlayers = filteredCardPlayers.slice((cardPage - 1) * cardPerPage, cardPage * cardPerPage);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="İstatistik Merkezi - Premium Analytics" />

            <div className="min-h-screen bg-slate-50 dark:bg-black p-4 md:p-8 font-sans">
                {/* Header & Tournament Selector */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2 italic">İSTATİSTİK <span className="text-blue-600">MERKEZİ</span></h1>
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60">TURNUVA PERFORMANS VE ANALİTİK VERİLER</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        {tournaments.map((t) => (
                            <Button 
                                key={t.id}
                                variant={selectedTournament?.id === t.id ? 'default' : 'outline'}
                                onClick={() => router.get(route('statistics.index'), { tournament_id: t.id })}
                                className={`rounded-2xl font-black text-[10px] uppercase tracking-widest h-12 px-6 ${selectedTournament?.id === t.id ? 'bg-blue-600 shadow-lg shadow-blue-500/20' : ''}`}
                            >
                                {t.name}
                            </Button>
                        ))}
                    </div>
                </div>

                {!selectedTournament ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <p className="text-muted-foreground font-black uppercase tracking-widest italic">Henüz bir turnuva verisi bulunmuyor.</p>
                    </div>
                ) : (
                    <>
                        {/* Summary Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {[
                                { label: 'TOPLAM GOL', value: stats.summary.total_goals, icon: Goal, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                { label: 'MAÇ BAŞI GOL', value: stats.summary.avg_goals, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                { label: 'OYNANAN MAÇ', value: stats.summary.played_matches, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                                { label: 'TOPLAM KART', value: stats.summary.total_cards, icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                            ].map((s, i) => (
                                <Card key={i} className="border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden group hover:scale-[1.02] transition-transform">
                                    <CardContent className="p-8 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">{s.label}</p>
                                            <h3 className="text-3xl font-black tracking-tighter tabular-nums">{s.value}</h3>
                                        </div>
                                        <div className={`h-14 w-14 ${s.bg} rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12`}>
                                            <s.icon className={`h-6 w-6 ${s.color}`} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Tabs defaultValue="overview" className="space-y-8">
                            <TabsList className="bg-transparent h-auto p-0 flex-wrap gap-2 flex justify-start mb-8">
                                {['BİR BAKIŞTA', 'GOL VE ASİST', '⚡ ÖLÜMCÜL İKİLİLER', 'KART ANALİZİ', 'TAKIM ANALİZİ', 'BİRİM DAĞILIMI', '🆚 KIYASLAMA', '🏆 RÜYA TAKIMI'].map((tab, i) => (
                                    <TabsTrigger 
                                        key={i}
                                        value={['overview', 'players', 'duos', 'cards', 'teams', 'units', 'compare', 'dream_team'][i]}
                                        className="rounded-2xl px-6 py-3 font-black text-[10px] uppercase tracking-widest border border-slate-200 dark:border-white/5 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all shadow-sm"
                                    >
                                        {tab}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {/* Overview Tab */}
                            <TabsContent value="overview">
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                    {/* Tournament Records Card */}
                                    <Card className="border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[3rem] overflow-hidden col-span-1 xl:col-span-2">
                                        <CardHeader className="p-8 pb-4">
                                            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                                <Trophy className="h-5 w-5 text-yellow-500 animate-bounce" /> TURNUVA REKORLARI & MİLATLAR
                                            </CardTitle>
                                            <CardDescription className="text-xs font-black uppercase tracking-widest opacity-50 mt-1">BU TURNUVADA ŞİMDİYE KADAR KAYDEDİLEN ZİRVE PERFORMANSLAR VE DETAYLI MAÇ ANALİZLERİ</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-8 pt-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {/* Highest scoring */}
                                                <div className="p-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[2.5rem] flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-300">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <span className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-2xl group-hover:rotate-12 transition-transform">
                                                                <Goal className="h-5 w-5" />
                                                            </span>
                                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-wider">EN GOLCÜ MAÇ</span>
                                                        </div>
                                                        {stats.records.highest_scoring ? (
                                                            <>
                                                                <p className="text-xs font-bold text-muted-foreground uppercase leading-tight truncate">{stats.records.highest_scoring.home_team}</p>
                                                                <p className="text-lg font-black uppercase tracking-tight my-1 tabular-nums">{stats.records.highest_scoring.home_score} - {stats.records.highest_scoring.away_score}</p>
                                                                <p className="text-xs font-bold text-muted-foreground uppercase leading-tight truncate mb-4">{stats.records.highest_scoring.away_team}</p>
                                                                <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/15 border-none text-[8px] font-black uppercase px-2.5 py-1 rounded-full">{stats.records.highest_scoring.total_goals} GOL ATILDI</Badge>
                                                            </>
                                                        ) : (
                                                            <p className="text-xs font-black text-neutral-400 uppercase tracking-wider py-8 text-center">KAYIT BULUNMUYOR</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Biggest margin victory */}
                                                <div className="p-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[2.5rem] flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-300">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <span className="p-2.5 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:rotate-12 transition-transform">
                                                                <Shield className="h-5 w-5" />
                                                            </span>
                                                            <span className="text-[9px] font-black text-blue-500 uppercase tracking-wider">EN FARKLI GALİBİYET</span>
                                                        </div>
                                                        {stats.records.biggest_victory ? (
                                                            <>
                                                                <p className="text-xs font-bold text-muted-foreground uppercase leading-tight truncate">{stats.records.biggest_victory.home_team}</p>
                                                                <p className="text-lg font-black uppercase tracking-tight my-1 tabular-nums">{stats.records.biggest_victory.home_score} - {stats.records.biggest_victory.away_score}</p>
                                                                <p className="text-xs font-bold text-muted-foreground uppercase leading-tight truncate mb-4">{stats.records.biggest_victory.away_team}</p>
                                                                <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/15 border-none text-[8px] font-black uppercase px-2.5 py-1 rounded-full">{stats.records.biggest_victory.margin} FARKLI SKOR</Badge>
                                                            </>
                                                        ) : (
                                                            <p className="text-xs font-black text-neutral-400 uppercase tracking-wider py-8 text-center">KAYIT BULUNMUYOR</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Most carded game */}
                                                <div className="p-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[2.5rem] flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-300">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <span className="p-2.5 bg-rose-500/10 text-rose-500 rounded-2xl group-hover:rotate-12 transition-transform">
                                                                <AlertTriangle className="h-5 w-5" />
                                                            </span>
                                                            <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider">EN GERGİN MAÇ</span>
                                                        </div>
                                                        {stats.records.most_cards ? (
                                                            <>
                                                                <p className="text-xs font-bold text-muted-foreground uppercase leading-tight truncate">{stats.records.most_cards.home_team}</p>
                                                                <p className="text-lg font-black uppercase tracking-tight my-1 tabular-nums">{stats.records.most_cards.home_score} - {stats.records.most_cards.away_score}</p>
                                                                <p className="text-xs font-bold text-muted-foreground uppercase leading-tight truncate mb-4">{stats.records.most_cards.away_team}</p>
                                                                <Badge className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/15 border-none text-[8px] font-black uppercase px-2.5 py-1 rounded-full">{stats.records.most_cards.cards_count} TOPLAM KART</Badge>
                                                            </>
                                                        ) : (
                                                            <p className="text-xs font-black text-neutral-400 uppercase tracking-wider py-8 text-center">KAYIT BULUNMUYOR</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Score Progression Trend */}
                                    <Card className="border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[3rem] overflow-hidden">
                                        <CardHeader className="p-8">
                                            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                                <TrendingUp className="h-5 w-5 text-blue-600" /> GOL TRENDLERİ
                                            </CardTitle>
                                            <CardDescription className="text-xs font-black uppercase tracking-widest opacity-50 mt-1">GÜNLER BAZINDA ÜRETİLEN TOPLAM SKOR</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-8 h-[350px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={stats.trends}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                                    <Tooltip 
                                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                                    />
                                                    <Line type="monotone" dataKey="goals" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 0 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>

                                    {/* Goal Minutes Distribution */}
                                    <Card className="border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[3rem] overflow-hidden">
                                        <CardHeader className="p-8">
                                            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                                <BarChart3 className="h-5 w-5 text-amber-500" /> GOL DAKİKALARI DAĞILIMI
                                            </CardTitle>
                                            <CardDescription className="text-xs font-black uppercase tracking-widest opacity-50 mt-1">GOLLERİN 10'AR DAKİKALIK ZAMAN DİLİMLERİNE GÖRE ANALİZİ</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-8 h-[350px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={stats.goalDistribution}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                                    <XAxis dataKey="interval" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                                    <Tooltip 
                                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                                    />
                                                    <Bar dataKey="goals" radius={[8, 8, 0, 0]}>
                                                        {stats.goalDistribution.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>

                                    {/* Unit Distribution Pie */}
                                    <Card className="border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[3rem] overflow-hidden col-span-1 xl:col-span-2">
                                        <CardHeader className="p-8">
                                            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                                <PieChartIcon className="h-5 w-5 text-emerald-600" /> BİRİM DOMİNASYONU
                                            </CardTitle>
                                            <CardDescription className="text-xs font-black uppercase tracking-widest opacity-50 mt-1">ORGANİZASYONEL BİRİMLERİN TOPLAM GOL KATKISI DAĞILIMI</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-8 h-[350px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={stats.unitGoals}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={80}
                                                        outerRadius={120}
                                                        paddingAngle={5}
                                                        dataKey="goals_count"
                                                    >
                                                        {stats.unitGoals.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip 
                                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* Players Tab */}
                            <TabsContent value="players">
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                    {/* Top Scorers */}
                                    <Card className="border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[3rem]">
                                        <CardHeader className="p-8">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                                        <Trophy className="h-5 w-5 text-amber-500" /> GOL KRALLIĞI
                                                    </CardTitle>
                                                    <CardDescription className="text-xs font-black uppercase tracking-widest opacity-50">ALTIN AYAK ADAYLARI</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-8 pt-0">
                                            <div className="space-y-4">
                                                {stats.topScorers.map((player, i) => (
                                                    <div key={player.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black italic">
                                                                {i + 1}
                                                            </div>
                                                            <div>
                                                                <Link href={route('players.show', player.id)} className="font-black uppercase tracking-tight hover:text-blue-600 transition-colors">
                                                                    {player.first_name} {player.last_name}
                                                                </Link>
                                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">{player.unit?.name}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl font-black tabular-nums">{player.goals_count}</span>
                                                            <Goal className="h-4 w-4 text-emerald-500" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Top Assists */}
                                    <Card className="border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[3rem]">
                                        <CardHeader className="p-8">
                                            <div>
                                                <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                                    <Target className="h-5 w-5 text-blue-500" /> ASİST KRALLIĞI
                                                </CardTitle>
                                                <CardDescription className="text-xs font-black uppercase tracking-widest opacity-50">Oyun kurucu liderler</CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-8 pt-0">
                                            <div className="space-y-4">
                                                {stats.topAssists.length === 0 ? (
                                                    <div className="p-12 text-center text-[10px] font-black uppercase text-muted-foreground">Veri henüz girilmedi</div>
                                                ) : (
                                                    stats.topAssists.map((player, i) => (
                                                        <div key={player.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black italic">
                                                                   {i + 1}
                                                                </div>
                                                                <div>
                                                                    <Link href={route('players.show', player.id)} className="font-black uppercase tracking-tight hover:text-blue-600 transition-colors">
                                                                        {player.first_name} {player.last_name}
                                                                    </Link>
                                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{player.unit?.name}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-2xl font-black tabular-nums">{player.assists_count}</span>
                                                                <Target className="h-4 w-4 text-blue-500" />
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* Duos Tab */}
                            <TabsContent value="duos">
                                <Card className="border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[3rem] overflow-hidden">
                                    <CardHeader className="p-8 md:p-10 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
                                        <div>
                                            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                                <Activity className="h-6 w-6 text-blue-600 animate-pulse" /> ⚡ ÖLÜMCÜL İKİLİLER
                                            </CardTitle>
                                            <CardDescription className="text-xs font-black uppercase tracking-widest opacity-50 mt-1">ASİST - GOL UYUMU EN YÜKSEK OYUNCU ORTAKLIKLARI</CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8 md:p-10">
                                        {stats.topDuos.length === 0 ? (
                                            <div className="py-24 text-center">
                                                <Activity className="h-10 w-10 text-neutral-300 mx-auto mb-4 animate-bounce" />
                                                <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">
                                                    Bu turnuvada henüz asist-gol ortaklığı kaydı bulunmuyor.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {stats.topDuos.map((duo: any, idx: number) => (
                                                    <div key={idx} className="flex flex-col p-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[2.5rem] hover:scale-[1.01] transition-all duration-300 group">
                                                        <div className="flex items-center justify-between mb-6">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-500/10 px-3 py-1 rounded-full">ORTAKLIK #{idx + 1}</span>
                                                                {duo.team_name && (
                                                                    <Badge variant="outline" className="border-slate-300 dark:border-white/10 text-muted-foreground text-[8px] font-black uppercase px-2 py-0.5 rounded-full">{duo.team_name}</Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1 bg-blue-600 text-white font-black text-[10px] px-3.5 py-1.5 rounded-2xl shadow-lg shadow-blue-500/20">
                                                                <span className="tabular-nums text-sm mr-1">{duo.goals_count}</span> GOL
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-11 items-center gap-2 bg-white/60 dark:bg-neutral-900/60 p-4 rounded-3xl border border-slate-100/50 dark:border-white/5">
                                                            {/* Assister */}
                                                            <div className="col-span-5 text-center">
                                                                <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest block mb-1">ASİST YAPAN</span>
                                                                <Link href={route('players.show', duo.assister.id)} className="font-black uppercase tracking-tight text-xs hover:text-blue-600 dark:hover:text-blue-400 transition-colors block leading-tight truncate">
                                                                    {duo.assister.first_name} {duo.assister.last_name}
                                                                </Link>
                                                                <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider block mt-0.5 truncate">{duo.assister.unit?.name}</span>
                                                            </div>

                                                            {/* Connection arrow / lightning */}
                                                            <div className="col-span-1 flex items-center justify-center">
                                                                <div className="h-8 w-8 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                                                    ⚡
                                                                </div>
                                                            </div>

                                                            {/* Scorer */}
                                                            <div className="col-span-5 text-center">
                                                                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest block mb-1">GOLÜ ATAN</span>
                                                                <Link href={route('players.show', duo.scorer.id)} className="font-black uppercase tracking-tight text-xs hover:text-blue-600 dark:hover:text-blue-400 transition-colors block leading-tight truncate">
                                                                    {duo.scorer.first_name} {duo.scorer.last_name}
                                                                </Link>
                                                                <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider block mt-0.5 truncate">{duo.scorer.unit?.name}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Cards Tab */}
                            <TabsContent value="cards">
                                <Card className="border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[3rem] overflow-hidden">
                                    <CardHeader className="p-8 md:p-10 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
                                        <div>
                                            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                                <AlertTriangle className="h-6 w-6 text-rose-500 animate-pulse" /> CEZA VE DİSİPLİN RAPORU
                                            </CardTitle>
                                            <CardDescription className="text-xs font-black uppercase tracking-widest opacity-50 mt-1">TURNUVA BAZINDA KART GÖREN TÜM OYUNCULARIN DİSİPLİN ANALİZİ</CardDescription>
                                        </div>
                                        
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                            <div className="relative w-full sm:w-[260px] group">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-blue-600 transition-colors" />
                                                <Input
                                                    placeholder="İSİM VEYA BİRİM ARA..."
                                                    className="h-11 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-white/5 border-none uppercase font-black text-[9px] tracking-wider placeholder:text-neutral-400 shadow-inner"
                                                    value={cardSearch}
                                                    onChange={e => { setCardSearch(e.target.value); setCardPage(1); }}
                                                />
                                            </div>
                                            
                                            <div className="flex gap-1.5 bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                                                {[
                                                    { key: 'points', label: 'CEZA PUANI' },
                                                    { key: 'yellow', label: 'SARI KART' },
                                                    { key: 'red', label: 'KIRMIZI KART' }
                                                ].map((opt) => (
                                                    <Button
                                                        key={opt.key}
                                                        size="sm"
                                                        variant={cardSort === opt.key ? 'default' : 'ghost'}
                                                        className={`h-9 px-3 rounded-lg text-[8px] font-black uppercase tracking-wider ${cardSort === opt.key ? 'bg-blue-600 text-white shadow-md' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                                                        onClick={() => { setCardSort(opt.key as any); setCardPage(1); }}
                                                    >
                                                        {opt.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    
                                    <CardContent className="p-8 md:p-10">
                                        {paginatedCardPlayers.length === 0 ? (
                                            <div className="py-24 text-center">
                                                <AlertTriangle className="h-10 w-10 text-neutral-300 mx-auto mb-4 animate-bounce" />
                                                <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">
                                                    {cardSearch ? 'Arama kriterinize uygun kartlı oyuncu bulunamadı' : 'Bu turnuvada henüz kart gören oyuncu yok.'}
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {paginatedCardPlayers.map((player: any, idx: number) => {
                                                        const globalIndex = (cardPage - 1) * cardPerPage + idx + 1;
                                                        const yellowCount = parseInt(player.yellow_cards_count || 0);
                                                        const redCount = parseInt(player.red_cards_count || 0);
                                                        const totalPoints = (redCount * 3) + yellowCount;
                                                        const activeTeam = player.teams?.[0]?.name;

                                                        return (
                                                            <div key={player.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-3xl hover:bg-slate-100/50 dark:hover:bg-white/10 transition-colors group">
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black italic text-xs shrink-0 ${totalPoints >= 5 ? 'bg-rose-500/10 text-rose-600' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-neutral-400'}`}>
                                                                        #{globalIndex}
                                                                    </div>
                                                                    <div>
                                                                        <Link href={route('players.show', player.id)} className="font-black uppercase tracking-tight text-xs hover:text-blue-600 dark:hover:text-blue-400 transition-colors block">
                                                                            {player.first_name} {player.last_name}
                                                                        </Link>
                                                                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                                            {activeTeam && <Badge variant="outline" className="border-blue-500/20 text-blue-600 text-[8px] font-black uppercase px-1.5 py-0.5 rounded">{activeTeam}</Badge>}
                                                                            <span className="text-[9px] font-bold text-neutral-400 uppercase">{player.unit?.name}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex gap-2">
                                                                        {yellowCount > 0 && (
                                                                            <div className="flex items-center gap-1.5 bg-amber-400/5 px-2 py-1 rounded-xl border border-amber-400/10">
                                                                                <div className="w-2.5 h-4 bg-amber-400 border border-amber-500 rounded-sm shadow-sm" />
                                                                                <span className="text-[11px] font-black tabular-nums">{yellowCount}</span>
                                                                            </div>
                                                                        )}
                                                                        {redCount > 0 && (
                                                                            <div className="flex items-center gap-1.5 bg-rose-500/5 px-2 py-1 rounded-xl border border-rose-500/10">
                                                                                <div className="w-2.5 h-4 bg-rose-600 border border-rose-700 rounded-sm shadow-sm" />
                                                                                <span className="text-[11px] font-black tabular-nums">{redCount}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <Badge className="bg-slate-900 dark:bg-white/10 text-white border-none font-black text-[8px] px-2.5 py-1.5 rounded-lg shrink-0">
                                                                        {totalPoints} PUAN
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                
                                                {/* Card List Pagination */}
                                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                                                    <p className="text-[9px] font-black uppercase text-neutral-400 tracking-widest">
                                                        SAYFA {cardPage} / {totalCardPages} <span className="mx-2 opacity-30">•</span> TOPLAM {filteredCardPlayers.length} OYUNCU LİSTELENİYOR
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            disabled={cardPage === 1}
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setCardPage(prev => Math.max(1, prev - 1))}
                                                            className="h-10 px-4 rounded-xl border-slate-200 dark:border-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                                                        >
                                                            ÖNCEKİ
                                                        </Button>
                                                        <Button
                                                            disabled={cardPage === totalCardPages}
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setCardPage(prev => Math.min(totalCardPages, prev + 1))}
                                                            className="h-10 px-4 rounded-xl border-slate-200 dark:border-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                                                        >
                                                            SONRAKİ
                                                        </Button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Teams Tab */}
                            <TabsContent value="teams">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Offensive Records */}
                                    <Card className="border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[3rem]">
                                        <CardHeader className="p-8">
                                            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                                <Goal className="h-5 w-5 text-orange-500" /> EN İYİ HÜCUM
                                            </CardTitle>
                                            <CardDescription className="text-xs font-black uppercase tracking-widest opacity-50">RAKİP FİLELERİ SARSAN EKİPLER</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-8 pt-0">
                                            <div className="space-y-4">
                                                {stats.bestAttacks.map((entry, i) => (
                                                    <div key={entry.team.id} className="grid grid-cols-12 items-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group">
                                                        <div className="col-span-8 flex items-center gap-4">
                                                            <span className="w-6 text-[10px] font-black text-orange-600">#{i + 1}</span>
                                                            <div>
                                                                <Badge variant="outline" className="border-orange-500/20 text-orange-600 text-[8px] mb-1">{entry.team.unit?.name}</Badge>
                                                                <h4 className="font-black uppercase tracking-tight text-sm">{entry.team.name}</h4>
                                                            </div>
                                                        </div>
                                                        <div className="col-span-4 flex flex-col items-end">
                                                            <span className="text-2xl font-black tabular-nums">{entry.goals_scored}</span>
                                                            <span className="text-[8px] font-black uppercase text-muted-foreground">TOPLAM GOL</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Defensive Records */}
                                    <Card className="border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[3rem]">
                                        <CardHeader className="p-8">
                                            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                                <Shield className="h-5 w-5 text-emerald-600" /> EN İYİ SAVUNMA
                                            </CardTitle>
                                            <CardDescription className="text-xs font-black uppercase tracking-widest opacity-50">KALESİNİ GÖLE KAPATAN EKİPLER</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-8 pt-0">
                                            <div className="space-y-4">
                                                {stats.bestDefenses.map((entry, i) => (
                                                    <div key={entry.team.id} className="grid grid-cols-12 items-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group">
                                                        <div className="col-span-8 flex items-center gap-4">
                                                            <span className="w-6 text-[10px] font-black text-emerald-600">#{i + 1}</span>
                                                            <div>
                                                                <Badge variant="outline" className="border-emerald-500/20 text-emerald-600 text-[8px] mb-1">{entry.team.unit?.name}</Badge>
                                                                <h4 className="font-black uppercase tracking-tight text-sm">{entry.team.name}</h4>
                                                            </div>
                                                        </div>
                                                        <div className="col-span-4 flex flex-col items-end">
                                                            <span className="text-2xl font-black tabular-nums">{entry.clean_sheets}</span>
                                                            <span className="text-[8px] font-black uppercase text-muted-foreground">MAÇTA GOL YEMEDİ</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Fair Play Table */}
                                    <Card className="border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[3rem]">
                                        <CardHeader className="p-8">
                                            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                                <TrendingUp className="h-5 w-5 text-blue-600" /> FAIR-PLAY TABLOSU
                                            </CardTitle>
                                            <CardDescription className="text-xs font-black uppercase tracking-widest opacity-50">CEZA PUANI EN DÜŞÜK OLANLAR (Sarı: 1, Kırmızı: 3)</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-8 pt-0">
                                            <div className="space-y-4">
                                                {stats.fairPlay.map((entry, i) => (
                                                    <div key={entry.team.id} className="grid grid-cols-12 items-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group">
                                                        <div className="col-span-7 flex items-center gap-4">
                                                            <span className="w-6 text-[10px] font-black text-blue-600">#{i + 1}</span>
                                                            <div>
                                                                <Badge variant="outline" className="border-blue-500/20 text-blue-600 text-[8px] mb-1">{entry.team.unit?.name || 'GENEL'}</Badge>
                                                                <h4 className="font-black uppercase tracking-tight text-sm">{entry.team.name}</h4>
                                                            </div>
                                                        </div>
                                                        <div className="col-span-5 flex items-center justify-end gap-3">
                                                            <div className="flex gap-2">
                                                                <div className="flex items-center gap-1.5 bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/10">
                                                                    <div className="w-2 h-3 bg-amber-400 rounded-sm" />
                                                                    <span className="text-[10px] font-black tabular-nums">{entry.yellow_cards}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10">
                                                                    <div className="w-2 h-3 bg-rose-600 rounded-sm" />
                                                                    <span className="text-[10px] font-black tabular-nums">{entry.red_cards}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end shrink-0 min-w-[55px]">
                                                                <span className="text-2xl font-black tabular-nums text-blue-600">{entry.points}</span>
                                                                <span className="text-[8px] font-black uppercase text-muted-foreground">CEZA PUANI</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* Unit Distribution Tab */}
                            <TabsContent value="units">
                                <Card className="border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[3rem] overflow-hidden">
                                    <CardHeader className="p-8">
                                        <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                            <BarChart3 className="h-5 w-5 text-rose-600" /> BİRİM BAŞARI ANALİZİ
                                        </CardTitle>
                                        <CardDescription className="text-xs font-black uppercase tracking-widest opacity-50">BİRİM BAZLI TOPLAM ÜRETİLEN SKOR</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8 h-[450px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={stats.unitGoals}>
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                                <Tooltip 
                                                    cursor={{ fill: 'transparent' }}
                                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                                />
                                                <Bar dataKey="goals_count" radius={[10, 10, 0, 0]}>
                                                    {stats.unitGoals.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Comparison Center Tab */}
                            <TabsContent value="compare">
                                <div className="space-y-8">
                                    {/* Mode Selector & Search Comboboxes */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[2rem]">
                                        <div className="flex gap-2">
                                            <Button
                                                variant={compareMode === 'players' ? 'default' : 'outline'}
                                                onClick={() => setCompareMode('players')}
                                                className="rounded-2xl font-black text-xs uppercase tracking-wider"
                                            >
                                                🏃 OYUNCU KIYASLA
                                            </Button>
                                            <Button
                                                variant={compareMode === 'teams' ? 'default' : 'outline'}
                                                onClick={() => setCompareMode('teams')}
                                                className="rounded-2xl font-black text-xs uppercase tracking-wider"
                                            >
                                                🛡️ TAKIM KIYASLA
                                            </Button>
                                        </div>
                                        <div className="text-xs font-black uppercase text-muted-foreground tracking-widest bg-white dark:bg-neutral-900 px-4 py-2 rounded-2xl border border-slate-100 dark:border-white/5">
                                            BİREBİR HEAD-TO-HEAD KIYASLAMA ANALİZİ
                                        </div>
                                    </div>

                                    {/* Search Combobox Area */}
                                    {compareMode === 'players' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative">
                                            {/* Player 1 Selection */}
                                            <div className="relative">
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">1. OYUNCU SEÇİMİ</label>
                                                <div 
                                                    className="w-full p-4 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/10 rounded-2xl cursor-pointer hover:border-blue-500 transition-colors flex justify-between items-center"
                                                    onClick={() => setIsOpenP1(!isOpenP1)}
                                                >
                                                    <div>
                                                        <h4 className="font-black text-sm uppercase tracking-tight">
                                                            {playersList.find(p => p.id === comparePlayer1Id)?.name || 'Oyuncu Seçin'}
                                                        </h4>
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                            {playersList.find(p => p.id === comparePlayer1Id)?.team_name || '-'} • {playersList.find(p => p.id === comparePlayer1Id)?.unit_name || '-'}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs font-black text-blue-600">DEĞİŞTİR</span>
                                                </div>
                                                {isOpenP1 && (
                                                    <div className="absolute left-0 right-0 mt-2 p-4 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 max-h-[350px] flex flex-col gap-2">
                                                        <div className="relative">
                                                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                            <Input 
                                                                className="pl-9 rounded-xl font-bold" 
                                                                placeholder="Oyuncu veya birim ara..." 
                                                                value={searchP1} 
                                                                onChange={(e) => setSearchP1(e.target.value)} 
                                                            />
                                                        </div>
                                                        <div className="overflow-y-auto space-y-1 pr-1">
                                                            {playersList
                                                                .filter(p => p.name.toLowerCase().includes(searchP1.toLowerCase()) || p.team_name.toLowerCase().includes(searchP1.toLowerCase()) || p.unit_name.toLowerCase().includes(searchP1.toLowerCase()))
                                                                .map(p => (
                                                                    <div 
                                                                        key={p.id} 
                                                                        onClick={() => {
                                                                            setComparePlayer1Id(p.id);
                                                                            setIsOpenP1(false);
                                                                            setSearchP1('');
                                                                        }}
                                                                        className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-colors flex justify-between items-center"
                                                                    >
                                                                        <div>
                                                                            <p className="text-xs font-black uppercase tracking-tight">{p.name}</p>
                                                                            <p className="text-[9px] font-bold text-muted-foreground uppercase">{p.team_name} • {p.unit_name}</p>
                                                                        </div>
                                                                        <Badge className="font-extrabold bg-blue-600/10 text-blue-600 border-none hover:bg-blue-600/10">{p.rating} Puan</Badge>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Player 2 Selection */}
                                            <div className="relative">
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">2. OYUNCU SEÇİMİ</label>
                                                <div 
                                                    className="w-full p-4 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/10 rounded-2xl cursor-pointer hover:border-amber-500 transition-colors flex justify-between items-center"
                                                    onClick={() => setIsOpenP2(!isOpenP2)}
                                                >
                                                    <div>
                                                        <h4 className="font-black text-sm uppercase tracking-tight">
                                                            {playersList.find(p => p.id === comparePlayer2Id)?.name || 'Oyuncu Seçin'}
                                                        </h4>
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                            {playersList.find(p => p.id === comparePlayer2Id)?.team_name || '-'} • {playersList.find(p => p.id === comparePlayer2Id)?.unit_name || '-'}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs font-black text-amber-600">DEĞİŞTİR</span>
                                                </div>
                                                {isOpenP2 && (
                                                    <div className="absolute left-0 right-0 mt-2 p-4 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 max-h-[350px] flex flex-col gap-2">
                                                        <div className="relative">
                                                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                            <Input 
                                                                className="pl-9 rounded-xl font-bold" 
                                                                placeholder="Oyuncu veya birim ara..." 
                                                                value={searchP2} 
                                                                onChange={(e) => setSearchP2(e.target.value)} 
                                                            />
                                                        </div>
                                                        <div className="overflow-y-auto space-y-1 pr-1">
                                                            {playersList
                                                                .filter(p => p.name.toLowerCase().includes(searchP2.toLowerCase()) || p.team_name.toLowerCase().includes(searchP2.toLowerCase()) || p.unit_name.toLowerCase().includes(searchP2.toLowerCase()))
                                                                .map(p => (
                                                                    <div 
                                                                        key={p.id} 
                                                                        onClick={() => {
                                                                            setComparePlayer2Id(p.id);
                                                                            setIsOpenP2(false);
                                                                            setSearchP2('');
                                                                        }}
                                                                        className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-colors flex justify-between items-center"
                                                                    >
                                                                        <div>
                                                                            <p className="text-xs font-black uppercase tracking-tight">{p.name}</p>
                                                                            <p className="text-[9px] font-bold text-muted-foreground uppercase">{p.team_name} • {p.unit_name}</p>
                                                                        </div>
                                                                        <Badge className="font-extrabold bg-amber-500/10 text-amber-600 border-none hover:bg-amber-500/10">{p.rating} Puan</Badge>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative">
                                            {/* Team 1 Selection */}
                                            <div className="relative">
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">1. TAKIM SEÇİMİ</label>
                                                <div 
                                                    className="w-full p-4 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/10 rounded-2xl cursor-pointer hover:border-blue-500 transition-colors flex justify-between items-center"
                                                    onClick={() => setIsOpenT1(!isOpenT1)}
                                                >
                                                    <div>
                                                        <h4 className="font-black text-sm uppercase tracking-tight">
                                                            {teamsList.find(t => t.id === compareTeam1Id)?.name || 'Takım Seçin'}
                                                        </h4>
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                            {teamsList.find(t => t.id === compareTeam1Id)?.unit_name || '-'}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs font-black text-blue-600">DEĞİŞTİR</span>
                                                </div>
                                                {isOpenT1 && (
                                                    <div className="absolute left-0 right-0 mt-2 p-4 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 max-h-[350px] flex flex-col gap-2">
                                                        <div className="relative">
                                                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                            <Input 
                                                                className="pl-9 rounded-xl font-bold" 
                                                                placeholder="Takım veya birim ara..." 
                                                                value={searchT1} 
                                                                onChange={(e) => setSearchT1(e.target.value)} 
                                                            />
                                                        </div>
                                                        <div className="overflow-y-auto space-y-1 pr-1">
                                                            {teamsList
                                                                .filter(t => t.name.toLowerCase().includes(searchT1.toLowerCase()) || t.unit_name.toLowerCase().includes(searchT1.toLowerCase()))
                                                                .map(t => (
                                                                    <div 
                                                                        key={t.id} 
                                                                        onClick={() => {
                                                                            setCompareTeam1Id(t.id);
                                                                            setIsOpenT1(false);
                                                                            setSearchT1('');
                                                                        }}
                                                                        className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-colors flex justify-between items-center"
                                                                    >
                                                                        <div>
                                                                            <p className="text-xs font-black uppercase tracking-tight">{t.name}</p>
                                                                            <p className="text-[9px] font-bold text-muted-foreground uppercase">{t.unit_name}</p>
                                                                        </div>
                                                                        <Badge className="font-extrabold bg-blue-600/10 text-blue-600 border-none hover:bg-blue-600/10">{t.points} Puan</Badge>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Team 2 Selection */}
                                            <div className="relative">
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">2. TAKIM SEÇİMİ</label>
                                                <div 
                                                    className="w-full p-4 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/10 rounded-2xl cursor-pointer hover:border-amber-500 transition-colors flex justify-between items-center"
                                                    onClick={() => setIsOpenT2(!isOpenT2)}
                                                >
                                                    <div>
                                                        <h4 className="font-black text-sm uppercase tracking-tight">
                                                            {teamsList.find(t => t.id === compareTeam2Id)?.name || 'Takım Seçin'}
                                                        </h4>
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                            {teamsList.find(t => t.id === compareTeam2Id)?.unit_name || '-'}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs font-black text-amber-600">DEĞİŞTİR</span>
                                                </div>
                                                {isOpenT2 && (
                                                    <div className="absolute left-0 right-0 mt-2 p-4 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 max-h-[350px] flex flex-col gap-2">
                                                        <div className="relative">
                                                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                            <Input 
                                                                className="pl-9 rounded-xl font-bold" 
                                                                placeholder="Takım veya birim ara..." 
                                                                value={searchT2} 
                                                                onChange={(e) => setSearchT2(e.target.value)} 
                                                            />
                                                        </div>
                                                        <div className="overflow-y-auto space-y-1 pr-1">
                                                            {teamsList
                                                                .filter(t => t.name.toLowerCase().includes(searchT2.toLowerCase()) || t.unit_name.toLowerCase().includes(searchT2.toLowerCase()))
                                                                .map(t => (
                                                                    <div 
                                                                        key={t.id} 
                                                                        onClick={() => {
                                                                            setCompareTeam2Id(t.id);
                                                                            setIsOpenT2(false);
                                                                            setSearchT2('');
                                                                        }}
                                                                        className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-colors flex justify-between items-center"
                                                                    >
                                                                        <div>
                                                                            <p className="text-xs font-black uppercase tracking-tight">{t.name}</p>
                                                                            <p className="text-[9px] font-bold text-muted-foreground uppercase">{t.unit_name}</p>
                                                                        </div>
                                                                        <Badge className="font-extrabold bg-amber-500/10 text-amber-600 border-none hover:bg-amber-500/10">{t.points} Puan</Badge>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Display Comparison Content */}
                                    {compareMode === 'players' ? (
                                        (() => {
                                            const p1 = playersList.find(p => p.id === comparePlayer1Id);
                                            const p2 = playersList.find(p => p.id === comparePlayer2Id);

                                            if (!p1 || !p2) return null;

                                            // Radar Data Setup
                                            const radarData = [
                                                { subject: 'Gol ⚽', p1: p1.goals, p2: p2.goals },
                                                { subject: 'Asist 🎯', p1: p1.assists, p2: p2.assists },
                                                { subject: 'Maç Sayısı 🏃', p1: p1.played_matches, p2: p2.played_matches },
                                                { subject: 'M.B. Skor 📈', p1: parseFloat((p1.goals_per_match + p1.assists_per_match).toFixed(1)), p2: parseFloat((p2.goals_per_match + p2.assists_per_match).toFixed(1)) },
                                                { subject: 'Performans ⭐', p1: Math.max(0, p1.rating), p2: Math.max(0, p2.rating) },
                                            ];

                                            const compareMetrics = [
                                                { label: 'REYTING / PERFORMANS SKORU', val1: p1.rating, val2: p2.rating, suffix: ' Puan', lowerIsBetter: false },
                                                { label: 'TOPLAM GOL', val1: p1.goals, val2: p2.goals, suffix: ' Gol', lowerIsBetter: false },
                                                { label: 'TOPLAM ASİST', val1: p1.assists, val2: p2.assists, suffix: ' Asist', lowerIsBetter: false },
                                                { label: 'MAÇ SAYISI', val1: p1.played_matches, val2: p2.played_matches, suffix: ' Maç', lowerIsBetter: false },
                                                { label: 'MAÇ BAŞI GOL ORTALAMASI', val1: p1.goals_per_match, val2: p2.goals_per_match, suffix: ' Gol/Maç', lowerIsBetter: false },
                                                { label: 'MAÇ BAŞI ASİST ORTALAMASI', val1: p1.assists_per_match, val2: p2.assists_per_match, suffix: ' Asist/Maç', lowerIsBetter: false },
                                                { label: 'KART CEZA PUANI (Sarı: 1, Kırmızı: 3)', val1: p1.yellow_cards * 1 + p1.red_cards * 3, val2: p2.yellow_cards * 1 + p2.red_cards * 3, suffix: ' Ceza Puanı', lowerIsBetter: true },
                                            ];

                                            return (
                                                <div className="space-y-8">
                                                    {/* Header Cards (Birebir Profil) */}
                                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                                                        {/* Player 1 Card */}
                                                        <div className="lg:col-span-5 p-8 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-2 border-blue-500/20 rounded-[3rem] shadow-xl relative overflow-hidden group">
                                                            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                                                            <Badge variant="outline" className="border-blue-500/30 text-blue-600 mb-4">{p1.unit_name}</Badge>
                                                            <h2 className="text-3xl font-black uppercase tracking-tighter text-blue-600 truncate">{p1.name}</h2>
                                                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mt-1 truncate">{p1.team_name}</p>
                                                            <div className="mt-6 flex items-center justify-between">
                                                                <div className="space-y-1">
                                                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">TOPLAM SKOR KATKISI</p>
                                                                    <span className="text-2xl font-black text-blue-600">{p1.goals + p1.assists}</span>
                                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase ml-1">GOL+ASİST</span>
                                                                </div>
                                                                <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-black flex flex-col items-center justify-center border-4 border-white shadow-lg shadow-blue-500/20">
                                                                    <span className="text-[8px] tracking-tighter opacity-80 uppercase leading-none">RATING</span>
                                                                    <span className="text-lg leading-tight mt-0.5">{p1.rating}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* VS Glowing Badge */}
                                                        <div className="lg:col-span-2 flex justify-center z-10">
                                                            <div className="w-16 h-16 rounded-full bg-rose-600 text-white font-black flex items-center justify-center text-xl shadow-2xl shadow-rose-950/40 border-[5px] border-white dark:border-neutral-900 animate-pulse">
                                                                VS
                                                            </div>
                                                        </div>

                                                        {/* Player 2 Card */}
                                                        <div className="lg:col-span-5 p-8 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/20 rounded-[3rem] shadow-xl relative overflow-hidden group">
                                                            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-amber-600/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                                                            <Badge variant="outline" className="border-amber-500/30 text-amber-600 mb-4">{p2.unit_name}</Badge>
                                                            <h2 className="text-3xl font-black uppercase tracking-tighter text-amber-600 truncate">{p2.name}</h2>
                                                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mt-1 truncate">{p2.team_name}</p>
                                                            <div className="mt-6 flex items-center justify-between">
                                                                <div className="space-y-1">
                                                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">TOPLAM SKOR KATKISI</p>
                                                                    <span className="text-2xl font-black text-amber-600">{p2.goals + p2.assists}</span>
                                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase ml-1">GOL+ASİST</span>
                                                                </div>
                                                                <div className="w-16 h-16 rounded-full bg-amber-500 text-white font-black flex flex-col items-center justify-center border-4 border-white shadow-lg shadow-amber-500/20">
                                                                    <span className="text-[8px] tracking-tighter opacity-80 uppercase leading-none">RATING</span>
                                                                    <span className="text-lg leading-tight mt-0.5">{p2.rating}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Comparative Visualizations */}
                                                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                                                        {/* Radar Chart */}
                                                        <Card className="xl:col-span-5 border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[3rem] overflow-hidden">
                                                            <CardHeader className="p-8">
                                                                <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-3">
                                                                    <Activity className="h-5 w-5 text-indigo-600" /> OYUNCU GÜÇ RADARI
                                                                </CardTitle>
                                                                <CardDescription className="text-xs font-black uppercase tracking-widest opacity-50">ÖZELLİK BAZLI DENGE GRAFİĞİ</CardDescription>
                                                            </CardHeader>
                                                            <CardContent className="p-8 pt-0 h-[380px] flex items-center justify-center">
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                                                        <PolarGrid gridType="circle" strokeOpacity={0.1} />
                                                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                                                                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fontSize: 8 }} />
                                                                        <Radar name={p1.name} dataKey="p1" stroke="#2563eb" fill="#2563eb" fillOpacity={0.25} />
                                                                        <Radar name={p2.name} dataKey="p2" stroke="#d97706" fill="#d97706" fillOpacity={0.25} />
                                                                        <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                                                    </RadarChart>
                                                                </ResponsiveContainer>
                                                            </CardContent>
                                                        </Card>

                                                        {/* Detailed Comparison Bars */}
                                                        <Card className="xl:col-span-7 border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[3rem]">
                                                            <CardHeader className="p-8">
                                                                <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-3">
                                                                    <TrendingUp className="h-5 w-5 text-blue-600" /> DETAYLI KARŞILAŞTIRMA
                                                                </CardTitle>
                                                                <CardDescription className="text-xs font-black uppercase tracking-widest opacity-50">İSTATİSTİK BAZLI KIYASLAMA BARI</CardDescription>
                                                            </CardHeader>
                                                            <CardContent className="p-8 pt-0 space-y-5">
                                                                {compareMetrics.map((metric, i) => {
                                                                    const total = metric.val1 + metric.val2;
                                                                    const p1Percent = total > 0 ? (metric.val1 / total) * 100 : 50;
                                                                    const p2Percent = total > 0 ? (metric.val2 / total) * 100 : 50;
                                                                    const isP1Superior = metric.lowerIsBetter ? metric.val1 < metric.val2 : metric.val1 > metric.val2;
                                                                    const isP2Superior = metric.lowerIsBetter ? metric.val2 < metric.val1 : metric.val2 > metric.val1;

                                                                    return (
                                                                        <div key={i} className="space-y-1.5">
                                                                            <div className="flex justify-between items-center text-xs">
                                                                                <span className={`font-black tracking-tight ${isP1Superior ? 'text-blue-600 font-extrabold text-sm' : 'text-muted-foreground'}`}>
                                                                                    {metric.val1}{metric.suffix}
                                                                                </span>
                                                                                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                                                                    {metric.label}
                                                                                </span>
                                                                                <span className={`font-black tracking-tight ${isP2Superior ? 'text-amber-600 font-extrabold text-sm' : 'text-muted-foreground'}`}>
                                                                                    {metric.val2}{metric.suffix}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <div className="flex-1 h-2.5 bg-slate-50 dark:bg-white/5 rounded-l-full overflow-hidden flex justify-end">
                                                                                    <div 
                                                                                        className={`h-full transition-all duration-500 ${isP1Superior ? 'bg-gradient-to-l from-blue-600 to-indigo-500 shadow-md shadow-blue-500/20' : 'bg-slate-300 dark:bg-neutral-700'}`} 
                                                                                        style={{ width: `${p1Percent}%` }} 
                                                                                    />
                                                                                </div>
                                                                                <div className="flex-1 h-2.5 bg-slate-50 dark:bg-white/5 rounded-r-full overflow-hidden flex justify-start">
                                                                                    <div 
                                                                                        className={`h-full transition-all duration-500 ${isP2Superior ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-md shadow-amber-500/20' : 'bg-slate-300 dark:bg-neutral-700'}`} 
                                                                                        style={{ width: `${p2Percent}%` }} 
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        (() => {
                                            const t1 = teamsList.find(t => t.id === compareTeam1Id);
                                            const t2 = teamsList.find(t => t.id === compareTeam2Id);

                                            if (!t1 || !t2) return null;

                                            // Radar Data Setup
                                            const teamRadarData = [
                                                { subject: 'Puan 🏆', t1: t1.points, t2: t2.points },
                                                { subject: 'Gol Atılan ⚽', t1: t1.goals_for, t2: t2.goals_for },
                                                { subject: 'Gol Yenen 🛡️', t1: Math.max(0, 30 - t1.goals_against), t2: Math.max(0, 30 - t2.goals_against) },
                                                { subject: 'G. Yememe 🧤', t1: t1.clean_sheets, t2: t2.clean_sheets },
                                                { subject: 'G. Yüzdesi 📈', t1: parseFloat((t1.win_ratio / 10).toFixed(1)), t2: parseFloat((t2.win_ratio / 10).toFixed(1)) },
                                            ];

                                            const teamMetrics = [
                                                { label: 'TOPLAM PUAN', val1: t1.points, val2: t2.points, suffix: ' Puan', lowerIsBetter: false },
                                                { label: 'MAÇ SAYISI', val1: t1.played, val2: t2.played, suffix: ' Maç', lowerIsBetter: false },
                                                { label: 'GALİBİYET SAYISI', val1: t1.wins, val2: t2.wins, suffix: ' Galibiyet', lowerIsBetter: false },
                                                { label: 'BERABERLİK SAYISI', val1: t1.draws, val2: t2.draws, suffix: ' Beraberlik', lowerIsBetter: false },
                                                { label: 'MAĞLUBİYET SAYISI', val1: t1.losses, val2: t2.losses, suffix: ' Mağlubiyet', lowerIsBetter: true },
                                                { label: 'KAZANMA ORANI (%)', val1: t1.win_ratio, val2: t2.win_ratio, suffix: '%', lowerIsBetter: false },
                                                { label: 'ATILAN GOL (HÜCUM GÜCÜ)', val1: t1.goals_for, val2: t2.goals_for, suffix: ' Gol', lowerIsBetter: false },
                                                { label: 'YENEN GOL (SAVUNMA DUVARI)', val1: t1.goals_against, val2: t2.goals_against, suffix: ' Gol', lowerIsBetter: true },
                                                { label: 'AVERRAJ (GOL FARKI)', val1: t1.goal_difference, val2: t2.goal_difference, suffix: ' Averaj', lowerIsBetter: false },
                                                { label: 'GOL YEMEDİĞİ MAÇ (CLEAN SHEET)', val1: t1.clean_sheets, val2: t2.clean_sheets, suffix: ' Maç', lowerIsBetter: false },
                                                { label: 'SARI KART CEZASI', val1: t1.yellow_cards, val2: t2.yellow_cards, suffix: ' Kart', lowerIsBetter: true },
                                                { label: 'KIRMIZI KART CEZASI', val1: t1.red_cards, val2: t2.red_cards, suffix: ' Kart', lowerIsBetter: true },
                                            ];

                                            return (
                                                <div className="space-y-8">
                                                    {/* Header Cards */}
                                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                                                        {/* Team 1 Card */}
                                                        <div className="lg:col-span-5 p-8 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-2 border-blue-500/20 rounded-[3rem] shadow-xl relative overflow-hidden group">
                                                            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                                                            <Badge variant="outline" className="border-blue-500/30 text-blue-600 mb-4">{t1.unit_name}</Badge>
                                                            <h2 className="text-3xl font-black uppercase tracking-tighter text-blue-600 truncate">{t1.name}</h2>
                                                            <div className="mt-6 flex items-center justify-between">
                                                                <div className="space-y-1">
                                                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">KAZANMA ORANI</p>
                                                                    <span className="text-2xl font-black text-blue-600">%{t1.win_ratio}</span>
                                                                </div>
                                                                <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-black flex flex-col items-center justify-center border-4 border-white shadow-lg shadow-blue-500/20">
                                                                    <span className="text-[8px] tracking-tighter opacity-80 uppercase leading-none">PUAN</span>
                                                                    <span className="text-lg leading-tight mt-0.5">{t1.points}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* VS Glowing Badge */}
                                                        <div className="lg:col-span-2 flex justify-center z-10">
                                                            <div className="w-16 h-16 rounded-full bg-rose-600 text-white font-black flex items-center justify-center text-xl shadow-2xl shadow-rose-950/40 border-[5px] border-white dark:border-neutral-900 animate-pulse">
                                                                VS
                                                            </div>
                                                        </div>

                                                        {/* Team 2 Card */}
                                                        <div className="lg:col-span-5 p-8 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/20 rounded-[3rem] shadow-xl relative overflow-hidden group">
                                                            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-amber-600/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                                                            <Badge variant="outline" className="border-amber-500/30 text-amber-600 mb-4">{t2.unit_name}</Badge>
                                                            <h2 className="text-3xl font-black uppercase tracking-tighter text-amber-600 truncate">{t2.name}</h2>
                                                            <div className="mt-6 flex items-center justify-between">
                                                                <div className="space-y-1">
                                                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">KAZANMA ORANI</p>
                                                                    <span className="text-2xl font-black text-amber-600">%{t2.win_ratio}</span>
                                                                </div>
                                                                <div className="w-16 h-16 rounded-full bg-amber-500 text-white font-black flex flex-col items-center justify-center border-4 border-white shadow-lg shadow-amber-500/20">
                                                                    <span className="text-[8px] tracking-tighter opacity-80 uppercase leading-none">PUAN</span>
                                                                    <span className="text-lg leading-tight mt-0.5">{t2.points}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Comparative Visualizations */}
                                                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                                                        {/* Radar Chart */}
                                                        <Card className="xl:col-span-5 border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[3rem] overflow-hidden">
                                                            <CardHeader className="p-8">
                                                                <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-3">
                                                                    <Activity className="h-5 w-5 text-indigo-600" /> TAKIM GÜÇ RADARI
                                                                </CardTitle>
                                                                <CardDescription className="text-xs font-black uppercase tracking-widest opacity-50">TAKIMSAL GÜÇ DENGESİ</CardDescription>
                                                            </CardHeader>
                                                            <CardContent className="p-8 pt-0 h-[380px] flex items-center justify-center">
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={teamRadarData}>
                                                                        <PolarGrid gridType="circle" strokeOpacity={0.1} />
                                                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                                                                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fontSize: 8 }} />
                                                                        <Radar name={t1.name} dataKey="t1" stroke="#2563eb" fill="#2563eb" fillOpacity={0.25} />
                                                                        <Radar name={t2.name} dataKey="t2" stroke="#d97706" fill="#d97706" fillOpacity={0.25} />
                                                                        <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                                                    </RadarChart>
                                                                </ResponsiveContainer>
                                                            </CardContent>
                                                        </Card>

                                                        {/* Detailed Comparison Bars */}
                                                        <Card className="xl:col-span-7 border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[3rem]">
                                                            <CardHeader className="p-8">
                                                                <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-3">
                                                                    <TrendingUp className="h-5 w-5 text-blue-600" /> TAKIM DETAY DETAYLARI
                                                                </CardTitle>
                                                                <CardDescription className="text-xs font-black uppercase tracking-widest opacity-50">İSTATİSTİKSEL DETAY GÖSTERGELERİ</CardDescription>
                                                            </CardHeader>
                                                            <CardContent className="p-8 pt-0 space-y-5">
                                                                {teamMetrics.map((metric, i) => {
                                                                    const total = metric.val1 + metric.val2;
                                                                    const p1Percent = total > 0 ? (metric.val1 / total) * 100 : 50;
                                                                    const p2Percent = total > 0 ? (metric.val2 / total) * 100 : 50;
                                                                    const isP1Superior = metric.lowerIsBetter ? metric.val1 < metric.val2 : metric.val1 > metric.val2;
                                                                    const isP2Superior = metric.lowerIsBetter ? metric.val2 < metric.val1 : metric.val2 > metric.val1;

                                                                    return (
                                                                        <div key={i} className="space-y-1.5">
                                                                            <div className="flex justify-between items-center text-xs">
                                                                                <span className={`font-black tracking-tight ${isP1Superior ? 'text-blue-600 font-extrabold text-sm' : 'text-muted-foreground'}`}>
                                                                                    {metric.val1}{metric.suffix}
                                                                                </span>
                                                                                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                                                                    {metric.label}
                                                                                </span>
                                                                                <span className={`font-black tracking-tight ${isP2Superior ? 'text-amber-600 font-extrabold text-sm' : 'text-muted-foreground'}`}>
                                                                                    {metric.val2}{metric.suffix}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <div className="flex-1 h-2.5 bg-slate-50 dark:bg-white/5 rounded-l-full overflow-hidden flex justify-end">
                                                                                    <div 
                                                                                        className={`h-full transition-all duration-500 ${isP1Superior ? 'bg-gradient-to-l from-blue-600 to-indigo-500 shadow-md shadow-blue-500/20' : 'bg-slate-300 dark:bg-neutral-700'}`} 
                                                                                        style={{ width: `${p1Percent}%` }} 
                                                                                    />
                                                                                </div>
                                                                                <div className="flex-1 h-2.5 bg-slate-50 dark:bg-white/5 rounded-r-full overflow-hidden flex justify-start">
                                                                                    <div 
                                                                                        className={`h-full transition-all duration-500 ${isP2Superior ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-md shadow-amber-500/20' : 'bg-slate-300 dark:bg-neutral-700'}`} 
                                                                                        style={{ width: `${p2Percent}%` }} 
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                </div>
                                            );
                                        })()
                                    )}
                                </div>
                            </TabsContent>

                            {/* Dream Team Tab */}
                            <TabsContent value="dream_team">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Left: Pitch Visualizer (2 Columns on large screens) */}
                                    <div className="lg:col-span-2 flex flex-col items-center">
                                        <div className="w-full max-w-[550px] relative aspect-[3/4.5] bg-gradient-to-b from-emerald-800 to-emerald-950 border-[6px] border-white/70 rounded-[3rem] shadow-2xl overflow-hidden group">
                                            {/* Pitch Stripes */}
                                            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.06)_50%,transparent_50%)] bg-[length:100%_12.5%] pointer-events-none" />
                                            
                                            {/* Pitch Markings */}
                                            {/* Center Line */}
                                            <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/40 -translate-y-1/2 pointer-events-none" />
                                            {/* Center Circle */}
                                            <div className="absolute top-1/2 left-1/2 w-[24%] aspect-square rounded-full border-4 border-white/40 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                                            {/* Center Dot */}
                                            <div className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-white/60 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                                            
                                            {/* Top Goal Box */}
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[48%] h-[12%] border-b-4 border-x-4 border-white/40 rounded-b-[2rem] pointer-events-none" />
                                            {/* Top Penalty Circle segment */}
                                            <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[20%] h-[5%] border-b-4 border-white/40 rounded-b-full pointer-events-none" />

                                            {/* Bottom Goal Box */}
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[48%] h-[12%] border-t-4 border-x-4 border-white/40 rounded-t-[2rem] pointer-events-none" />
                                            {/* Bottom Penalty Circle segment */}
                                            <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 w-[20%] h-[5%] border-t-4 border-white/40 rounded-t-full pointer-events-none" />

                                            {/* Render Dream Team Players on the Pitch */}
                                            {stats.dreamTeam && stats.dreamTeam.length > 0 ? (
                                                stats.dreamTeam.map((item, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        className={`absolute ${item.coords} flex flex-col items-center group/shirt cursor-pointer transition-transform duration-300 hover:scale-110 z-20`}
                                                    >
                                                        {/* Player Shirt Icon / Card */}
                                                        <div className="relative flex items-center justify-center">
                                                            {/* Shiny Jersey Card */}
                                                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-amber-600 border-2 border-white flex items-center justify-center font-black text-white text-xs md:text-sm shadow-xl shadow-amber-950/40 relative z-10 group-hover/shirt:rotate-12 transition-transform duration-300">
                                                                <Trophy className="h-4 w-4 md:h-5 md:w-5 text-white absolute -top-1 -right-1 drop-shadow-md animate-bounce" />
                                                                {/* Jersey Rating Badge at bottom */}
                                                                <span className="absolute -bottom-1.5 bg-indigo-600 text-white font-black text-[8px] md:text-[9px] px-2 py-0.5 rounded-full border border-white uppercase tracking-tighter shadow-md">
                                                                    {item.rating.toFixed(0)}
                                                                </span>
                                                                <span className="font-extrabold tracking-tighter">
                                                                    {item.role}
                                                                </span>
                                                            </div>
                                                            {/* Glowing Aura */}
                                                            <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-md opacity-70 group-hover/shirt:blur-xl transition-all duration-300" />
                                                        </div>

                                                        {/* Player Label Card */}
                                                        <div className="mt-3.5 bg-slate-900/90 dark:bg-black/90 text-white px-3.5 py-1.5 rounded-[1.2rem] border border-white/10 text-center max-w-[120px] md:max-w-[140px] shadow-lg">
                                                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-wide truncate leading-tight">
                                                                {item.player.first_name} {item.player.last_name}
                                                            </p>
                                                            <p className="text-[7px] md:text-[8px] font-bold text-amber-400 uppercase tracking-widest truncate mt-0.5">
                                                                {item.team_name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white/50">
                                                    <Trophy className="h-16 w-16 mb-4 opacity-25" />
                                                    <p className="text-sm font-black uppercase tracking-wider">Turnuvada henüz puanı olan oyuncu bulunmuyor.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Ranks List & Algorithm explanation (1 Column) */}
                                    <div className="space-y-6">
                                        <Card className="border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[3rem] overflow-hidden">
                                            <CardHeader className="p-8">
                                                <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                                    <Trophy className="h-5 w-5 text-yellow-500" /> ALTIN KARMA LİSTESİ
                                                </CardTitle>
                                                <CardDescription className="text-xs font-black uppercase tracking-widest opacity-50 mt-1">
                                                    TURNUVANIN EN DEĞERLİ {stats.dreamTeam?.length || 7} OYUNCUSUNUN PERFORMANS DETAYLARI
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-8 pt-0 space-y-4">
                                                {stats.dreamTeam && stats.dreamTeam.length > 0 ? (
                                                    stats.dreamTeam.map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl group hover:scale-[1.01] transition-transform">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 text-white font-black text-xs flex items-center justify-center">
                                                                    #{idx + 1}
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-black uppercase tracking-tight">{item.player.first_name} {item.player.last_name}</p>
                                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{item.team_name}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                                                                    {item.rating.toFixed(0)} Puan
                                                                </span>
                                                                <div className="flex gap-2 justify-end mt-0.5 text-[8px] font-black text-muted-foreground font-mono">
                                                                    <span>⚽ {item.goals} Gol</span>
                                                                    <span>🎯 {item.assists} Asist</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-xs font-black text-neutral-400 uppercase tracking-wider py-8 text-center">Rüya Takım adayları henüz açıklanmadı.</p>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Dynamic Performance Scoring Guide */}
                                        <Card className="border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[3rem] overflow-hidden">
                                            <CardHeader className="p-8">
                                                <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-3">
                                                    <Activity className="h-5 w-5 text-indigo-500" /> PUANLAMA ALGORİTMASI
                                                </CardTitle>
                                                <CardDescription className="text-xs font-black uppercase tracking-widest opacity-50 mt-1">RÜYA TAKIM SEÇİMİ NASIL HESAPLANIYOR?</CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-8 pt-0 text-xs text-muted-foreground space-y-4 font-semibold leading-relaxed">
                                                <p>
                                                    Altın Karma seçimi, oyuncuların sahada gösterdiği tüm kritik eylemlerin ağırlıklı bir performans formülüyle hesaplanmasıyla yapılır:
                                                </p>
                                                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 font-mono text-[9px] leading-normal uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                                                    PERFORMANS PUANI = <br/>
                                                    (⚽ Gol * 3.0) + (🎯 Asist * 2.0) <br/>
                                                    - (🟨 Sarı Kart * 1.0) - (🟥 Kırmızı Kart * 3.0)
                                                </div>
                                                <p>
                                                    Bu formülle en yüksek katkı puanına sahip ilk {stats.dreamTeam?.length || 7} oyuncu, turnuva kurallarında belirlenen <strong>toplam oyuncu (kaleci dahil)</strong> ayarlarına göre sahada yerini alır!
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
