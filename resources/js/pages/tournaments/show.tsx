import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { 
    Trophy, 
    Users, 
    Calendar, 
    ArrowRight, 
    Shield, 
    Activity, 
    Settings2, 
    Dices, 
    Table as TableIcon,
    PlayCircle,
    Clock,
    Medal,
    ChevronRight,
    Search,
    Info,
    CheckCircle2,
    AlertCircle,
    LayoutDashboard,
    Edit3,
    Save,
    X,
    Timer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Player {
    id: number;
    first_name: string;
    last_name: string;
}

interface Game {
    id: number;
    home_team_id: number;
    away_team_id: number;
    home_team: { name: string; unit: { name: string } };
    away_team: { name: string; unit: { name: string } };
    home_score: number | null;
    away_score: number | null;
    status: 'scheduled' | 'live' | 'completed';
    scheduled_at: string;
}

interface Standing {
    id: number;
    team_id: number;
    team: { name: string };
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goals_for: number;
    goals_against: number;
    points: number;
}

interface Group {
    id: number;
    name: string;
    games: Game[];
    standings: Standing[];
}

interface Tournament {
    id: number;
    name: string;
    year: number;
    status: 'draft' | 'registration' | 'active' | 'completed';
    teams: { id: number; name: string; unit: { name: string } }[];
    groups: Group[];
}

interface Props {
    tournament: Tournament;
}

export default function Show({ tournament }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [activeTab, setActiveTab] = useState<'standings' | 'fixtures' | 'teams'>('standings');
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    
    const isCommittee = auth.user?.role === 'committee' || auth.user?.role === 'super_admin';

    const drawForm = useForm({
        group_count: '4',
        start_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        start_time: '18:00',
        match_duration: 50,
        buffer_time: 10,
    });

    const resultForm = useForm({
        home_score: 0,
        away_score: 0,
        status: 'scheduled',
        scheduled_at: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Turnuvalar', href: '/tournaments' },
        { title: tournament.name, href: `/tournaments/${tournament.id}` },
    ];

    const handleDraw = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirm('Kura çekimi mevcut tüm grupları ve fikstürü sıfırlayacaktır. Devam etmek istiyor musunuz?')) {
            drawForm.post(route('tournaments.draw', tournament.id));
        }
    };

    const openResultModal = (game: Game) => {
        setSelectedGame(game);
        resultForm.setData({
            home_score: game.home_score || 0,
            away_score: game.away_score || 0,
            status: game.status,
            scheduled_at: format(new Date(game.scheduled_at), "yyyy-MM-dd'T'HH:mm"),
        });
        setIsResultModalOpen(true);
    };

    const handleResultSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGame) return;
        
        resultForm.post(route('games.quick-result', selectedGame.id), {
            onSuccess: () => {
                setIsResultModalOpen(false);
                setSelectedGame(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tournament.name} />

            <div className="min-h-screen bg-background text-foreground p-4 md:p-8 font-sans selection:bg-blue-600 selection:text-white">
                {/* Header Section */}
                <div className="relative mb-12 p-8 md:p-12 rounded-[3rem] bg-card border border-border shadow-sm overflow-hidden dark:bg-blue-950/10 dark:border-white/5">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                        <Trophy className="h-64 w-64" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <Badge variant="outline" className="border-blue-100 text-blue-600 font-black uppercase tracking-[0.2em] py-1.5 px-4 rounded-full bg-blue-50/50 backdrop-blur-sm dark:border-blue-500/30 dark:text-blue-400 dark:bg-blue-500/5">
                                {tournament.status === 'draft' ? 'KAYIT AŞAMASI' : 
                                 tournament.status === 'active' ? 'TURNUVA DEVAM EDİYOR' : 
                                 tournament.status === 'registration' ? 'KAYITLAR AÇIK' : 'TAMAMLANDI'}
                            </Badge>
                            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">{tournament.name}</h1>
                            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                    <span className="text-xs font-bold uppercase tracking-widest">{tournament.year} SEZONU</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-blue-600" />
                                    <span className="text-xs font-bold uppercase tracking-widest">{tournament.teams.length} TAKIM</span>
                                </div>
                                {tournament.groups.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <TableIcon className="h-4 w-4 text-blue-600" />
                                        <span className="text-xs font-bold uppercase tracking-widest">{tournament.groups.length} GRUP</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {isCommittee && (tournament.status === 'draft' || tournament.status === 'registration' || tournament.groups.length === 0) && tournament.teams.length >= 2 && (
                            <div className="p-8 bg-slate-50 border border-slate-200 rounded-[3rem] flex flex-col gap-6 min-w-[350px] dark:bg-white/[0.03] dark:border-white/10 dark:backdrop-blur-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Settings2 className="h-4 w-4 text-blue-600" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">FİKSTÜR TANIMLAMA & KURA</span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">GRUP SAYISI</Label>
                                        <Select value={drawForm.data.group_count} onValueChange={val => drawForm.setData('group_count', val)}>
                                            <SelectTrigger className="h-10 rounded-xl bg-background border-input font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[1, 2, 4, 8].map(n => <SelectItem key={n} value={n.toString()}>{n} Grup</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">MAÇ SÜRESİ (DK)</Label>
                                        <div className="relative">
                                            <Timer className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                            <Input 
                                                type="number" 
                                                value={drawForm.data.match_duration} 
                                                onChange={e => drawForm.setData('match_duration', parseInt(e.target.value) || 50)} 
                                                className="h-10 pl-9 rounded-xl bg-background border-input font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">BAŞLANGIÇ TARİHİ</Label>
                                        <Input 
                                            type="date" 
                                            value={drawForm.data.start_date} 
                                            onChange={e => drawForm.setData('start_date', e.target.value)} 
                                            className="h-10 rounded-xl bg-background border-input font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">BAŞLAMA SAATİ</Label>
                                        <Input 
                                            type="time" 
                                            value={drawForm.data.start_time} 
                                            onChange={e => drawForm.setData('start_time', e.target.value)} 
                                            className="h-10 rounded-xl bg-background border-input font-bold"
                                        />
                                    </div>
                                </div>

                                <Button 
                                    onClick={handleDraw} 
                                    disabled={drawForm.processing}
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-blue-600/10 active:scale-95 transition-all"
                                >
                                    <Dices className="mr-2 h-4 w-4" /> KURAYI ÇEK VE BAŞLAT
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-8 bg-card p-1.5 rounded-2xl w-fit border border-border shadow-sm">
                    <Button 
                        variant="ghost" 
                        onClick={() => setActiveTab('standings')}
                        className={`h-11 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'standings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        PUAN DURUMU
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={() => setActiveTab('fixtures')}
                        className={`h-11 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'fixtures' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        FİKSTÜR / SONUÇLAR
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={() => setActiveTab('teams')}
                        className={`h-11 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'teams' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        TAKIMLAR
                    </Button>
                </div>

                <div className="space-y-12">
                    {activeTab === 'standings' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {tournament.groups.length > 0 ? (
                                tournament.groups.map(group => (
                                    <Card key={group.id} className="bg-card border-border rounded-[2.5rem] overflow-hidden group hover:border-blue-200 dark:hover:border-blue-500/20 transition-all duration-500 shadow-xl shadow-slate-200/50 dark:shadow-none">
                                        <CardHeader className="p-8 border-b border-border bg-muted/30">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-2xl font-black uppercase tracking-tighter">{group.name}</CardTitle>
                                                    <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">GRUP AŞAMASI SIRALAMASI</CardDescription>
                                                </div>
                                                <Badge className="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500 border-none font-black px-4 py-1.5 rounded-full text-[9px] tracking-widest uppercase">
                                                    {group.standings?.length || 0} TAKIM
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-b border-border hover:bg-transparent">
                                                        <TableHead className="w-16 text-center font-black text-muted-foreground text-[10px] uppercase tracking-widest py-6">#</TableHead>
                                                        <TableHead className="font-black text-muted-foreground text-[10px] uppercase tracking-widest py-6">TAKIM</TableHead>
                                                        <TableHead className="text-center font-black text-muted-foreground text-[10px] uppercase tracking-widest py-6">O</TableHead>
                                                        <TableHead className="text-center font-black text-muted-foreground text-[10px] uppercase tracking-widest py-6">G</TableHead>
                                                        <TableHead className="text-center font-black text-muted-foreground text-[10px] uppercase tracking-widest py-6">B</TableHead>
                                                        <TableHead className="text-center font-black text-muted-foreground text-[10px] uppercase tracking-widest py-6">M</TableHead>
                                                        <TableHead className="text-center font-black text-muted-foreground text-[10px] uppercase tracking-widest py-6">AV</TableHead>
                                                        <TableHead className="text-center font-black text-blue-600 text-[10px] uppercase tracking-widest py-6">P</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {group.standings?.sort((a,b) => (b.points - a.points) || ((b.goals_for - b.goals_against) - (a.goals_for - a.goals_against))).map((s, idx) => (
                                                        <TableRow key={s.id} className="border-b border-border hover:bg-muted/50 transition-colors group/row">
                                                            <TableCell className="text-center font-black text-xs text-muted-foreground py-5">
                                                                <div className={`h-7 w-7 rounded-lg flex items-center justify-center mx-auto ${idx < 2 ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-600/20 dark:text-blue-500 dark:ring-blue-500/30' : 'bg-muted'}`}>
                                                                    {idx + 1}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="py-5">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center font-black text-[10px] text-muted-foreground group-hover/row:bg-blue-600 group-hover/row:text-white transition-all duration-300">
                                                                        {s.team.name.substring(0, 2).toUpperCase()}
                                                                    </div>
                                                                    <span className="font-black uppercase text-xs tracking-tight group-hover/row:text-blue-500 transition-colors">{s.team.name}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center font-bold text-xs py-5">{s.played}</TableCell>
                                                            <TableCell className="text-center font-bold text-xs py-5 text-emerald-600">{s.won}</TableCell>
                                                            <TableCell className="text-center font-bold text-xs py-5 text-muted-foreground">{s.drawn}</TableCell>
                                                            <TableCell className="text-center font-bold text-xs py-5 text-rose-600">{s.lost}</TableCell>
                                                            <TableCell className="text-center font-bold text-xs py-5">{s.goals_for - s.goals_against}</TableCell>
                                                            <TableCell className="text-center font-black text-sm text-blue-600 py-5">{s.points}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="col-span-full py-32 rounded-[3rem] border border-dashed border-border bg-card flex flex-col items-center justify-center text-center">
                                    <div className="h-24 w-24 rounded-[2rem] bg-muted flex items-center justify-center mb-8 shadow-inner ring-1 ring-border">
                                        <TableIcon className="h-10 w-10 text-muted-foreground/30" />
                                    </div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-muted-foreground/40 mb-2">PUAN DURUMU HENÜZ HAZIR DEĞİL</h3>
                                    <p className="max-w-md text-muted-foreground/50 text-xs font-bold uppercase tracking-widest leading-relaxed">KURAYI ÇEKTİĞİNİZDE GRUPLAR VE PUAN TABLOLARI OTOMATİK OLARAK BURADA OLUŞACAKTIR.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'fixtures' && (
                        <div className="space-y-8 max-w-5xl mx-auto">
                            {tournament.groups.length > 0 ? (
                                tournament.groups.map(group => (
                                    <div key={group.id} className="space-y-6">
                                        <div className="flex items-center gap-4 px-4">
                                            <div className="h-10 w-10 bg-blue-50 dark:bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
                                                <Calendar className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <h3 className="text-xl font-black uppercase tracking-tighter">{group.name} FİKSTÜRÜ</h3>
                                        </div>
                                        
                                        <div className="grid gap-4">
                                            {group.games.sort((a,b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()).map(game => (
                                                <Card key={game.id} className="bg-card border-border rounded-[2rem] hover:bg-muted/50 transition-all group overflow-hidden shadow-sm relative">
                                                    <CardContent className="p-6">
                                                        {isCommittee && (
                                                            <Button 
                                                                size="icon" 
                                                                variant="ghost" 
                                                                onClick={() => openResultModal(game)}
                                                                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-muted/50 hover:bg-blue-600 hover:text-white transition-all"
                                                            >
                                                                <Edit3 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        )}
                                                        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8">
                                                            {/* Home Team */}
                                                            <div className="flex items-center gap-6 justify-end">
                                                                <div className="text-right">
                                                                    <p className="font-black uppercase text-sm tracking-tight group-hover:text-blue-500 transition-colors line-clamp-1">{game.home_team.name}</p>
                                                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">{game.home_team.unit.name}</p>
                                                                </div>
                                                                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center font-black text-xs text-muted-foreground group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner shrink-0">
                                                                    {game.home_team.name.substring(0, 2).toUpperCase()}
                                                                </div>
                                                            </div>

                                                            {/* Score / Time */}
                                                            <div className="flex flex-col items-center gap-3">
                                                                <Link href={route('games.show', game.id)} className="w-full">
                                                                    <div className="flex items-center justify-center gap-4 px-8 py-3 bg-background rounded-2xl border border-border shadow-sm hover:border-blue-300 dark:hover:border-blue-500 transition-all active:scale-95 group/score relative mx-auto w-fit">
                                                                        {game.status === 'scheduled' ? (
                                                                            <span className="text-lg font-black">{format(new Date(game.scheduled_at), 'HH:mm')}</span>
                                                                        ) : (
                                                                            <>
                                                                                <span className="text-3xl font-black tabular-nums">{game.home_score ?? 0}</span>
                                                                                <span className="text-muted-foreground text-sm font-black">-</span>
                                                                                <span className="text-3xl font-black tabular-nums">{game.away_score ?? 0}</span>
                                                                                {game.status === 'live' && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span></span>}
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </Link>
                                                                <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                                    <Clock className="h-3 w-3 text-blue-600" />
                                                                    {format(new Date(game.scheduled_at), 'd MMMM yyyy', { locale: tr })}
                                                                </div>
                                                                {game.status === 'completed' && <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500 border-none text-[8px] font-black tracking-widest uppercase py-0.5 px-3 rounded-full">MAÇ TAMAMLANDI</Badge>}
                                                            </div>

                                                            {/* Away Team */}
                                                            <div className="flex items-center gap-6 justify-start">
                                                                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center font-black text-xs text-muted-foreground group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner shrink-0">
                                                                    {game.away_team.name.substring(0, 2).toUpperCase()}
                                                                </div>
                                                                <div className="text-left">
                                                                    <p className="font-black uppercase text-sm tracking-tight group-hover:text-blue-500 transition-colors line-clamp-1">{game.away_team.name}</p>
                                                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">{game.away_team.unit.name}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-32 rounded-[3rem] border border-dashed border-border bg-card flex flex-col items-center justify-center text-center">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-muted-foreground/30 mb-2">FİKSTÜR ANALİZ EDİLİYOR</h3>
                                    <p className="max-w-md text-muted-foreground/40 text-xs font-bold uppercase tracking-widest leading-relaxed">KURA ÇEKİMİ YAPILDIĞINDA TÜM MAÇ PROGRAMI BURADA LİSTELENECEKTİR.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'teams' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tournament.teams.map(team => (
                                <Card key={team.id} className="bg-card border-border rounded-3xl group hover:border-blue-200 dark:hover:border-blue-500/30 transition-all overflow-hidden relative shadow-sm hover:shadow-xl">
                                    <div className="p-8">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center font-black text-lg text-muted-foreground group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                                {team.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <Badge variant="secondary" className="bg-muted text-muted-foreground border-none font-black text-[9px] px-3 py-1 rounded-lg uppercase tracking-widest">
                                                {team.unit.name}
                                            </Badge>
                                        </div>
                                        <h3 className="text-xl font-black uppercase tracking-tighter mb-6">{team.name}</h3>
                                        <Link href={route('teams.show', team.id)}>
                                            <Button variant="outline" className="w-full border-border bg-muted/50 hover:bg-muted rounded-xl h-12 font-black uppercase text-[10px] tracking-widest group/btn">
                                                DETAYLARI GÖR <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Result Modal */}
            <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
                <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-border bg-background">
                    <form onSubmit={handleResultSubmit}>
                        <DialogHeader className="p-8 pb-0">
                            <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-foreground">HIZLI SONUÇ GİRİŞİ</DialogTitle>
                            <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest">MAÇ SKORUNUN VE DURUMUNUN GÜNCELLENMESİ</DialogDescription>
                        </DialogHeader>

                        <div className="p-8 space-y-8">
                            {/* Score Entry Area */}
                            <div className="flex items-center justify-between gap-6 p-8 bg-muted/30 rounded-[2rem] border border-border">
                                <div className="flex flex-col items-center gap-4 flex-1">
                                    <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow-lg">
                                        {selectedGame?.home_team.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="space-y-2 text-center">
                                        <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{selectedGame?.home_team.name}</Label>
                                        <Input 
                                            type="number" 
                                            value={resultForm.data.home_score}
                                            onChange={e => resultForm.setData('home_score', parseInt(e.target.value) || 0)}
                                            className="h-16 text-3xl font-black text-center rounded-2xl bg-background border-border"
                                        />
                                    </div>
                                </div>

                                <div className="text-4xl font-black text-muted-foreground pt-6">:</div>

                                <div className="flex flex-col items-center gap-4 flex-1">
                                    <div className="h-12 w-12 rounded-xl bg-slate-400 dark:bg-slate-600 flex items-center justify-center font-black text-white shadow-lg">
                                        {selectedGame?.away_team.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="space-y-2 text-center">
                                        <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{selectedGame?.away_team.name}</Label>
                                        <Input 
                                            type="number" 
                                            value={resultForm.data.away_score}
                                            onChange={e => resultForm.setData('away_score', parseInt(e.target.value) || 0)}
                                            className="h-16 text-3xl font-black text-center rounded-2xl bg-background border-border"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Settings Area */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">MAÇ DURUMU</Label>
                                    <Select value={resultForm.data.status} onValueChange={val => resultForm.setData('status', val)}>
                                        <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-transparent font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="scheduled">Planlandı</SelectItem>
                                            <SelectItem value="live">Devam Ediyor</SelectItem>
                                            <SelectItem value="completed">Tamamlandı</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">MAÇ TARİH/SAAT</Label>
                                    <Input 
                                        type="datetime-local" 
                                        value={resultForm.data.scheduled_at}
                                        onChange={e => resultForm.setData('scheduled_at', e.target.value)}
                                        className="h-12 rounded-xl bg-muted/50 border-transparent font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-8 pt-0 flex gap-3">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => setIsResultModalOpen(false)}
                                className="h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest text-muted-foreground"
                            >
                                İPTAL
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={resultForm.processing}
                                className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl flex-1 shadow-lg shadow-blue-600/20"
                            >
                                <Save className="mr-2 h-4 w-4" /> BİLGİLERİ KAYDET
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
