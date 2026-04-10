import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    Trophy, 
    Users, 
    Calendar, 
    Activity, 
    ChevronRight, 
    Target, 
    Clock, 
    LayoutDashboard,
    Shield,
    Medal,
    Swords,
    ArrowUpRight,
    Search,
    UserPlus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Team {
    id: number;
    name: string;
    unit: { name: string };
    tournament: { name: string; status: string };
    players: any[];
}

interface Standing {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    points: number;
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
    stats: any;
    team: Team | null;
    standing: Standing | null;
    tournaments: any[];
    upcoming_games: Game[];
    my_games: Game[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Yönetici Paneli', href: '/dashboard' },
];

export default function ManagerDashboard({ stats, team, standing, tournaments, upcoming_games, my_games }: Props) {
    const { auth } = usePage<SharedData>().props;
    const nextGame = my_games.find(g => g.status === 'scheduled');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Yönetici Paneli" />
            
            <div className="min-h-screen bg-slate-50/50 dark:bg-black p-4 md:p-8 space-y-8 font-sans">
                
                {/* Greeting Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">
                            MERHABA, <span className="text-emerald-600">{auth.user.name.split(' ')[0]}</span>
                        </h1>
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Takım yönetimi ve turnuva takibi için hazırız.</p>
                    </div>
                    {team && (
                        <div className="bg-white dark:bg-neutral-900 border border-emerald-100 dark:border-emerald-500/20 px-6 py-3 rounded-[2rem] shadow-sm flex items-center gap-4">
                            <Shield className="h-5 w-5 text-emerald-600" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1">Yönetilen Takım</span>
                                <span className="text-sm font-black uppercase tracking-tight">{team.name}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: My Team Stats */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {team ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Team Status Card */}
                                <Card className="border-none shadow-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-[3rem] overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                                        <Shield className="h-40 w-40" />
                                    </div>
                                    <CardContent className="p-8 md:p-12 relative z-10">
                                        <Badge className="bg-white/20 text-white border-none font-black text-[10px] uppercase tracking-widest mb-6 py-1.5 px-4 rounded-full">KULÜP DURUMU</Badge>
                                        <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">{team.name}</h2>
                                        <p className="font-bold opacity-80 uppercase text-xs tracking-widest mb-8">{team.unit.name} • {team.tournament.name}</p>
                                        
                                        <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
                                            <div className="text-center">
                                                <span className="text-[10px] font-black uppercase opacity-60 block mb-1">GOLCÜLER</span>
                                                <span className="text-2xl font-black">{team.players.length}</span>
                                            </div>
                                            <div className="text-center border-x border-white/10">
                                                <span className="text-[10px] font-black uppercase opacity-60 block mb-1">PUAN</span>
                                                <span className="text-2xl font-black">{standing?.points || 0}</span>
                                            </div>
                                            <div className="text-center">
                                                <span className="text-[10px] font-black uppercase opacity-60 block mb-1">DURUM</span>
                                                <span className="text-2xl font-black">#{standing?.won || 0}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Next Match Card */}
                                <Card className="border-none shadow-2xl bg-white dark:bg-neutral-900 rounded-[3rem] overflow-hidden flex flex-col justify-between">
                                    <CardHeader className="p-8 md:p-10 border-b border-neutral-100 dark:border-white/5">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Sıradaki Maç</CardTitle>
                                                <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">TAKIMININ BİR SONRAKİ GÖREVİ</CardDescription>
                                            </div>
                                            <div className="h-10 w-10 bg-amber-100 dark:bg-amber-500/10 rounded-xl flex items-center justify-center">
                                                <Swords className="h-5 w-5 text-amber-600" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8 md:p-10">
                                        {nextGame ? (
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex flex-col items-center flex-1">
                                                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center font-black text-xs">{nextGame.home_team.name.substring(0, 2).toUpperCase()}</div>
                                                        <span className="text-[10px] font-black uppercase mt-2 text-center line-clamp-1">{nextGame.home_team.name}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-2xl font-black text-blue-600 tabular-nums">{format(new Date(nextGame.scheduled_at), 'HH:mm')}</span>
                                                        <span className="text-[9px] font-bold text-muted-foreground uppercase">{format(new Date(nextGame.scheduled_at), 'd MMM', { locale: tr })}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center flex-1">
                                                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center font-black text-xs">{nextGame.away_team.name.substring(0, 2).toUpperCase()}</div>
                                                        <span className="text-[10px] font-black uppercase mt-2 text-center line-clamp-1">{nextGame.away_team.name}</span>
                                                    </div>
                                                </div>
                                                <Link href={route('games.show', nextGame.id)}>
                                                    <Button className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all">MAÇ MERKEZİNE GİT</Button>
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="py-8 text-center space-y-4">
                                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-40">Planlanmış maçınız yok.</p>
                                                <Trophy className="h-8 w-8 text-muted-foreground opacity-10 mx-auto" />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <Card className="border-none shadow-2xl bg-amber-500 text-white rounded-[3rem] p-12 text-center overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-12 opacity-10">
                                    <Users className="h-64 w-64" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-4xl font-black uppercase tracking-tighter mb-4">Henüz bir takımın yok!</h3>
                                    <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-8">Takımını kur oradan hemen turnuva kaydını yap.</p>
                                    <Link href={route('teams.store')}>
                                        <Button className="h-16 px-12 bg-white text-amber-500 hover:bg-slate-50 font-black uppercase tracking-widest rounded-3xl text-sm shadow-2xl">TAKIMINI HEMEN OLUŞTUR</Button>
                                    </Link>
                                </div>
                            </Card>
                        )}

                        {/* Recent Team Games */}
                        {team && (
                            <Card className="border-none shadow-xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[3rem] overflow-hidden">
                                <CardHeader className="p-8 md:p-10 border-b border-neutral-100 dark:border-white/5 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl font-black uppercase tracking-tighter">Takım Fikstürü</CardTitle>
                                        <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">SİZE ÖZEL TÜM MAÇ PROGRAMI</CardDescription>
                                    </div>
                                    <Link href={route('teams.show', team.id)}>
                                        <Button variant="ghost" className="rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest text-blue-600 hover:bg-blue-50">TÜM KADRO</Button>
                                    </Link>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {my_games.length > 0 ? (
                                        <div className="divide-y divide-neutral-100 dark:divide-white/5">
                                            {my_games.map((game) => (
                                                <Link key={game.id} href={route('games.show', game.id)} className="flex items-center justify-between p-8 hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors group">
                                                    <div className="flex-1 flex items-center gap-6">
                                                        <div className="text-right">
                                                            <p className="font-black text-sm uppercase tracking-tight">{game.home_team.name}</p>
                                                            <p className="text-[9px] font-bold text-muted-foreground uppercase">{game.status === 'completed' ? 'TAMAMLANDI' : 'BEKLENİYOR'}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-10 h-12 flex items-center justify-center text-xl font-black rounded-xl ${game.status === 'completed' ? 'bg-slate-900 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                                                                {game.status === 'completed' ? game.home_score : '-'}
                                                            </div>
                                                            <div className={`w-10 h-12 flex items-center justify-center text-xl font-black rounded-xl ${game.status === 'completed' ? 'bg-slate-900 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                                                                {game.status === 'completed' ? game.away_score : '-'}
                                                            </div>
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="font-black text-sm uppercase tracking-tight">{game.away_team.name}</p>
                                                            <div className="flex items-center gap-2 font-black text-[9px] text-blue-600 uppercase tracking-widest">
                                                                <Clock className="h-3 w-3" /> {format(new Date(game.scheduled_at), 'd MMM HH:mm', { locale: tr })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-20 text-center text-muted-foreground/30 font-black uppercase text-xs tracking-[0.2em]">Takımınıza henüz maç atanmamış.</div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: Global Info */}
                    <div className="space-y-8">
                        {/* Global Top Scorer Spotlight */}
                        <Card className="border-none shadow-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-white rounded-[3rem] overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none group-hover:rotate-12 transition-transform">
                                <Medal className="h-32 w-32" />
                            </div>
                            <CardHeader className="p-8">
                                <Badge className="bg-white/20 text-white border-none font-black text-[9px] uppercase tracking-widest mb-4">ALTIN AYAKKABI</Badge>
                                <CardTitle className="text-2xl font-black uppercase tracking-tighter">GOL KRALLIĞI</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 flex items-center gap-6">
                                {stats.top_scorer ? (
                                    <>
                                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black shadow-2xl">
                                            {stats.top_scorer.first_name[0]}{stats.top_scorer.last_name[0]}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black uppercase tracking-tight line-clamp-1">{stats.top_scorer.first_name} {stats.top_scorer.last_name}</h4>
                                            <Badge className="bg-white text-orange-600 font-black px-4 py-1 rounded-full text-sm tabular-nums mt-2">{stats.top_scorer.goals_count} GOL</Badge>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-xs font-black uppercase opacity-60">Veri toplanıyor...</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Global Matches (Small Feed) */}
                        <Card className="border-none shadow-xl bg-white dark:bg-neutral-900 rounded-[3rem] overflow-hidden">
                            <CardHeader className="p-8 border-b border-neutral-100 dark:border-white/5">
                                <CardTitle className="text-xl font-black uppercase tracking-tighter">Turnuva Akışı</CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-widest mt-1">DİĞER MAÇLARDAN HABERLER</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-neutral-100 dark:divide-white/5">
                                    {upcoming_games.slice(0, 3).map((game) => (
                                        <div key={game.id} className="p-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{format(new Date(game.scheduled_at), 'd MMMM', { locale: tr })}</span>
                                                <Badge className="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500 border-none px-2 py-0 text-[8px] font-black">YAKLAŞAN</Badge>
                                            </div>
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-xs font-black uppercase flex-1 truncate">{game.home_team.name}</span>
                                                <span className="text-xs font-black text-blue-600 tabular-nums bg-blue-50 dark:bg-white/5 px-2 py-1 rounded-lg">VS</span>
                                                <span className="text-xs font-black uppercase flex-1 text-right truncate">{game.away_team.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-6 bg-slate-50 dark:bg-black/20">
                                    <Link href={route('tournaments.index')}>
                                        <Button variant="outline" className="w-full text-[9px] font-black uppercase tracking-widest border-border bg-white dark:bg-neutral-800 rounded-xl h-10 shadow-sm">TÜM FİKSTÜR</Button>
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
