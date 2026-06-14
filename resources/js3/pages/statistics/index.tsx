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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line } from 'recharts';

interface Props {
    tournaments: any[];
    selectedTournament: any;
    stats: {
        summary: any;
        topScorers: any[];
        topAssists: any[];
        bestDefenses: any[];
        fairPlay: any[];
        unitGoals: any[];
        trends: any[];
        topCards?: {
            players: any[];
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
                                {['BİR BAKIŞTA', 'GOL VE ASİST', 'KART ANALİZİ', 'TAKIM ANALİZİ', 'BİRİM DAĞILIMI'].map((tab, i) => (
                                    <TabsTrigger 
                                        key={i}
                                        value={['overview', 'players', 'cards', 'teams', 'units'][i]}
                                        className="rounded-2xl px-6 py-3 font-black text-[10px] uppercase tracking-widest border border-slate-200 dark:border-white/5 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all shadow-sm"
                                    >
                                        {tab}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {/* Overview Tab */}
                            <TabsContent value="overview">
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                    {/* Score Progression Trend */}
                                    <Card className="border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[3rem] overflow-hidden">
                                        <CardHeader className="p-8">
                                            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                                <TrendingUp className="h-5 w-5 text-blue-600" /> GOL TRENDLERİ
                                            </CardTitle>
                                            <CardDescription className="text-xs font-black uppercase tracking-widest opacity-50">GÜNLER BAZINDA ÜRETİLEN TOPLAM SKOR</CardDescription>
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

                                    {/* Unit Distribution Pie */}
                                    <Card className="border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[3rem] overflow-hidden">
                                        <CardHeader className="p-8">
                                            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                                <PieChartIcon className="h-5 w-5 text-emerald-600" /> BİRİM DOMİNASYONU
                                            </CardTitle>
                                            <CardDescription className="text-xs font-black uppercase tracking-widest opacity-50">BİRİMLERİN TOPLAM GOL KATKISI</CardDescription>
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
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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
                                                            <span className="w-6 text-[10px] font-black text-rose-600">#{i + 1}</span>
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
                                            <CardDescription className="text-xs font-black uppercase tracking-widest opacity-50">KART PUANI DÜŞÜK OLANLAR (Sarı: 1, Kırmızı: 3)</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-8 pt-0">
                                            <div className="space-y-4">
                                                {stats.fairPlay.slice(0, 10).map((entry, i) => (
                                                    <div key={entry.team.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl group">
                                                        <div className="flex items-center gap-4">
                                                            <span className="w-6 text-[10px] font-black text-blue-600">#{i + 1}</span>
                                                            <h4 className="font-black uppercase tracking-tight text-sm">{entry.team.name}</h4>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex gap-2">
                                                                <div className="flex items-center gap-1">
                                                                    <div className="w-2 h-3 bg-amber-400 rounded-sm" />
                                                                    <span className="text-[10px] font-black">{entry.yellow_cards}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <div className="w-2 h-3 bg-rose-600 rounded-sm" />
                                                                    <span className="text-[10px] font-black">{entry.red_cards}</span>
                                                                </div>
                                                            </div>
                                                            <Badge className="bg-blue-600 text-white font-black text-[10px] min-w-[3rem] justify-center">{entry.points} P</Badge>
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
                        </Tabs>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
