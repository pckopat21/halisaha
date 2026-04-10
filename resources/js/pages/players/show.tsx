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
    Users
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${stats.player.first_name} ${stats.player.last_name} - Oyuncu Karnesi`} />

            <div className="min-h-screen bg-background p-4 md:p-8 font-sans">
                {/* Back Button */}
                <Link href={route('tournaments.index')} className="inline-flex items-center gap-2 text-muted-foreground hover:text-blue-600 font-bold text-xs uppercase tracking-widest mb-8 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    TURNUVALARA DÖN
                </Link>

                {/* Profile Header */}
                <div className="relative mb-8 p-8 md:p-12 rounded-[3rem] bg-card border border-border shadow-sm overflow-hidden dark:bg-blue-950/10">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                        <Activity className="h-64 w-64 text-blue-600" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-4xl md:text-5xl font-black text-white shadow-2xl shadow-blue-500/30">
                            {stats.player.first_name[0]}{stats.player.last_name[0]}
                        </div>
                        
                        <div className="flex-1 text-center md:text-left space-y-4">
                            <Badge className="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-none font-black uppercase tracking-[0.2em] py-1.5 px-4 rounded-full">
                                OYUNCU KARNESİ
                            </Badge>
                            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                                {stats.player.first_name} <span className="text-blue-600">{stats.player.last_name}</span>
                            </h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-blue-600" />
                                    <span className="text-xs font-bold uppercase tracking-widest">{stats.player.unit.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-blue-600" />
                                    <span className="text-xs font-bold uppercase tracking-widest">AKTİF TURNUVA OYUNCUSU</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <Card className="border-none shadow-xl bg-amber-500 text-white rounded-[2.5rem] overflow-hidden group">
                        <CardContent className="p-8 relative">
                            <Target className="absolute -right-4 -bottom-4 h-24 w-24 opacity-20 group-hover:scale-110 transition-transform" />
                            <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">TOPLAM GOL</p>
                            <h3 className="text-6xl font-black tabular-nums leading-none">{stats.total_goals}</h3>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-slate-100 dark:bg-neutral-800 rounded-[2.5rem] overflow-hidden group">
                        <CardContent className="p-8 relative">
                            <div className="absolute -right-4 -bottom-4 w-24 h-32 bg-amber-400 rounded-lg rotate-12 opacity-20 group-hover:rotate-6 transition-transform shadow-xl" />
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">SARI KART</p>
                            <h3 className="text-6xl font-black tabular-nums leading-none text-slate-900 dark:text-white">{stats.yellow_cards}</h3>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-slate-100 dark:bg-neutral-800 rounded-[2.5rem] overflow-hidden group">
                        <CardContent className="p-8 relative">
                            <div className="absolute -right-4 -bottom-4 w-24 h-32 bg-rose-500 rounded-lg -rotate-12 opacity-20 group-hover:-rotate-6 transition-transform shadow-xl" />
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">KIRMIZI KART</p>
                            <h3 className="text-6xl font-black tabular-nums leading-none text-slate-900 dark:text-white">{stats.red_cards}</h3>
                        </CardContent>
                    </Card>
                </div>

                {/* Match History */}
                <Card className="border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[3rem] overflow-hidden">
                    <CardHeader className="p-8 md:p-12 border-b border-neutral-100 dark:border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                                <Activity className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black uppercase tracking-tighter">Maç Geçmişi</CardTitle>
                                <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">OYUNCUNUN KATILDIĞI TÜM TURNUVA MAÇLARI</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-neutral-50/50 dark:bg-black/20">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="w-1/3 font-black text-[10px] uppercase tracking-widest pl-12">Maç / Tarih</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-center">Takımı</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-center">Performans</TableHead>
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
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(item.game.scheduled_at), 'd MMMM yyyy', { locale: tr })}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="font-black px-4 py-1.5 rounded-full bg-blue-50/50 text-blue-600 border-blue-100 dark:bg-blue-500/5 dark:text-blue-400 dark:border-blue-500/20">
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
                                                <Button size="icon" variant="ghost" className="rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="py-24 text-center">
                                            <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">HENÜZ MAÇ VERİSİ BULUNMUYOR</p>
                                            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest">OYUNCU MAÇLARA ÇIKTIKÇA BURASI DOLACAKTIR.</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
