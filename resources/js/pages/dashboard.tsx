import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
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
    Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
}

interface Game {
    id: number;
    home_team: { name: string; unit?: { name: string } };
    away_team: { name: string; unit?: { name: string } };
    home_score: number;
    away_score: number;
    status: string;
    scheduled_at: string;
}

interface Props {
    stats: Stats;
    recent_games: Game[];
    upcoming_games: Game[];
    active_tournament: any;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kontrol Merkezi', href: '/dashboard' },
];

export default function Dashboard({ stats, recent_games, upcoming_games, active_tournament }: Props) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kontrol Merkezi" />
            
            <div className="min-h-screen bg-slate-50/50 dark:bg-black p-4 md:p-8 space-y-8 font-sans">
                
                {/* Global Search & Notifications Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">
                            HOŞ GELDİN, <span className="text-blue-600">{auth.user.name.split(' ')[0]}</span>
                        </h1>
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Turnuva yönetim sistemi hazır ve nazır.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center bg-white dark:bg-neutral-900 border border-border px-4 py-2 rounded-2xl w-64 shadow-sm">
                            <Search className="h-4 w-4 text-muted-foreground mr-2" />
                            <input type="text" placeholder="Hızlı ara..." className="bg-transparent border-none text-xs outline-none w-full font-medium" />
                        </div>
                        <Button variant="outline" size="icon" className="rounded-2xl border-border bg-white dark:bg-neutral-900 shadow-sm relative">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-black" />
                        </Button>
                    </div>
                </div>

                {/* Hero Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="group relative overflow-hidden border-none bg-blue-600 text-white shadow-2xl transition-all hover:scale-[1.02]">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Trophy className="h-24 w-24" />
                        </div>
                        <CardContent className="p-8">
                            <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">Turnuva Sayısı</p>
                            <h3 className="text-5xl font-black tabular-nums">{stats.tournaments_count}</h3>
                            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold">
                                <Badge className="bg-white/20 text-white border-none py-0.5 px-2">+{stats.tournaments_count / 2} BU YIL</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden border-none bg-emerald-600 text-white shadow-2xl transition-all hover:scale-[1.02]">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Users className="h-24 w-24" />
                        </div>
                        <CardContent className="p-8">
                            <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">Toplam Takım</p>
                            <h3 className="text-5xl font-black tabular-nums">{stats.teams_count}</h3>
                            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold">
                                <Badge className="bg-white/20 text-white border-none py-0.5 px-2">AKTİF KAYITLAR</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden border-none bg-neutral-900 text-white shadow-2xl transition-all hover:scale-[1.02]">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Activity className="h-24 w-24" />
                        </div>
                        <CardContent className="p-8">
                            <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">Toplam Maç</p>
                            <h3 className="text-5xl font-black tabular-nums">{stats.games_count}</h3>
                            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold">
                                <Badge className="bg-white/20 text-white border-none py-0.5 px-2">SKORLAR GÜNCEL</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden border-none bg-amber-500 text-white shadow-2xl transition-all hover:scale-[1.02]">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Target className="h-24 w-24" />
                        </div>
                        <CardContent className="p-8">
                            <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">Oyuncu Sayısı</p>
                            <h3 className="text-5xl font-black tabular-nums">{stats.players_count}</h3>
                            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold">
                                <Badge className="bg-white/20 text-white border-none py-0.5 px-2">LİSANS KAYITLI</Badge>
                            </div>
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
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{format(new Date(game.scheduled_at), 'd MMMM', { locale: tr })}</span>
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

                        {/* Recent Results Section */}
                        <Card className="border-none shadow-xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-8 flex flex-row items-center justify-between border-b border-neutral-100 dark:border-white/5">
                                <div>
                                    <CardTitle className="text-xl font-black uppercase tracking-tighter">Son Sonuçlar</CardTitle>
                                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">TAMAMLANAN MAÇLARIN SKORLARI</CardDescription>
                                </div>
                                <Trophy className="h-5 w-5 text-amber-500" />
                            </CardHeader>
                            <CardContent className="p-0">
                                {recent_games.length > 0 ? (
                                    <div className="divide-y divide-neutral-100 dark:divide-white/5">
                                        {recent_games.map((game) => (
                                            <Link key={game.id} href={route('games.show', game.id)} className="flex items-center justify-between p-6 hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors group">
                                                <div className="flex flex-1 items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center font-black text-xs text-muted-foreground group-hover:bg-amber-600 group-hover:text-white transition-all">
                                                        {game.home_team.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="font-black text-sm uppercase tracking-tight">{game.home_team.name}</span>
                                                </div>
                                                
                                                <div className="flex items-center gap-3 mx-4">
                                                    <div className="bg-slate-900 text-white w-10 h-12 flex items-center justify-center text-xl font-black rounded-xl shadow-lg">{game.home_score}</div>
                                                    <div className="bg-slate-900 text-white w-10 h-12 flex items-center justify-center text-xl font-black rounded-xl shadow-lg">{game.away_score}</div>
                                                </div>

                                                <div className="flex flex-1 items-center justify-end gap-4">
                                                    <span className="font-black text-sm uppercase tracking-tight text-right">{game.away_team.name}</span>
                                                    <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center font-black text-xs text-muted-foreground group-hover:bg-amber-600 group-hover:text-white transition-all">
                                                        {game.away_team.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center">
                                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">Henüz tamamlanan maç yok.</p>
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

                        {/* Active Tournament Status */}
                        <Card className="border-none shadow-xl bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-8 border-b border-neutral-100 dark:border-white/5">
                                <CardTitle className="text-xl font-black uppercase tracking-tighter">Turnuva Durumu</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                {active_tournament ? (
                                    <div className="space-y-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Şu Anki Turnuva</span>
                                            <h4 className="text-xl font-black uppercase tracking-tight">{active_tournament.name}</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-muted/50 p-4 rounded-3xl text-center">
                                                <span className="text-[9px] font-black uppercase text-muted-foreground block mb-1">SEZON</span>
                                                <span className="text-lg font-black">{active_tournament.year}</span>
                                            </div>
                                            <div className="bg-blue-50 dark:bg-blue-600/10 p-4 rounded-3xl text-center">
                                                <span className="text-[9px] font-black uppercase text-blue-600 block mb-1">DURUM</span>
                                                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{active_tournament.status}</span>
                                            </div>
                                        </div>
                                        <Link href={route('tournaments.show', active_tournament.id)}>
                                            <Button className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl">
                                                TURNUVA DETAYLARINA GİT <ChevronRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="py-12 text-center space-y-4">
                                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">Aktif turnuva bulunamadı.</p>
                                        <Link href={route('tournaments.index')}>
                                            <Button className="rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-blue-500/20 px-6 h-12">YENİ TURNUVA BAŞLAT</Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
