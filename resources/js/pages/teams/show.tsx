import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, router, useForm, Link } from '@inertiajs/react';
import { 
    User, 
    Shield, 
    Award, 
    CheckCircle, 
    Plus, 
    Search, 
    Trash2, 
    AlertCircle, 
    Building2, 
    UserPlus, 
    Info, 
    Users,
    Trophy,
    XCircle,
    MessageSquare,
    AlertTriangle,
    TrendingUp,
    Zap,
    Star,
    Target,
    Activity,
    ArrowLeft,
    CheckCircle2,
    MapPin,
    Swords,
    Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import axios from 'axios';

interface Player {
    id: number;
    first_name: string;
    last_name: string;
    is_company_staff: boolean;
    is_permanent_staff: boolean;
    is_licensed: boolean;
    tc_id: string;
    sicil_no: string;
    health_certificate_at: string | null;
    current_team?: { id: number; name: string };
    goals_count?: number;
    yellow_cards_count?: number;
    jersey_number: number | null;
    suspension?: {
        is_suspended: boolean;
        reason: string | null;
    };
}

interface Team {
    id: number;
    name: string;
    unit_id: number;
    tournament_id: number;
    unit: { name: string } | null;
    tournament: { 
        name: string;
        settings: {
            max_roster_size: number;
            min_roster_size: number;
            max_licensed_players: number;
            max_company_players: number;
            max_licensed_on_pitch: number;
            max_company_on_pitch: number;
            yellow_card_limit: number;
            substitution_limit: number;
            total_players_on_pitch: number;
            min_players_on_pitch: number;
        };
    } | null;
    captain: Player | null;
    players: Player[];
    status: string;
    has_exception: boolean;
    rejection_reason: string | null;
}

interface Performance {
    stats: {
        played: number;
        wins: number;
        draws: number;
        losses: number;
        goals_for: number;
        goals_against: number;
        clean_sheets: number;
    };
    form: ('W' | 'L' | 'D')[];
    top_scorer: Player | null;
}

interface Props {
    team: Team;
    performance: Performance;
    nextMatch: any | null;
    can: { update: boolean; approve: boolean };
}

export default function Show({ team, performance, nextMatch, can }: Props) {
    const { auth, errors: globalErrors, flash } = usePage<SharedData>().props;
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Player[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [searchError, setSearchError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetching, setIsFetching] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        first_name: '',
        last_name: '',
        tc_id: '',
        sicil_no: '',
        unit_id: team.unit_id,
        is_company_staff: false as boolean,
        is_permanent_staff: true as boolean,
        is_licensed: false as boolean,
        health_certificate: true as boolean,
        team_id: team.id,
        is_captain: false as boolean,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Takımlar', href: '/teams' },
        { title: team.name, href: `/teams/${team.id}` },
    ];

    const fetchPlayers = (p: number, query: string, append: boolean = false) => {
        setIsFetching(true);
        axios.get(`/api/players/search?q=${query}&unit_id=${team.unit_id}&tournament_id=${team.tournament_id}&page=${p}`)
            .then(res => {
                const newData = res.data?.data || [];
                setSearchResults(prev => append ? [...prev, ...newData] : newData);
                setHasMore(!!res.data?.next_page_url);
                setIsFetching(false);
            })
            .catch(() => setIsFetching(false));
    };

    useEffect(() => {
        if (isDialogOpen && !showRegistrationForm) {
            setPage(1);
            fetchPlayers(1, searchQuery, false);
        }
    }, [searchQuery, isDialogOpen, showRegistrationForm]);

    const loadMore = () => {
        if (!isFetching && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchPlayers(nextPage, searchQuery, true);
        }
    };

    const handleAddPlayer = (playerId: number) => {
        setSearchError(null);
        router.post(route('teams.players.add', team.id), { player_id: playerId }, {
            onSuccess: () => {
                setSearchQuery('');
            },
            preserveScroll: true,
            onError: (err: any) => {
                setSearchError(err.player_id || 'Bir hata oluştu.');
            }
        });
    };

    const handleRegisterPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('players.store'), {
            onSuccess: () => {
                setIsDialogOpen(false);
                setShowRegistrationForm(false);
                reset();
                setSearchQuery('');
            }
        });
    };

    const handleRemovePlayer = (playerId: number) => {
        if (confirm('Bu oyuncuyu kadrodan çıkarmak istediğinize emin misiniz?')) {
            router.delete(route('teams.players.remove', { team: team.id, player: playerId }));
        }
    };

    const handleApprove = () => {
        if (confirm('Bu takımın tüm kurallara uygun olduğunu onaylıyor musunuz?')) {
            router.post(route('teams.approve', team.id));
        }
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('teams.reject', team.id), { reason: rejectionReason }, {
            onSuccess: () => {
                setIsRejectDialogOpen(false);
                setRejectionReason('');
            }
        });
    };

    const handleSetCaptain = (playerId: number) => {
        router.post(route('teams.set-captain', { team: team.id, player: playerId }));
    };

    const handleToggleHealth = (playerId: number) => {
        router.post(route('players.toggle-health', playerId));
    };

    // Auto-fill sicil_no with tc_id for company staff
    useEffect(() => {
        if (data.is_company_staff) {
            setData('sicil_no', data.tc_id);
        }
    }, [data.tc_id, data.is_company_staff]);

    const licensedCount = team.players.filter(p => p.is_licensed).length;
    const companyStaffCount = team.players.filter(p => p.is_company_staff).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Takım Profili: ${team.name}`} />
            
            <div className="min-h-screen bg-slate-50 dark:bg-black p-4 md:p-8 font-sans">
                
                {/* Status Alerts */}
                {(globalErrors as any).error && (
                    <Alert variant="destructive" className="rounded-[2rem] border-rose-200 bg-rose-50 p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                        <AlertTriangle className="h-5 w-5" />
                        <AlertTitle className="text-[10px] font-black uppercase tracking-widest mb-1">ONAYLAMA HATASI</AlertTitle>
                        <AlertDescription className="text-xs font-bold leading-relaxed">
                            <p>{(globalErrors as any).error}</p>
                            {Array.isArray((globalErrors as any).details) && (
                                <ul className="mt-3 list-disc list-inside space-y-1">
                                    {((globalErrors as any).details as string[]).map((detail, idx) => (
                                        <li key={idx} className="uppercase text-[9px] tracking-tight">{detail}</li>
                                    ))}
                                </ul>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Team Hero Header */}
                <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-slate-950 to-blue-950 p-8 md:p-16 text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-white/5 mb-12">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Shield className="h-64 w-64 rotate-12" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12">
                        <div className="flex flex-col md:flex-row items-center gap-10 text-center md:text-left">
                            <div className="relative flex h-32 w-32 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-5xl font-black shadow-2xl ring-8 ring-white/5">
                                {team.name.substring(0, 2).toUpperCase()}
                                <div className="absolute -bottom-2 -right-2 bg-amber-400 p-2 rounded-xl shadow-lg ring-4 ring-slate-900">
                                    <Trophy className="h-5 w-5 text-slate-900" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none mb-4">{team.name}</h1>
                                <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                                    <Badge className="bg-white/5 text-white/60 border-white/10 uppercase py-2 px-5 text-[10px] font-black tracking-widest rounded-full backdrop-blur-xl">
                                        <Building2 className="mr-2 h-3.5 w-3.5" /> {team.unit?.name}
                                    </Badge>
                                    <Badge className="bg-blue-600 text-white border-none uppercase py-2 px-5 text-[10px] font-black tracking-widest rounded-full shadow-lg shadow-blue-600/20">
                                        {team.tournament?.name}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Recent Form Guide */}
                        <div className="flex flex-col items-center xl:items-end gap-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">SON PERFORMANS</p>
                            <div className="flex gap-2">
                                {performance.form.length === 0 && <span className="text-xs font-bold text-white/20 uppercase tracking-widest">— VERİ YOK —</span>}
                                {performance.form.map((res, i) => (
                                    <div key={i} className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm shadow-lg ${
                                        res === 'W' ? 'bg-emerald-500 text-white' : 
                                        res === 'L' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-white'
                                    }`}>
                                        {res}
                                    </div>
                                ))}
                            </div>
                            {can.approve && team.status !== 'approved' && (
                                <div className="flex gap-4 mt-4">
                                    <Button onClick={handleApprove} className="h-14 px-10 bg-white text-slate-950 hover:bg-emerald-500 hover:text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl transition-all">TAKIMI ONAYLA</Button>
                                    <Button onClick={() => setIsRejectDialogOpen(true)} variant="outline" className="h-14 px-8 border-white/10 text-white hover:bg-white/5 font-black uppercase tracking-widest text-[11px] rounded-2xl">REDDET</Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    
                    {/* Left: Performance Stats */}
                    <div className="xl:col-span-4 space-y-8">
                        
                        {/* Responsible Person */}
                        <Card className="border-none shadow-xl bg-white dark:bg-neutral-900 rounded-[3rem] overflow-hidden">
                            <CardContent className="p-8 flex items-center gap-6">
                                <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-black/40 flex items-center justify-center text-slate-500">
                                    <Award className="h-8 w-8" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">TAKIM SORUMLUSU</p>
                                    <h4 className="text-lg font-black uppercase tracking-tighter leading-none">
                                        {team.captain ? `${team.captain.first_name} ${team.captain.last_name}` : 'Atanmamış'}
                                    </h4>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Elite Key Stats Card */}
                        <Card className="border-none shadow-2xl bg-white dark:bg-neutral-900 rounded-[3rem] overflow-hidden">
                            <CardHeader className="p-8 pb-4 border-none">
                                <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                    <TrendingUp className="h-5 w-5 text-blue-600" /> KULÜP ANALİZİ
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 bg-slate-50 dark:bg-black/20 rounded-3xl border border-slate-100 dark:border-white/5">
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">GALİBİYET</p>
                                        <h4 className="text-3xl font-black tabular-nums">{performance.stats.wins}</h4>
                                    </div>
                                    <div className="p-6 bg-slate-50 dark:bg-black/20 rounded-3xl border border-slate-100 dark:border-white/5">
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">GOL ATILAN</p>
                                        <h4 className="text-3xl font-black tabular-nums">{performance.stats.goals_for}</h4>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <StatLine 
                                        label="Birim Gücü (Kadro)" 
                                        value={team.players.length} 
                                        max={team.tournament?.settings.max_roster_size ?? 12} 
                                        min={team.tournament?.settings.min_roster_size ?? 6} 
                                        color="bg-blue-600" 
                                    />
                                    <StatLine 
                                        label="Lisanslı Personel" 
                                        value={licensedCount} 
                                        max={team.tournament?.settings.max_licensed_players ?? 2} 
                                        color="bg-amber-500" 
                                    />
                                    <StatLine 
                                        label="Firma Personeli" 
                                        value={companyStaffCount} 
                                        max={team.tournament?.settings.max_company_players ?? 5} 
                                        color="bg-indigo-400" 
                                    />
                                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 space-y-4">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                            <span>SARI KART SINIRI</span>
                                            <span className="text-amber-500">{team.tournament?.settings.yellow_card_limit} KART</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                            <span>MAÇ BAŞI DEĞİŞİKLİK</span>
                                            <span className="text-blue-500">{team.tournament?.settings.substitution_limit} HAK</span>
                                        </div>
                                    </div>
                                    <StatLine label="Fair-Play Performansı" value={Math.max(0, 100 - (performance.stats.losses * 10))} max={100} color="bg-emerald-500" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Next Match Feature Card */}
                        {nextMatch && (
                            <Card className="border-none shadow-2xl bg-white dark:bg-neutral-900 rounded-[3rem] overflow-hidden flex flex-col group animate-in slide-in-from-left duration-700">
                                <CardHeader className="p-8 pb-4 border-none bg-slate-50/50 dark:bg-black/20">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-black uppercase tracking-tighter">SIRADAKİ GÖREV</CardTitle>
                                            <CardDescription className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1">PROGRAMDAKİ İLK MAÇINIZ</CardDescription>
                                        </div>
                                        <div className="h-10 w-10 bg-blue-100 dark:bg-blue-500/10 rounded-xl flex items-center justify-center">
                                            <Swords className="h-5 w-5 text-blue-600" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    <div className="flex items-center justify-between gap-6">
                                        <div className="flex flex-col items-center flex-1">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-black/40 flex items-center justify-center font-black text-xs border border-slate-200 dark:border-white/5">{nextMatch.home_team.name.substring(0, 2).toUpperCase()}</div>
                                            <span className="text-[10px] font-black uppercase mt-3 text-center leading-tight">{nextMatch.home_team.name}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="bg-blue-50 dark:bg-blue-600/10 px-4 py-1.5 rounded-full border border-blue-100 dark:border-blue-500/20">
                                                <span className="text-2xl font-black text-blue-600 tabular-nums">{format(new Date(nextMatch.scheduled_at), 'HH:mm')}</span>
                                            </div>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase mt-2 tracking-widest">{format(new Date(nextMatch.scheduled_at), 'd MMMM', { locale: tr })}</span>
                                        </div>
                                        <div className="flex flex-col items-center flex-1">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-black/40 flex items-center justify-center font-black text-xs border border-slate-200 dark:border-white/5">{nextMatch.away_team.name.substring(0, 2).toUpperCase()}</div>
                                            <span className="text-[10px] font-black uppercase mt-3 text-center leading-tight">{nextMatch.away_team.name}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-6 border-t border-slate-50 dark:border-white/5">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-emerald-500" />
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">LOKASYON:</span>
                                            </div>
                                            <span className="text-[11px] font-black uppercase text-slate-900 dark:text-white">{nextMatch.field?.name || 'BELİRLENMEDİ'}</span>
                                        </div>
                                        <Link href={route('games.show', nextMatch.id)}>
                                            <Button className="w-full h-14 bg-slate-950 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-950/20 transition-all">MAÇ MERKEZİNE GİT</Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Star Player Feature */}
                        {performance.top_scorer && (
                            <Card className="border-none shadow-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-[3rem] overflow-hidden group">
                                <CardContent className="p-10 relative">
                                    <Star className="absolute top-0 right-0 h-40 w-40 opacity-10 -rotate-12 translate-x-8 -translate-y-8" />
                                    <div className="relative z-10 flex items-center gap-6">
                                        <div className="h-20 w-20 rounded-[2rem] bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black">
                                            <Target className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1 opacity-80">TAKIMIN YILDIZI</p>
                                            <h3 className="text-2xl font-black tracking-tighter uppercase leading-none">{performance.top_scorer.first_name} {performance.top_scorer.last_name}</h3>
                                            <p className="text-lg font-black mt-2 tabular-nums">{performance.top_scorer.goals_count} GOL</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                    </div>

                    {/* Right: Roster Management */}
                    <div className="xl:col-span-8 space-y-8">
                        <Card className="border-none shadow-2xl bg-white dark:bg-neutral-900 rounded-[3rem] overflow-hidden">
                            <CardHeader className="p-10 border-b border-slate-50 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50/50 dark:bg-black/20">
                                <div className="space-y-1">
                                    <CardTitle className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
                                        <Users className="h-8 w-8 text-blue-600" /> ESAME LİSTESİ
                                    </CardTitle>
                                    <CardDescription className="text-xs font-bold font-black uppercase tracking-widest text-muted-foreground">TURNUVA RESMİ KADRO KAYITLARI</CardDescription>
                                </div>
                                
                                {can.update && (
                                    <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) setShowRegistrationForm(false); }}>
                                        <DialogTrigger asChild>
                                            <Button className="h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                                                <UserPlus className="mr-3 h-5 w-5" /> KADROYA EKLE
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-2xl rounded-[3rem] border-none shadow-3xl p-0 overflow-hidden">
                                            <DialogHeader className="p-10 bg-slate-950 text-white">
                                                <DialogTitle className="text-3xl font-black uppercase tracking-tighter">
                                                    {showRegistrationForm ? 'YENİ PERSONEL KAYDI' : 'KADRODAN OYUNCU SEÇ'}
                                                </DialogTitle>
                                                <DialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-2 leading-relaxed">
                                                    BİRİMİNİZE KAYITLI TÜM PERSONELLER BURADA LİSTELENİRT.
                                                </DialogDescription>
                                            </DialogHeader>
                                            
                                            <div className="p-10">
                                                {!showRegistrationForm ? (
                                                    <div className="space-y-8">
                                                        <div className="flex gap-4">
                                                            <div className="relative flex-1">
                                                                <Search className="absolute left-5 top-4 h-6 w-6 text-slate-300" />
                                                                <Input 
                                                                    placeholder="Personel ara..." 
                                                                    className="h-14 pl-14 rounded-2xl bg-neutral-50 border-none font-bold uppercase"
                                                                    value={searchQuery}
                                                                    onChange={e => setSearchQuery(e.target.value)}
                                                                />
                                                            </div>
                                                            <Button onClick={() => setShowRegistrationForm(true)} variant="outline" className="h-14 px-6 rounded-2xl border-dashed border-slate-200">KAYIT [+]</Button>
                                                        </div>
                                                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                            {searchResults.map(p => {
                                                                const isAlreadyIn = team.players.some(tp => tp.id === p.id);
                                                                const inOther = !!p.current_team && p.current_team.id !== team.id;
                                                                return (
                                                                    <div key={p.id} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${isAlreadyIn ? 'bg-blue-50 border-blue-100' : 'bg-white border-slate-100 hover:border-blue-400'}`}>
                                                                        <div className="flex items-center gap-4">
                                                                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black ${isAlreadyIn ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                                                {isAlreadyIn ? <CheckCircle2 className="h-6 w-6" /> : `${p.first_name[0]}${p.last_name[0]}`}
                                                                            </div>
                                                                            <div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <p className="font-black uppercase text-sm">{p.first_name} {p.last_name}</p>
                                                                                    {p.is_licensed && <Badge className="bg-amber-100 text-amber-700 border-none text-[8px] font-black h-4 px-1.5 rounded-sm">VİZELİ</Badge>}
                                                                                </div>
                                                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{inOther ? `FARKLI TAKIMDA: ${p.current_team?.name}` : `SİCİL: ${p.sicil_no}`}</p>
                                                                            </div>
                                                                        </div>
                                                                        {!isAlreadyIn && !inOther && (
                                                                            <Button size="sm" className="bg-blue-600 rounded-xl" onClick={() => handleAddPlayer(p.id)}>KADROYA EKLE</Button>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                            {hasMore && <Button variant="ghost" className="w-full text-[10px] font-black uppercase text-muted-foreground" onClick={loadMore}>DAHA FAZLA GÖSTER</Button>}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <form onSubmit={handleRegisterPlayer} className="space-y-6">
                                                        <div className="grid grid-cols-2 gap-6">
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] font-black uppercase text-muted-foreground">AD</Label>
                                                                <Input required value={data.first_name} onChange={e => setData('first_name', e.target.value)} className="h-12 rounded-xl bg-slate-50 border-none uppercase font-black" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] font-black uppercase text-muted-foreground">SOYAD</Label>
                                                                <Input required value={data.last_name} onChange={e => setData('last_name', e.target.value)} className="h-12 rounded-xl bg-slate-50 border-none uppercase font-black" />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-6">
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] font-black uppercase text-muted-foreground">TC KİMLİK</Label>
                                                                <Input required maxLength={11} value={data.tc_id} onChange={e => setData('tc_id', e.target.value)} className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] font-black uppercase text-muted-foreground">SİCİL NUMARASI</Label>
                                                                <Input 
                                                                    required={!data.is_company_staff} 
                                                                    value={data.sicil_no} 
                                                                    onChange={e => setData('sicil_no', e.target.value)} 
                                                                    className="h-12 rounded-xl bg-slate-50 border-none font-bold placeholder:text-slate-300"
                                                                    placeholder={data.is_company_staff ? 'OTOMATİK (TC)' : 'PERSONEL NO'}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-6">
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] font-black uppercase text-muted-foreground">PERSONEL TİPİ</Label>
                                                                <div className="flex gap-4 pt-1">
                                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                                        <input type="radio" name="p_type" checked={data.is_permanent_staff} onChange={() => setData(prev => ({...prev, is_permanent_staff: true, is_company_staff: false}))} />
                                                                        <span className="text-[10px] font-black uppercase">KADROLU</span>
                                                                    </label>
                                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                                        <input type="radio" name="p_type" checked={data.is_company_staff} onChange={() => setData(prev => ({...prev, is_company_staff: true, is_permanent_staff: false}))} />
                                                                        <span className="text-[10px] font-black uppercase">FİRMA</span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2 pt-5">
                                                                <div className="flex items-center space-x-2">
                                                                    <Checkbox 
                                                                        id="is_licensed" 
                                                                        checked={data.is_licensed} 
                                                                        onCheckedChange={(checked) => setData('is_licensed', checked as boolean)}
                                                                        className="rounded-lg border-slate-300"
                                                                    />
                                                                    <label
                                                                        htmlFor="is_licensed"
                                                                        className="text-xs font-black uppercase tracking-tight cursor-pointer"
                                                                    >
                                                                        LİSANSLI (VİZELİ)
                                                                    </label>
                                                                </div>
                                                                <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">TURNUVA VİZESİ VAR MI?</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-4 pt-4">
                                                            <Button type="button" variant="ghost" className="flex-1 rounded-2xl h-14" onClick={() => setShowRegistrationForm(false)}>İPTAL</Button>
                                                            <Button type="submit" disabled={processing} className="flex-1 rounded-2xl h-14 bg-blue-600 shadow-xl">KAYDI TAMAMLA</Button>
                                                        </div>
                                                    </form>
                                                )}
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </CardHeader>
                            <CardContent className="p-0 overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50/50 dark:bg-black/10">
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableHead className="pl-10 py-8 uppercase font-black text-[10px] tracking-widest text-muted-foreground w-[80px] text-center">FORMA</TableHead>
                                            <TableHead className="py-8 uppercase font-black text-[10px] tracking-widest text-muted-foreground w-1/3">Oyuncu Profili</TableHead>
                                            <TableHead className="py-8 uppercase font-black text-[10px] tracking-widest text-muted-foreground text-center">Birim / Sicil</TableHead>
                                            <TableHead className="py-8 uppercase font-black text-[10px] tracking-widest text-muted-foreground text-center">Sağlık / Durum</TableHead>
                                            {can.update && <TableHead className="pr-10 py-8 uppercase font-black text-[10px] tracking-widest text-muted-foreground text-right">Aksiyon</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {team.players.map((player) => (
                                            <TableRow key={player.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] border-b border-slate-50 dark:border-white/5 transition-colors">
                                                <TableCell className="pl-10 py-8">
                                                    <Link href={route('players.show', player.id)} className="flex items-center justify-center">
                                                        <div className={`h-12 w-12 rounded-full flex items-center justify-center font-black text-sm relative transition-all group-hover:scale-110 ${player.jersey_number ? 'bg-neutral-900 text-white shadow-lg' : 'bg-slate-100 text-slate-300'}`}>
                                                            {player.jersey_number || '??'}
                                                            {player.is_licensed && (
                                                                <div className="absolute -top-1 -right-1 bg-blue-600 text-white p-1 rounded-full shadow-lg border-2 border-white dark:border-neutral-900">
                                                                    <Shield className="h-2 w-2" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="py-8">
                                                    <div className="flex items-center gap-5">
                                                        <Link href={route('players.show', player.id)} className={`h-16 w-16 rounded-3xl flex items-center justify-center font-black text-lg transition-transform group-hover:scale-110 ${player.id === team.captain?.id ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                                            {player.first_name[0]}{player.last_name[0]}
                                                        </Link>
                                                        <div>
                                                            <Link href={route('players.show', player.id)}>
                                                                <h4 className="font-black uppercase text-base tracking-tighter leading-none hover:text-blue-600 transition-colors">{player.first_name} {player.last_name}</h4>
                                                            </Link>
                                                            <div className="mt-3 flex items-center gap-2">
                                                                {player.id === team.captain?.id ? (
                                                                    <Badge className="bg-amber-600 text-white border-none py-1 px-3 text-[8px] font-black uppercase tracking-widest rounded-lg">KAPTAN</Badge>
                                                                ) : can.update && (
                                                                    <Button variant="ghost" onClick={() => handleSetCaptain(player.id)} className="h-6 px-3 text-[8px] font-black uppercase bg-slate-100 dark:bg-white/5 text-muted-foreground opacity-0 group-hover:opacity-100 rounded-lg">KAPTAN YAP</Button>
                                                                )}
                                                                {player.is_licensed && (
                                                                    <Badge className="bg-amber-100 text-amber-700 border-none py-1 px-3 text-[8px] font-black uppercase tracking-widest rounded-lg">VİZELİ / LİSANSLI</Badge>
                                                                )}
                                                                <Badge variant="outline" className="border-slate-200 text-slate-500 py-1 px-3 text-[8px] font-black uppercase tracking-widest rounded-lg">{player.is_company_staff ? 'FİRMA' : 'KADRO'}</Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="flex items-center gap-1">
                                                            {[...Array(team.tournament?.settings.yellow_card_limit)].map((_, i) => (
                                                                <div 
                                                                    key={i} 
                                                                    className={`h-4 w-2.5 rounded-sm border ${i < (player.yellow_cards_count || 0) ? 'bg-amber-400 border-amber-500 shadow-sm shadow-amber-500/50' : 'bg-slate-100 dark:bg-white/5 border-transparent opacity-30'}`} 
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">DİSİPLİN DURUMU</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-black text-sm uppercase tracking-tight">{player.sicil_no || '—'}</span>
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">SİCİL NUMARASI</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        {player.health_certificate_at ? (
                                                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/5 px-4 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                                                                <CheckCircle2 className="h-3 w-3" />
                                                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">ONAYLI</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-rose-600 bg-rose-50 dark:bg-rose-500/5 px-4 py-1.5 rounded-full border border-rose-100 dark:border-rose-500/20">
                                                                <AlertCircle className="h-3 w-3" />
                                                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">RAPOR EKSİK</span>
                                                            </div>
                                                        )}
                                                        {player.suspension?.is_suspended && (
                                                            <Badge className="bg-rose-600 text-white border-none py-1 px-3 text-[8px] font-black uppercase tracking-widest rounded-lg animate-pulse" title={player.suspension.reason || ''}>CEZALI</Badge>
                                                        )}
                                                        {can.update && (
                                                            <Button onClick={() => handleToggleHealth(player.id)} variant="ghost" className="h-5 text-[7px] font-black uppercase text-muted-foreground hover:text-blue-600">DURUMU DEĞİŞTİR</Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                {can.update && (
                                                    <TableCell className="pr-10 text-right">
                                                        <Button onClick={() => handleRemovePlayer(player.id)} variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all active:scale-90">
                                                            <Trash2 className="h-5 w-5" />
                                                        </Button>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Reject Dialog */}
                <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                    <DialogContent className="rounded-[3rem] p-0 overflow-hidden border-none shadow-3xl">
                        <DialogHeader className="p-10 bg-rose-600 text-white">
                            <DialogTitle className="text-3xl font-black uppercase tracking-tighter leading-none">BAŞVURUYU REDDET</DialogTitle>
                            <DialogDescription className="text-rose-100 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Düzeltilmesi gereken hataları belirtiniz.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleReject} className="p-10 space-y-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">RED GEREKÇESİ (TAKIM YÖNETİCİSİ GÖRECEKTİR)</Label>
                                <Textarea 
                                    className="min-h-[150px] rounded-3xl bg-slate-50 border-none p-6 text-sm font-medium"
                                    placeholder="Örn: Kadroda yeterli personel bulunmuyor veya sicil numaraları hatalı..."
                                    value={rejectionReason}
                                    onChange={e => setRejectionReason(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full h-16 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-rose-600/20">REDDİ ONAYLA VE TAKIMA BİLDİR</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

function StatLine({ label, value, max, min, color }: { label: string; value: number; max: number; min?: number; color: string }) {
    const progress = Math.min((value / max) * 100, 100);
    const isError = (min !== undefined && value < min) || value > max;
    
    return (
        <div className="space-y-3 p-1">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
                <span className={`text-[11px] font-black tabular-nums ${isError ? 'text-rose-600' : 'text-slate-900'}`}>{value} / {max}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-1000 ${isError ? 'bg-rose-500' : color}`} 
                    style={{ width: `${progress}%` }}
                />
            </div>
            {isError && min !== undefined && (
                <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
                    <AlertCircle className="h-2 w-2" /> EN AZ {min} KAYIT GEREKLİ
                </p>
            )}
        </div>
    );
}
