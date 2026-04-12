import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { 
    Trophy, 
    Shield, 
    Calendar, 
    ArrowLeft, 
    Target, 
    Activity, 
    Timer,
    Medal,
    ChevronRight,
    MapPin,
    Users,
    Zap,
    TrendingUp,
    ShieldCheck,
    Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Game {
    id: number;
    home_team: { name: string };
    away_team: { name: string };
    scheduled_at: string;
}

interface MatchHistoryItem {
    game: Game;
    team: { name: string };
    goals: number;
    yellow_cards: number;
    red_cards: number;
    events: any[];
}

interface PlayerStats {
    player: {
        id: number;
        first_name: string;
        last_name: string;
        unit: { name: string };
    };
    total_goals: number;
    yellow_cards: number;
    red_cards: number;
    match_history: MatchHistoryItem[];
}

interface Props {
    stats: PlayerStats;
}

export default function Show({ stats }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Turnuvalar', href: '/tournaments' },
        { title: 'Oyuncu Profili', href: '#' },
        { title: `${stats.player.first_name} ${stats.player.last_name}`, href: '#' },
    ];

    // Calculate dynamic rating (60-99)
    const matchesCount = stats.match_history.length;
    const baseRating = 65;
    const goalBonus = stats.total_goals * 5;
    const matchBonus = matchesCount * 3;
    const cardPenalty = (stats.yellow_cards * 5) + (stats.red_cards * 15);
    const overallRating = Math.min(99, Math.max(60, baseRating + goalBonus + matchBonus - cardPenalty));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${stats.player.first_name} ${stats.player.last_name} - Oyuncu Karnesi`} />

            <div className="min-h-screen bg-slate-50/50 dark:bg-black p-4 md:p-8 font-sans">
                {/* Back Button */}
                <Link href={route('tournaments.index')} className="inline-flex items-center gap-2 text-muted-foreground hover:text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-8 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    TURNUVALARA DÖN
                </Link>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    
                    {/* Athlete Card (FIFA Style) */}
                    <div className="xl:col-span-4 flex justify-center">
                        <div className="w-full max-w-[340px] aspect-[2/3] bg-gradient-to-b from-blue-700 via-blue-900 to-black rounded-[3rem] p-1 shadow-[0_30px_60px_-15px_rgba(0,51,102,0.5)] relative overflow-hidden group">
                            {/* Card Background Patterns */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none">
                                <Activity className="absolute -right-10 -top-10 h-64 w-64 text-white rotate-12" />
                                <Trophy className="absolute -left-10 -bottom-10 h-64 w-64 text-white -rotate-12" />
                            </div>
                            
                            <div className="h-full bg-slate-900/40 backdrop-blur-sm rounded-[2.9rem] border border-white/10 flex flex-col p-8 relative z-10">
                                {/* Header: Unit & Rating */}
                                <div className="flex justify-between items-start mb-12">
                                    <div className="flex flex-col items-start gap-1">
                                        <div className="text-4xl md:text-6xl font-black text-white leading-none tracking-tighter">{overallRating}</div>
                                        <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">REYTİNG</div>
                                    </div>
                                    <div className="text-right">
                                        <Badge className="bg-white/10 text-white border-white/20 font-black text-[9px] px-3 py-1 rounded-lg uppercase tracking-widest">{stats.player.unit.name}</Badge>
                                    </div>
                                </div>

                                {/* Center: Profile Avatar */}
                                <div className="flex-1 flex flex-col items-center justify-center relative mb-12">
                                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-4xl md:text-5xl font-black text-white shadow-2xl relative">
                                        {stats.player.first_name[0]}{stats.player.last_name[0]}
                                        <div className="absolute -bottom-2 right-2 bg-amber-400 p-2 rounded-xl shadow-lg border-2 border-slate-900">
                                            <Trophy className="h-4 w-4 text-slate-900" />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer: Name & Roles */}
                                <div className="text-center space-y-2 mb-8">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">{stats.player.first_name} {stats.player.last_name}</h2>
                                    <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em]">PROFESYONEL PERSONEL</p>
                                </div>

                                {/* Quick Stats Row */}
                                <div className="grid grid-cols-3 border-t border-white/10 pt-6">
                                    <div className="flex flex-col items-center border-r border-white/10">
                                        <span className="text-lg font-black text-white">{stats.total_goals}</span>
                                        <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">GOL</span>
                                    </div>
                                    <div className="flex flex-col items-center border-r border-white/10">
                                        <span className="text-lg font-black text-white">{matchesCount}</span>
                                        <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">MAÇ</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-lg font-black text-white">{stats.yellow_cards + stats.red_cards}</span>
                                        <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">KART</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Intelligence Area */}
                    <div className="xl:col-span-8 space-y-8">
                        
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Card className="border-none shadow-xl bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden group">
                                <CardContent className="p-8 flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                                        <Zap className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">GOL KATKISI</p>
                                        <h4 className="text-4xl font-black tabular-nums">{stats.total_goals}</h4>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-xl bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden group">
                                <CardContent className="p-8 flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                        <ShieldCheck className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">FİZİKSEL FORM</p>
                                        <h4 className="text-4xl font-black tabular-nums">{matchesCount > 3 ? 'ELITE' : 'NORMAL'}</h4>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Skill Meters */}
                        <Card className="border-none shadow-xl bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 md:p-12">
                            <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-black uppercase tracking-tighter">Yetenek Dağılımı</CardTitle>
                                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">SAHA İÇİ PERFORMANS ANALİZİ</CardDescription>
                                </div>
                                <TrendingUp className="h-6 w-6 text-blue-600" />
                            </CardHeader>
                            <CardContent className="p-0 space-y-8">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <Target className="h-3 w-3 text-amber-500" /> Bitiricilik (Gol)
                                        </span>
                                        <span className="text-sm font-black tabular-nums">%{Math.min(100, (stats.total_goals / 5) * 100).toFixed(0)}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (stats.total_goals / 5) * 100)}%` }} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <Timer className="h-3 w-3 text-blue-600" /> İstikrar (Maç)
                                        </span>
                                        <span className="text-sm font-black tabular-nums">%{Math.min(100, (matchesCount / 10) * 100).toFixed(0)}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (matchesCount / 10) * 100)}%` }} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <Shield className="h-3 w-3 text-emerald-500" /> Disiplin (Centilmenlik)
                                        </span>
                                        <span className="text-sm font-black tabular-nums">%{Math.max(0, 100 - ((stats.yellow_cards + stats.red_cards) * 20)).toFixed(0)}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${Math.max(0, 100 - ((stats.yellow_cards + stats.red_cards) * 20))}%` }} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>

                {/* Match History Section */}
                <div className="mt-12">
                    <Card className="border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[3rem] overflow-hidden">
                        <CardHeader className="p-8 md:p-12 border-b border-neutral-100 dark:border-white/5 bg-slate-50/30 dark:bg-black/20">
                            <div className="flex items-center gap-4">
                                <Activity className="h-6 w-6 text-blue-600" />
                                <div>
                                    <CardTitle className="text-2xl font-black uppercase tracking-tighter">Maç Geçmişi</CardTitle>
                                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">TURNUVA BOYUNCA KATILDIĞI TÜM MÜSABAKALAR</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-neutral-50/50 dark:bg-black/10">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="w-1/3 font-black text-[10px] uppercase tracking-widest pl-12">Karşılaşma / Tarih</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-center">Birim Takımı</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-center">İstatistik</TableHead>
                                        <TableHead className="w-20"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.match_history.length > 0 ? stats.match_history.map((item, idx) => (
                                        <TableRow key={idx} className="group border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                            <TableCell className="py-8 pl-12">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-black text-sm uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                                        {item.game.home_team.name} vs {item.game.away_team.name}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                                                        <Calendar className="h-3 w-3 text-blue-600" />
                                                        {format(new Date(item.game.scheduled_at), 'd MMMM yyyy', { locale: tr })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className="font-black px-4 py-1.5 rounded-full bg-blue-50/50 text-blue-600 border-blue-100 dark:bg-blue-500/5 dark:text-blue-400 dark:border-blue-500/20 shadow-sm">
                                                    {item.team.name}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-4">
                                                    {item.goals > 0 && (
                                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20">
                                                            <Target className="h-3.5 w-3.5 text-amber-500" />
                                                            <span className="font-black text-sm text-amber-600 tabular-nums">{item.goals} Gol</span>
                                                        </div>
                                                    )}
                                                    {item.yellow_cards > 0 && (
                                                        <div className="w-5 h-7 bg-amber-400 rounded-sm shadow-sm border border-amber-500/20 flex items-center justify-center font-black text-[10px] text-amber-900">
                                                            {item.yellow_cards}
                                                        </div>
                                                    )}
                                                    {item.red_cards > 0 && (
                                                        <div className="w-5 h-7 bg-rose-500 rounded-sm shadow-sm border border-rose-600/20 flex items-center justify-center font-black text-[10px] text-white">
                                                            {item.red_cards}
                                                        </div>
                                                    )}
                                                    {item.goals === 0 && item.yellow_cards === 0 && item.red_cards === 0 && (
                                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">— ETKİNLİK YOK —</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="pr-12">
                                                <Link href={route('games.show', item.game.id)}>
                                                    <Button size="icon" variant="ghost" className="rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="py-24 text-center">
                                                <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 font-black">HENÜZ MAÇ VERİSİ BULUNMUYOR</p>
                                                <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-bold">OYUNCU MAÇLARA ÇIKTIKÇA BURASI DOLACAKTIR.</p>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
