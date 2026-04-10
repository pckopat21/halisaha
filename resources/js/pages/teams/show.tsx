import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, router, useForm } from '@inertiajs/react';
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
    AlertTriangle
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
}

interface Team {
    id: number;
    name: string;
    unit_id: number;
    tournament_id: number;
    unit: { name: string } | null;
    tournament: { name: string } | null;
    captain: Player | null;
    players: Player[];
    status: string;
    has_exception: boolean;
    rejection_reason: string | null;
}

interface Props {
    team: Team;
    can: { update: boolean; approve: boolean };
}

export default function Show({ team, can }: Props) {
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
        is_company_staff: false,
        is_permanent_staff: true,
        is_licensed: false,
        health_certificate: true,
        team_id: team.id,
        is_captain: false,
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
        setPage(1);
        fetchPlayers(1, searchQuery, false);
    }, [searchQuery, team.unit_id]);

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
                // Keep dialog open for multiple additions
                setSearchQuery('');
                // The results will automatically re-check 'isAlreadyInTeam' because props.team updates
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

    // Rule counters
    const firmaCount = team.players?.filter(p => p.is_company_staff).length || 0;
    const licensedCount = team.players?.filter(p => p.is_licensed).length || 0;
    const totalCount = team.players?.length || 0;

    // Auto-fill sicil_no with tc_id for company staff
    useEffect(() => {
        if (data.is_company_staff) {
            setData('sicil_no', data.tc_id);
        }
    }, [data.tc_id, data.is_company_staff]);

    const handleSetCaptain = (playerId: number) => {
        router.post(route('teams.set-captain', { team: team.id, player: playerId }));
    };

    const handleToggleHealth = (playerId: number) => {
        router.post(route('players.toggle-health', playerId));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Takım: ${team.name}`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6 font-sans max-w-7xl mx-auto w-full">
                
                {/* Global Error/Success Messaging */}
                {(globalErrors as any).error && (
                    <Alert variant="destructive" className="rounded-[1.5rem] border-rose-200 bg-rose-50/50 p-6 animate-in fade-in slide-in-from-top-4 duration-300">
                        <AlertTriangle className="h-5 w-5" />
                        <AlertTitle className="text-[11px] font-black uppercase tracking-widest mb-1">ONAYLAMA HATASI</AlertTitle>
                        <AlertDescription className="text-xs font-bold leading-relaxed">
                            <p>{(globalErrors as any).error}</p>
                            {Array.isArray((globalErrors as any).details) && (
                                <ul className="mt-3 list-disc list-inside space-y-1">
                                    {((globalErrors as any).details as string[]).map((detail, idx) => (
                                        <li key={idx} className="uppercase text-[10px] tracking-tight">{detail}</li>
                                    ))}
                                </ul>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {flash?.success && (
                    <Alert className="rounded-[1.5rem] border-emerald-200 bg-emerald-50/50 p-6 text-emerald-800">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <AlertTitle className="text-[11px] font-black uppercase tracking-widest mb-1">BAŞARILI</AlertTitle>
                        <AlertDescription className="text-xs font-bold uppercase">{flash.success}</AlertDescription>
                    </Alert>
                )}

                {team.status === 'rejected' && team.rejection_reason && (
                    <Alert className="rounded-[1.5rem] border-rose-200 bg-rose-50/50 p-6 text-rose-800">
                        <XCircle className="h-5 w-5 text-rose-600" />
                        <AlertTitle className="text-[11px] font-black uppercase tracking-widest mb-1">RED GEREKÇESİ</AlertTitle>
                        <AlertDescription className="text-xs font-bold">{team.rejection_reason}</AlertDescription>
                    </Alert>
                )}

                {/* Modern Header */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-neutral-900 p-8 xl:p-12 text-white shadow-2xl border border-neutral-800">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Shield className="h-48 w-48" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                            <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-blue-600 text-4xl font-black shadow-2xl shadow-blue-500/20 ring-8 ring-blue-500/10">
                                {team.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-4xl xl:text-5xl font-black tracking-tight uppercase leading-none">{team.name}</h1>
                                <div className="mt-4 flex flex-wrap items-center gap-3 justify-center md:justify-start">
                                    <Badge className="bg-neutral-800 text-neutral-300 border-neutral-700 uppercase py-1.5 px-4 text-[10px] font-black tracking-widest rounded-xl">{team.unit?.name || 'BELİRSİZ'}</Badge>
                                    <Badge className="bg-blue-600/10 text-blue-400 border-blue-600/20 uppercase py-1.5 px-4 text-[10px] font-black tracking-widest rounded-xl">{team.tournament?.name || 'BELİRSİZ'}</Badge>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 xl:gap-6">
                            <div className="text-right hidden xl:block mr-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-1 leading-none">Kayıt Durumu</p>
                                <p className={`text-2xl font-black uppercase tracking-tighter ${team.status === 'approved' ? 'text-emerald-500' : team.status === 'rejected' ? 'text-rose-500' : 'text-amber-500'}`}>
                                    {team.status === 'pending' ? 'İNCELEMEDE' : team.status === 'rejected' ? 'REDDEDİLDİ' : 'ONAYLANDI'}
                                </p>
                            </div>

                            {can.approve && team.status !== 'approved' && (
                                <div className="flex items-center gap-3">
                                    <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="h-14 px-6 border-rose-500/30 text-rose-500 hover:bg-rose-50 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all">REDDET</Button>
                                        </DialogTrigger>
                                        <DialogContent className="rounded-[2rem] border-none p-0 overflow-hidden shadow-2xl">
                                            <DialogHeader className="p-8 bg-rose-600 text-white">
                                                <DialogTitle className="text-2xl font-black uppercase tracking-tighter">BAŞVURUYU REDDET</DialogTitle>
                                                <DialogDescription className="text-rose-100 font-bold uppercase text-[10px] tracking-widest">Takım yöneticisine hatasını bildirin.</DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleReject} className="p-8 space-y-6">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase text-neutral-400">RED GEREKÇESİ (OPSİYONEL)</Label>
                                                    <Textarea 
                                                        placeholder="Örn: Takım kadrosunda yeterli oyuncu yok..." 
                                                        className="min-h-[120px] rounded-2xl bg-neutral-50 border-neutral-100 font-medium text-sm"
                                                        value={rejectionReason}
                                                        onChange={e => setRejectionReason(e.target.value)}
                                                    />
                                                </div>
                                                <DialogFooter>
                                                    <Button type="submit" className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl">REDDİ ONAYLA</Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>

                                    <Button onClick={handleApprove} className="h-14 px-10 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[11px] rounded-[1.5rem] shadow-xl shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 leading-none">BAŞVURUYU ONAYLA</Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Stats Column */}
                    <div className="space-y-8">
                        <Card className="border-none shadow-2xl bg-white dark:bg-neutral-900 rounded-[2rem] overflow-hidden">
                            <CardHeader className="p-6 pb-0 border-none">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2">
                                    <Info className="h-3 w-3" /> KURALLAR VE ÖZET
                                </h3>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="flex items-center justify-between p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                                    <div className="flex items-center gap-4">
                                        <div className="h-11 w-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner">
                                            <Award className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest leading-none">SORUMLU</p>
                                            <p className="font-bold text-sm uppercase mt-1.5 tracking-tighter">{team.captain ? `${team.captain.first_name} ${team.captain.last_name}` : 'Atanmamış'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-2">
                                    <StatItem label="Toplam Oyuncu (6-12)" current={totalCount} max={12} min={6} />
                                    <StatItem label="Firma Personeli (Maks 5)" current={firmaCount} max={5} />
                                    <StatItem label="Lisanslı Oyuncu (Maks 2)" current={licensedCount} max={2} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Roster Table */}
                    <Card className="lg:col-span-3 border-none shadow-2xl bg-white dark:bg-neutral-900 rounded-[2rem] overflow-hidden">
                        <CardHeader className="flex flex-col sm:flex-row items-center justify-between p-8 border-b border-neutral-50 dark:border-neutral-800 gap-6">
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                                    <Users className="h-7 w-7 text-blue-600" /> ESAME LİSTESİ
                                </h2>
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                                    <Building2 className="h-3 w-3" /> TAKIM BİRİMİ: {team.unit?.name}
                                </p>
                            </div>
                            
                            {can.update && (
                                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) { setShowRegistrationForm(false); reset(); } }}>
                                    <DialogTrigger asChild>
                                        <Button className="rounded-2xl h-12 px-8 bg-neutral-900 hover:bg-neutral-800 text-white font-black uppercase tracking-widest text-[11px] flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-neutral-900/20">
                                            <UserPlus className="h-5 w-5" /> KADROYA EKLE
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-xl rounded-[2.5rem] border-none shadow-3xl p-0 overflow-hidden">
                                        <DialogHeader className="p-8 bg-neutral-900 text-white border-b border-neutral-800">
                                            <DialogTitle className="text-3xl font-black uppercase tracking-tighter">
                                                {showRegistrationForm ? 'YENİ OYUNCU KAYDI' : 'KADRODAN SEÇ'}
                                            </DialogTitle>
                                            <DialogDescription className="uppercase font-black text-[10px] text-neutral-400 tracking-widest mt-2 leading-relaxed">
                                                TAKIMINIZIN BİRİMİNE ({team.unit?.name}) KAYITLI PERSONELLER LİSTELENİRT.
                                            </DialogDescription>
                                        </DialogHeader>
                                        
                                        <div className="p-8">
                                            {!showRegistrationForm ? (
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative flex-1">
                                                            <Search className="absolute left-5 top-4 h-6 w-6 text-neutral-300" />
                                                            <Input
                                                                placeholder="ARAMAK İÇİN YAZIN..."
                                                                className="h-14 pl-14 rounded-2xl bg-neutral-50 border-neutral-100 uppercase font-black text-sm tracking-tight focus:ring-blue-500/20"
                                                                value={searchQuery}
                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                            />
                                                        </div>
                                                        <Button 
                                                            variant="outline" 
                                                            className="h-14 px-6 border-dashed border-neutral-200 text-blue-600 hover:bg-neutral-900 hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shrink-0 transition-all flex flex-col items-center justify-center gap-1"
                                                            onClick={() => setShowRegistrationForm(true)}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                            YENİ PERSONEL
                                                        </Button>
                                                    </div>
                                                    
                                                    <div className="space-y-3 min-h-[300px] max-h-[450px] overflow-y-auto pr-3 custom-scrollbar">
                                                        {searchResults.map(player => {
                                                            const isAssignedToOther = !!player.current_team && player.current_team.id !== team.id;
                                                            const isAlreadyInTeam = team.players.some(p => p.id === player.id);
                                                            
                                                            return (
                                                                <div key={player.id} className={`group flex items-center justify-between p-5 rounded-[1.5rem] border ${isAssignedToOther ? 'opacity-60 bg-neutral-50 border-neutral-100 cursor-not-allowed' : 'border-neutral-100 hover:border-blue-500/40 hover:bg-blue-50/30 transition-all cursor-pointer shadow-sm'}`}>
                                                                    <div className="flex items-center gap-5">
                                                                        <div className={`h-12 w-12 rounded-[1rem] flex items-center justify-center font-black uppercase text-sm shadow-inner transition-colors ${isAlreadyInTeam ? 'bg-emerald-100 text-emerald-600' : 'bg-neutral-100 text-neutral-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                                                                            {isAlreadyInTeam ? <CheckCircle className="h-6 w-6" /> : `${player.first_name.charAt(0)}${player.last_name.charAt(0)}`}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-black uppercase text-sm tracking-tighter leading-none group-hover:text-blue-900 transition-colors">{player.first_name} {player.last_name}</p>
                                                                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1.5 leading-none">
                                                                                {isAssignedToOther ? (
                                                                                    <span className="text-rose-500">KADRODA: {player.current_team?.name}</span>
                                                                                ) : isAlreadyInTeam ? (
                                                                                    <span className="text-emerald-600">TAKIMA EKLENDİ</span>
                                                                                ) : (
                                                                                    `SİCİL: ${player.sicil_no} • TC: ${player.tc_id}`
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    {!isAssignedToOther && !isAlreadyInTeam && (
                                                                        <Button size="sm" variant="ghost" className="rounded-xl h-10 px-5 font-black uppercase text-[10px] text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition-all shadow-sm" onClick={() => handleAddPlayer(player.id)}>EKLE</Button>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}

                                                        {hasMore && (
                                                            <div className="py-8 text-center" onMouseOver={loadMore}>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-blue-600"
                                                                    onClick={loadMore}
                                                                    disabled={isFetching}
                                                                >
                                                                    {isFetching ? 'YÜKLENİYOR...' : 'DAHA FAZLA YÜKLE'}
                                                                </Button>
                                                            </div>
                                                        )}
                                                        
                                                        {searchError && (
                                                            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center gap-3">
                                                                <AlertCircle className="h-5 w-5" />
                                                                <p className="text-[10px] font-black uppercase tracking-widest">{searchError}</p>
                                                            </div>
                                                        )}
                                                        
                                                    </div>
                                                </div>
                                            ) : (
                                                <form onSubmit={handleRegisterPlayer} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">AD</Label>
                                                            <Input required className="h-12 rounded-xl bg-neutral-50 border-neutral-100 uppercase font-black" value={data.first_name} onChange={e => setData('first_name', e.target.value)} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">SOYAD</Label>
                                                            <Input required className="h-12 rounded-xl bg-neutral-50 border-neutral-100 uppercase font-black" value={data.last_name} onChange={e => setData('last_name', e.target.value)} />
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">TC NO</Label>
                                                            <Input required maxLength={11} className="h-12 rounded-xl bg-neutral-50 border-neutral-100 font-bold" value={data.tc_id} onChange={e => setData('tc_id', e.target.value)} />
                                                            {errors.tc_id && <p className="text-rose-600 text-[10px] font-black px-1 leading-tight">{errors.tc_id}</p>}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">SİCİL NO</Label>
                                                            <Input required disabled={data.is_company_staff} className="h-12 rounded-xl bg-neutral-50 border-neutral-100 uppercase font-black" value={data.sicil_no} onChange={e => setData('sicil_no', e.target.value)} />
                                                            {errors.sicil_no && <p className="text-rose-600 text-[10px] font-black px-1 leading-tight">{errors.sicil_no}</p>}
                                                        </div>
                                                    </div>
 
                                                    <div className="space-y-4 p-5 rounded-3xl bg-neutral-50 border border-neutral-100">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1 leading-none">PERSONEL TİPİ</Label>
                                                        <RadioGroup 
                                                            className="flex gap-8 px-1" 
                                                            defaultValue="permanent" 
                                                            onValueChange={(val) => {
                                                                setData({
                                                                    ...data,
                                                                    is_permanent_staff: val === 'permanent',
                                                                    is_company_staff: val === 'company'
                                                                });
                                                            }}
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                <RadioGroupItem value="permanent" id="r1" />
                                                                <Label htmlFor="r1" className="text-sm font-black uppercase cursor-pointer tracking-tighter">KADROLU PERSONEL</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-3">
                                                                <RadioGroupItem value="company" id="r2" />
                                                                <Label htmlFor="r2" className="text-sm font-black uppercase cursor-pointer tracking-tighter">FİRMA PERSONELİ</Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </div>

                                                    {!team.captain && (
                                                        <div className="p-4 flex items-center gap-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                                                            <Checkbox id="is_cap" checked={data.is_captain} onCheckedChange={v => setData('is_captain', !!v)} />
                                                            <Label htmlFor="is_cap" className="text-[10px] font-black uppercase tracking-widest text-blue-800 cursor-pointer">TAKIM KAPTANI YAP</Label>
                                                        </div>
                                                    )}
 
                                                    <div className="flex gap-4 pt-6">
                                                        <Button type="button" variant="ghost" className="flex-1 rounded-2xl h-14 uppercase font-black text-[10px] tracking-widest" onClick={() => setShowRegistrationForm(false)}>GERİ DÖN</Button>
                                                        <Button type="submit" disabled={processing} className="flex-1 rounded-2xl h-14 bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 uppercase font-black text-[10px] tracking-widest">KAYDET VE KADROYA EKLE</Button>
                                                    </div>
                                                </form>
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </CardHeader>
                        
                        <div className="p-0 overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-neutral-50/50 dark:bg-neutral-900 hover:bg-transparent border-none">
                                        <TableHead className="py-7 px-8 uppercase font-black text-[10px] text-neutral-400 tracking-widest">Kadro Bilgileri</TableHead>
                                        <TableHead className="py-7 uppercase font-black text-[10px] text-neutral-400 tracking-widest">Kimlik / Sicil</TableHead>
                                        <TableHead className="py-7 uppercase font-black text-[10px] text-neutral-400 tracking-widest">Kategori</TableHead>
                                        {can.update && <TableHead className="text-right px-8 py-7 uppercase font-black text-[10px] text-neutral-400 tracking-widest">İşlem</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {team.players?.map((player) => (
                                        <TableRow key={player.id} className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/10 transition-all border-b border-neutral-50 dark:border-neutral-800">
                                            <TableCell className="px-8 py-6">
                                                <div className="flex items-center gap-5">
                                                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black uppercase text-base shadow-sm ring-1 ring-inset ring-neutral-200/50 ${player.id === team.captain?.id ? 'bg-amber-100 text-amber-700' : 'bg-neutral-50 text-neutral-500'}`}>
                                                        {player.first_name.charAt(0)}{player.last_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black uppercase text-base tracking-tighter leading-none">{player.first_name} {player.last_name}</p>
                                                        {player.id === team.captain?.id ? (
                                                            <p className="text-[9px] font-black uppercase text-amber-600 tracking-widest mt-2 flex items-center gap-1.5 leading-none bg-amber-50 w-fit px-2 py-1 rounded-md">TAKIM SORUMLUSU</p>
                                                        ) : (
                                                            can.update && (
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm" 
                                                                    className="h-6 px-2 mt-2 text-[8px] font-black uppercase tracking-widest text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                                                    onClick={() => handleSetCaptain(player.id)}
                                                                >
                                                                    KAPTAN YAP
                                                                </Button>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-6 font-bold">
                                                <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
                                                    <Badge className="bg-neutral-100 text-neutral-700 text-[9px] uppercase font-black px-2 py-0.5 rounded-md border-none leading-none h-5 flex items-center">{player.sicil_no}</Badge>
                                                </div>
                                                <p className="text-[10px] text-neutral-400 mt-2 font-bold tracking-tight uppercase leading-none">TC: {player.tc_id}</p>
                                            </TableCell>
                                            <TableCell className="py-6">
                                                <div className="flex flex-col gap-2 uppercase">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`h-1.5 w-1.5 rounded-full ${player.is_company_staff ? 'bg-amber-500 shadow-sm shadow-amber-500' : 'bg-blue-500 shadow-sm shadow-blue-500'}`}></span>
                                                        <span className="text-[9px] font-black text-neutral-500 tracking-widest">{player.is_company_staff ? 'FİRMA PERSONELİ' : 'KADROLU PERSONEL'}</span>
                                                    </div>
                                                        {!player.health_certificate_at ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex items-center gap-2 text-rose-600">
                                                                    <AlertCircle className="h-3 w-3" />
                                                                    <span className="text-[8px] font-black tracking-widest uppercase">SAĞLIK RAPORU EKSİK</span>
                                                                </div>
                                                                {can.update && (
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="sm" 
                                                                        className="h-5 px-1.5 text-[7px] font-black bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-md transition-all"
                                                                        onClick={() => handleToggleHealth(player.id)}
                                                                    >
                                                                        RAPORU VAR
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex items-center gap-2 text-emerald-600">
                                                                    <CheckCircle className="h-3 w-3" />
                                                                    <span className="text-[8px] font-black tracking-widest uppercase leading-none">SAĞLIK RAPORU ONAYLI</span>
                                                                </div>
                                                                {can.update && (
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="sm" 
                                                                        className="h-5 px-1.5 text-[7px] font-black bg-emerald-50 text-emerald-600 hover:bg-rose-600 hover:text-white rounded-md transition-all opacity-0 group-hover:opacity-100 ml-auto"
                                                                        onClick={() => handleToggleHealth(player.id)}
                                                                    >
                                                                        İPTAL ET
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        )}
                                                </div>
                                            </TableCell>
                                            {can.update && (
                                                <TableCell className="px-8 py-6 text-right">
                                                    <Button 
                                                        size="icon" 
                                                        variant="ghost" 
                                                        className="h-11 w-11 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all group-hover:opacity-100 opacity-0 active:scale-90"
                                                        onClick={() => handleRemovePlayer(player.id)}
                                                    >
                                                        <Trash2 className="h-6 w-6" />
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                    {(!team.players || team.players.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={can.update ? 4 : 3} className="py-24 text-center">
                                                <div className="h-24 w-24 rounded-[2rem] bg-neutral-50 dark:bg-neutral-800/50 flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-neutral-100">
                                                    <Users className="h-12 w-12 text-neutral-200" />
                                                </div>
                                                <p className="text-[11px] font-black text-neutral-300 uppercase tracking-[0.3em]">TAKIM KADROSU HENÜZ HAZIR DEĞİL</p>
                                                {can.update && <p className="text-[10px] font-bold text-neutral-400 uppercase mt-4">KADROYA OYUNCU EKLEYEREK BAŞLAYIN.</p>}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

function StatItem({ label, current, max, min }: { label: string; current: number; max: number; min?: number }) {
    const isError = current > max || (min !== undefined && current < min);
    const progress = Math.min((current/max)*100, 100);
    
    return (
        <div className="space-y-2 px-1">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{label}</span>
                <div className="flex items-baseline gap-1">
                    <span className={`text-sm font-black ${isError ? 'text-rose-600' : progress === 100 && !min ? 'text-amber-500' : 'text-neutral-900'}`}>{current}</span>
                    <span className="text-[9px] font-bold text-neutral-300">/ {max}</span>
                </div>
            </div>
            <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden shadow-inner ring-1 ring-neutral-50 inset">
                <div 
                    className={`h-full transition-all duration-700 ease-out shadow-sm ${isError ? 'bg-rose-500 shadow-rose-200' : progress === 100 ? 'bg-amber-400' : 'bg-emerald-500 shadow-emerald-200'}`} 
                    style={{ width: `${progress}%` }}
                />
            </div>
            {min !== undefined && current < min && (
                <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="h-2 w-2" /> EN AZ {min} OYUNCU GEREKLİ
                </p>
            )}
        </div>
    );
}
