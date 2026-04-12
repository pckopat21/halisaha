import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, Link } from '@inertiajs/react';
import { Trophy, Goal, Target, Shield, AlertTriangle, TrendingUp, Users, Activity, ChevronRight, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    };
}

export default function Index({ tournaments, selectedTournament, stats }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'İstatistikler', href: '/statistics' },
        { title: selectedTournament?.name || 'Genel Bakış', href: '#' },
    ];

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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

                        {/* Main Tabs Segment */}
                        <Tabs defaultValue="overview" className="space-y-8">
                            <TabsList className="bg-transparent h-auto p-0 flex-wrap gap-2 flex justify-start mb-8">
                                {['BİR BAKIŞTA', 'GOL VE ASİST', 'TAKIM ANALİZİ', 'BİRİM DAĞILIMI'].map((tab, i) => (
                                    <TabsTrigger 
                                        key={i}
                                        value={['overview', 'players', 'teams', 'units'][i]}
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
