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
    Timer,
    Settings,
    MapPin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Field {
    id: number;
    name: string;
    location: string | null;
}

interface Player {
    id: number;
    first_name: string;
    last_name: string;
    goals_count?: number;
    unit?: { name: string };
    teams?: { name: string }[];
}

interface Game {
    id: number;
    home_team_id: number;
    away_team_id: number;
    home_team: { id: number; name: string; unit: { name: string } };
    away_team: { id: number; name: string; unit: { name: string } };
    home_score: number | null;
    away_score: number | null;
    status: 'scheduled' | 'playing' | 'completed';
    scheduled_at: string;
    started_at: string | null;
    round?: string;
    has_penalties?: boolean;
    home_penalty_score?: number;
    away_penalty_score?: number;
    field?: Field | null;
}

interface Standing {
    id: number;
    team_id: number;
    team: { id: number; name: string; unit: { name: string } };
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
    champion_id?: number | null;
    champion?: { id: number; name: string; unit: { name: string } };
    teams: { id: number; name: string; unit: { name: string } }[];
    groups: Group[];
    games: Game[];
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
}

interface Props {
    tournament: Tournament;
    teamStats: { total: number; approved: number; pending: number; rejected: number };
    isGroupStageCompleted: boolean;
    stats: {
        topScorers: Player[];
        fairPlay: {
            team: { id: number; name: string; unit: { name: string } };
            yellow_cards: number;
            red_cards: number;
            points: number;
        }[];
    };
    fields: Field[];
}

export default function Show({ tournament, teamStats, isGroupStageCompleted, stats, fields }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('groups');
    
    const { data: fieldData, setData: setFieldData, post: postField, processing: fieldProcessing } = useForm({
        field_id: '',
    });
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const getMatchMinute = (game: Game) => {
        if (!game.started_at) return 1;
        const start = new Date(game.started_at);
        const diff = Math.floor((currentTime.getTime() - start.getTime()) / 60000);
        return Math.min(90, Math.max(1, diff + 1));
    };

    const isCommittee = auth.user?.role === 'committee' || auth.user?.role === 'super_admin';

    const { data: drawData, setData: setDrawData, post: postDraw, processing: drawProcessing } = useForm({
        group_count: 4,
        start_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        start_time: '18:00',
        match_duration: 50,
        buffer_time: 10,
    });

    const { data: knockoutData, setData: setKnockoutData, post: startKnockout, processing: knockoutProcessing } = useForm({
        round_name: tournament.groups.length * 2 > 4 ? 'quarter' : 'semi',
        advance_count: 2,
        pairing_type: 'cross',
    });

    const settingsForm = useForm({
        settings: {
            max_roster_size: tournament.settings.max_roster_size,
            min_roster_size: tournament.settings.min_roster_size,
            max_licensed_players: tournament.settings.max_licensed_players,
            max_company_players: tournament.settings.max_company_players,
            max_licensed_on_pitch: tournament.settings.max_licensed_on_pitch,
            max_company_on_pitch: tournament.settings.max_company_on_pitch,
            yellow_card_limit: tournament.settings.yellow_card_limit,
            substitution_limit: tournament.settings.substitution_limit,
            total_players_on_pitch: tournament.settings.total_players_on_pitch,
            min_players_on_pitch: tournament.settings.min_players_on_pitch,
        }
    });

    const handleSettingsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        settingsForm.post(route('tournaments.update-settings', tournament.id), {
            preserveScroll: true,
            onSuccess: () => {
                // Success message is handled by flash messages
            }
        });
    };

    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isDrawConfirmModalOpen, setIsDrawConfirmModalOpen] = useState(false);
    const [isAdvanceConfirmModalOpen, setIsAdvanceConfirmModalOpen] = useState(false);
    const [isThirdPlaceConfirmModalOpen, setIsThirdPlaceConfirmModalOpen] = useState(false);
    const [isCompleteConfirmModalOpen, setIsCompleteConfirmModalOpen] = useState(false);

    const advanceForm = useForm({
        current_round: '',
        next_round: '',
    });

    const thirdPlaceForm = useForm({});

    const resultForm = useForm({
        home_score: 0,
        away_score: 0,
        status: 'scheduled',
        scheduled_at: '',
    });

    const resetForm = useForm({
        password: '',
    });

    const handleCompleteSubmit = () => {
        router.post(route('tournaments.complete', tournament.id), {}, {
            onSuccess: () => setIsCompleteConfirmModalOpen(false)
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Turnuvalar', href: '/tournaments' },
        { title: tournament.name, href: `/tournaments/${tournament.id}` },
    ];

    const handleDrawClick = (e: React.FormEvent) => {
        e.preventDefault();
        setIsDrawConfirmModalOpen(true);
    };

    const handleDrawSubmit = () => {
        postDraw(route('tournaments.draw', tournament.id), {
            onSuccess: () => setIsDrawConfirmModalOpen(false)
        });
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

    const openFieldModal = (game: Game) => {
        setSelectedGame(game);
        setFieldData('field_id', game.field?.id?.toString() || '');
        setIsFieldModalOpen(true);
    };

    const handleFieldSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGame) return;

        postField(route('games.assign-field', selectedGame.id), {
            onSuccess: () => {
                setIsFieldModalOpen(false);
                setSelectedGame(null);
            },
        });
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

    const handleAdvance = (current: string, next: string) => {
        advanceForm.setData({ current_round: current, next_round: next });
        setIsAdvanceConfirmModalOpen(true);
    };

    const handleAdvanceSubmit = () => {
        advanceForm.post(route('tournaments.advance-round', tournament.id), {
            onSuccess: () => setIsAdvanceConfirmModalOpen(false)
        });
    };

    const handleThirdPlace = () => {
        setIsThirdPlaceConfirmModalOpen(true);
    };

    const handleThirdPlaceSubmit = () => {
        thirdPlaceForm.post(route('tournaments.third-place', tournament.id), {
             onSuccess: () => setIsThirdPlaceConfirmModalOpen(false)
        });
    };

    const handleReset = (e: React.FormEvent) => {
        e.preventDefault();
        resetForm.post(route('tournaments.reset', tournament.id), {
            onSuccess: () => {
                setIsResetModalOpen(false);
                resetForm.reset();
            },
        });
    };

    // Knockout progression helpers
    const knockoutGames = tournament.games.filter(g => g.round && g.round !== 'group');
    const roundsInOrder = ['round_16', 'quarter', 'semi', 'final'];

    const latestRound = roundsInOrder.reverse().find(r => knockoutGames.some(g => g.round === r)) || 'none';
    roundsInOrder.reverse(); // reset order

    const isLatestRoundCompleted = latestRound !== 'none' &&
        knockoutGames.filter(g => g.round === latestRound).every(g => g.status === 'completed');

    const nextRoundMap: Record<string, string> = {
        'round_16': 'quarter',
        'quarter': 'semi',
        'semi': 'final'
    };
    const nextRoundName = nextRoundMap[latestRound];

    const isFinalCompleted = knockoutGames.some(g => g.round === 'final' && g.status === 'completed');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tournament.name} />

            <div className="min-h-screen bg-background text-foreground p-3 md:p-8 font-sans selection:bg-blue-600 selection:text-white">
                {/* Header Section */}
                <div className="relative mb-8 p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-card border border-border shadow-sm overflow-hidden dark:bg-blue-950/10 dark:border-white/5">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                        <Trophy className="h-64 w-64" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge variant="outline" className="border-blue-100 text-blue-600 font-black uppercase tracking-[0.2em] py-1.5 px-4 rounded-full bg-blue-50/50 backdrop-blur-sm dark:border-blue-500/30 dark:text-blue-400 dark:bg-blue-500/5">
                                    {tournament.status === 'draft' ? 'KAYIT AŞAMASI' :
                                        tournament.status === 'active' ? 'TURNUVA DEVAM EDİYOR' :
                                            tournament.status === 'registration' ? 'KAYITLAR AÇIK' : 'TAMAMLANDI'}
                                </Badge>

                                {tournament.groups.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <a href={route('reports.standings', tournament.id)} target="_blank">
                                            <Button variant="outline" size="sm" className="h-8 rounded-full border-emerald-200 text-emerald-600 hover:bg-emerald-50 text-[9px] font-black uppercase tracking-widest gap-2 bg-emerald-50/30">
                                                <Edit3 className="h-3 w-3" /> PUAN DURUMU PDF
                                            </Button>
                                        </a>
                                        <a href={route('reports.fixture', tournament.id)} target="_blank">
                                            <Button variant="outline" size="sm" className="h-8 rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 text-[9px] font-black uppercase tracking-widest gap-2 bg-blue-50/30">
                                                <Calendar className="h-3 w-3" /> FİKSTÜR PDF
                                            </Button>
                                        </a>
                                    </div>
                                )}
                            </div>
                            <h1 className="text-2xl md:text-6xl font-black uppercase tracking-tighter leading-tight md:leading-none">{tournament.name}</h1>
                            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                    <span className="text-xs font-bold uppercase tracking-widest">{tournament.year} SEZONU</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-blue-600" />
                                    <span className="text-xs font-bold uppercase tracking-widest">
                                        {teamStats?.approved ?? 0} ONAYLI TAKIM
                                        {isCommittee && (teamStats?.pending ?? 0) > 0 && <span className="ml-2 text-amber-500">({teamStats.pending} BEKLEMEDE)</span>}
                                        {isCommittee && (teamStats?.rejected ?? 0) > 0 && <span className="ml-2 text-rose-500">({teamStats.rejected} RED)</span>}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {isCommittee && (
                            <div className="p-6 md:p-8 bg-slate-50 border border-slate-200 rounded-[2rem] md:rounded-[3rem] flex flex-col gap-6 w-full md:min-w-[350px] dark:bg-white/[0.03] dark:border-white/10 dark:backdrop-blur-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Yönetim Paneli</p>
                                    {tournament.status === 'active' && isFinalCompleted && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsCompleteConfirmModalOpen(true)}
                                            className="h-7 px-3 text-[9px] font-black text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-100 uppercase tracking-widest"
                                        >
                                            <Trophy className="mr-1.5 h-3 w-3" /> Turnuvayı Tamamla
                                        </Button>
                                    )}
                                </div>

                                {tournament.groups.length === 0 ? (
                                    <>
                                        <p className="text-[10px] font-medium text-slate-500 mb-2">Grup maçları bittiyse veya manuel kura çekmek istiyorsanız aşağıdaki ayarları kullanın.</p>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Grup Sayısı</Label>
                                                <Input
                                                    type="number"
                                                    className="h-12 bg-white dark:bg-black/20 border-slate-200 dark:border-white/10 rounded-2xl font-bold"
                                                    value={drawData.group_count}
                                                    onChange={e => setDrawData('group_count', parseInt(e.target.value))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Başlangıç Tarihi</Label>
                                                <Input
                                                    type="date"
                                                    className="h-12 bg-white dark:bg-black/20 border-slate-200 dark:border-white/10 rounded-2xl font-bold"
                                                    value={drawData.start_date}
                                                    onChange={e => setDrawData('start_date', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Maç Saati</Label>
                                                <Input
                                                    type="time"
                                                    className="h-12 bg-white dark:bg-black/20 border-slate-200 dark:border-white/10 rounded-2xl font-bold"
                                                    value={drawData.start_time}
                                                    onChange={e => setDrawData('start_time', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Süre (Dk)</Label>
                                                <Input
                                                    type="number"
                                                    className="h-12 bg-white dark:bg-black/20 border-slate-200 dark:border-white/10 rounded-2xl font-bold"
                                                    value={drawData.match_duration}
                                                    onChange={e => setDrawData('match_duration', parseInt(e.target.value))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ara (Dk)</Label>
                                                <Input
                                                    type="number"
                                                    className="h-12 bg-white dark:bg-black/20 border-slate-200 dark:border-white/10 rounded-2xl font-bold"
                                                    value={drawData.buffer_time}
                                                    onChange={e => setDrawData('buffer_time', parseInt(e.target.value))}
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleDrawClick}
                                            disabled={drawProcessing || tournament.teams.length === 0}
                                            className="h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black uppercase tracking-widest text-xs rounded-3xl shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                                        >
                                            {tournament.teams.length === 0 ? 'TAKIM BEKLENİYOR...' : 'KURA ÇEK VE BAŞLAT'}
                                        </Button>
                                        {tournament.teams.length === 0 && (
                                            <div className="p-4 bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                                                <div className="h-8 w-8 bg-rose-100 dark:bg-rose-500/20 rounded-xl flex items-center justify-center shrink-0">
                                                    <AlertCircle className="h-4 w-4 text-rose-600" />
                                                </div>
                                                <p className="text-[10px] text-rose-700 dark:text-rose-400 font-bold uppercase tracking-tight leading-tight">
                                                    Kura çekebilmek için en az bir takım onaylanmış olmalıdır.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                            <CheckCircle2 className="h-3 w-3" /> FİKSTÜR OLUŞTURULDU
                                        </p>
                                        <Button
                                            onClick={() => setIsResetModalOpen(true)}
                                            variant="outline"
                                            className="w-full h-12 border-rose-200 text-rose-600 hover:bg-rose-50 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                                        >
                                            <X className="mr-2 h-4 w-4" /> TURNUVAYI SIFIRLA
                                        </Button>
                                        <p className="text-[9px] text-muted-foreground font-medium leading-relaxed italic border-l-2 border-blue-500/30 pl-3 py-1">
                                            Turnuva başladıktan sonra kura çekme ekranı kilitlenir. Fikstürü değiştirmek veya yeniden kura çekmek istiyorsanız turnuvayı sıfırlayabilirsiniz.
                                        </p>
                                    </div>
                                )}

                                {tournament.groups.length > 0 && knockoutGames.length === 0 && (
                                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
                                        <div className="flex items-center gap-2">
                                            <Trophy className="h-4 w-4 text-emerald-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">ELEME TURLARI SİHİRBAZI</span>
                                        </div>

                                        {!isGroupStageCompleted ? (
                                            <div className="p-6 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 rounded-3xl space-y-3">
                                                <div className="flex items-center gap-3 text-amber-600">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">KURA ÇEKİMİ KİLİTLİ</span>
                                                </div>
                                                <p className="text-[10px] text-amber-700/70 font-bold uppercase tracking-tight leading-relaxed">
                                                    Tüm grup maçları tamamlanmadan eleme turları kurası çekilemez. Lütfen devam eden maçları (Fikstür sekmesinden) tamamlayın.
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tur Seviyesi</Label>
                                                        <select
                                                            className="w-full h-12 px-4 bg-white dark:bg-black/20 border-slate-200 dark:border-white/10 rounded-2xl font-bold text-sm outline-none"
                                                            value={knockoutData.round_name}
                                                            onChange={e => setKnockoutData('round_name', e.target.value)}
                                                        >
                                                            <option value="round_16">Son 16</option>
                                                            <option value="quarter">Çeyrek Final</option>
                                                            <option value="semi">Yarı Final</option>
                                                            <option value="final">Final</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gruptan Çıkan</Label>
                                                        <select
                                                            className="w-full h-12 px-4 bg-white dark:bg-black/20 border-slate-200 dark:border-white/10 rounded-2xl font-bold text-sm outline-none"
                                                            value={knockoutData.advance_count}
                                                            onChange={e => setKnockoutData('advance_count', parseInt(e.target.value))}
                                                        >
                                                            <option value={1}>Her Gruptan 1.</option>
                                                            <option value={2}>İlk 2 Takım</option>
                                                            <option value={4}>İlk 4 Takım</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2 col-span-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Eşleşme Mantığı</Label>
                                                        <select
                                                            className="w-full h-12 px-4 bg-white dark:bg-black/20 border-slate-200 dark:border-white/10 rounded-2xl font-bold text-sm outline-none"
                                                            value={knockoutData.pairing_type}
                                                            onChange={e => setKnockoutData('pairing_type', e.target.value)}
                                                        >
                                                            <option value="cross">Çapraz Eşleşme (1. vs 2.)</option>
                                                            <option value="random">Rastgele Eşleşme</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <Button
                                                    onClick={() => startKnockout(route('tournaments.start-knockout', tournament.id))}
                                                    disabled={knockoutProcessing}
                                                    className="w-full h-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-50 transition-all border-dashed"
                                                >
                                                    ELEME TURLARINI BAŞLAT
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                )}

                                {knockoutGames.length > 0 && (
                                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 space-y-4">
                                        {isLatestRoundCompleted && nextRoundName && (
                                            <div className="animate-in zoom-in duration-500">
                                                <Button
                                                    onClick={() => handleAdvance(latestRound, nextRoundName)}
                                                    disabled={advanceForm.processing}
                                                    className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                    {nextRoundName === 'semi' ? 'YARI FİNALLERİ OLUŞTUR' : 'FİNALİ OLUŞTUR'}
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}

                                        {/* 3rd Place Match Logic */}
                                        {latestRound === 'semi' && isLatestRoundCompleted && !knockoutGames.some(g => g.round === 'third_place') && (
                                            <div className="animate-in slide-in-from-right duration-500">
                                                <Button
                                                    onClick={handleThirdPlace}
                                                    disabled={thirdPlaceForm.processing}
                                                    className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 border border-amber-400/50 outline outline-offset-2 outline-amber-500/20"
                                                >
                                                    <Medal className="h-4 w-4" />
                                                    3.LÜK MAÇINI OLUŞTUR
                                                </Button>
                                            </div>
                                        )}

                                        {(!isLatestRoundCompleted || (!nextRoundName && latestRound !== 'final')) && (
                                            <p className="text-[9px] text-center text-blue-600 font-bold uppercase tracking-widest bg-blue-50 dark:bg-blue-500/5 py-3 rounded-xl">
                                                {latestRound.toUpperCase()} TURU MAÇLARI DEVAM EDİYOR
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {tournament.champion && (
                    <div className="mb-12 animate-in fade-in slide-in-from-top duration-700">
                        <Card className="border-none bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 dark:from-amber-600 dark:via-amber-700 dark:to-amber-800 text-white shadow-[0_20px_50px_rgba(245,158,11,0.3)] rounded-[3rem] overflow-hidden relative">
                            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            <div className="absolute -right-20 -bottom-20 opacity-20 pointer-events-none">
                                <Trophy className="h-96 w-96 text-white" />
                            </div>

                            <CardContent className="p-8 md:p-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex items-center gap-8">
                                    <div className="h-24 w-24 md:h-32 md:w-32 bg-white/20 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white/30 shrink-0">
                                        <Trophy className="h-12 w-12 md:h-16 md:w-16 text-white animate-bounce" />
                                    </div>
                                    <div>
                                        <Badge className="bg-white/20 text-white border-none font-black text-[10px] px-4 py-1.5 rounded-full uppercase tracking-[0.3em] mb-3">RESMİ ŞAMPİYON</Badge>
                                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-2">{tournament.champion.name}</h2>
                                        <p className="font-black uppercase tracking-widest text-xs opacity-80">{tournament.champion.unit.name} • {tournament.year} ZİRVESİ</p>
                                    </div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md px-10 py-6 rounded-[2rem] border border-white/20 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1 leading-none">ZAFER ANISI</p>
                                    <p className="text-3xl font-black italic tracking-tighter whitespace-nowrap">#ŞAMPİYON</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mb-8">
                        <TabsList className="bg-card border border-border p-1 rounded-full h-auto w-max inline-flex">
                            <TabsTrigger value="groups" className="px-5 md:px-6 py-2 md:py-2.5 rounded-full data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all">Puan Durumu</TabsTrigger>
                            <TabsTrigger value="fixtures" className="px-5 md:px-6 py-2 md:py-2.5 rounded-full data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all">Fikstür</TabsTrigger>
                            <TabsTrigger value="knockout" className="px-5 md:px-6 py-2 md:py-2.5 rounded-full data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all">Eleme Turları</TabsTrigger>
                            <TabsTrigger value="stats" className="px-5 md:px-6 py-2 md:py-2.5 rounded-full data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all">İstatistikler</TabsTrigger>
                            <TabsTrigger value="teams" className="px-5 md:px-6 py-2 md:py-2.5 rounded-full data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all">Takımlar</TabsTrigger>
                            {isCommittee && (
                                <TabsTrigger value="settings" className="px-5 md:px-6 py-2 md:py-2.5 rounded-full data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all">Kurallar</TabsTrigger>
                            )}
                        </TabsList>
                    </div>

                    <TabsContent value="groups" className="space-y-8 mt-0 border-none outline-none">
                        {tournament.groups.length > 0 ? (
                            tournament.groups.map(group => (
                                <Card key={group.id} className="border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl overflow-hidden rounded-[2.5rem]">
                                    <CardHeader className="bg-neutral-50/50 dark:bg-black/20 border-b border-neutral-100 dark:border-white/5 p-8">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <CardTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                                    <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                                                    {group.name}
                                                </CardTitle>
                                                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">GRUP AŞAMASI SIRALAMASI</CardDescription>
                                            </div>
                                            <Badge className="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500 border-none font-black px-4 py-1.5 rounded-full text-[9px] tracking-widest uppercase">
                                                {group.standings?.length || 0} TAKIM
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader className="bg-neutral-50/50 dark:bg-black/10">
                                                    <TableRow className="hover:bg-transparent border-none">
                                                        <TableHead className="w-16 font-black text-[10px] uppercase tracking-widest text-center">#</TableHead>
                                                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Takım</TableHead>
                                                        <TableHead className="w-16 font-black text-[10px] uppercase tracking-widest text-center">OM</TableHead>
                                                        <TableHead className="w-16 font-black text-[10px] uppercase tracking-widest text-center">G</TableHead>
                                                        <TableHead className="w-16 font-black text-[10px] uppercase tracking-widest text-center">B</TableHead>
                                                        <TableHead className="w-16 font-black text-[10px] uppercase tracking-widest text-center">M</TableHead>
                                                        <TableHead className="w-16 font-black text-[10px] uppercase tracking-widest text-center">AV</TableHead>
                                                        <TableHead className="w-20 font-black text-blue-600 text-[10px] uppercase tracking-widest text-center">Puan</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {group.standings?.sort((a, b) => (b.points - a.points) || ((b.goals_for - b.goals_against) - (a.goals_for - a.goals_against))).map((s, idx) => (
                                                        <TableRow key={idx} className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                                                            <TableCell className="text-center">
                                                                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-black ${idx < 2 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500' : 'text-slate-400'}`}>
                                                                    {idx + 1}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="py-5">
                                                                <Link href={route('teams.show', s.team.id)} className="flex items-center gap-4 hover:translate-x-1 transition-transform">
                                                                    <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center font-black text-xs text-accent-foreground shadow-sm">
                                                                        {s.team.name.substring(0, 2).toUpperCase()}
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-black text-sm text-slate-900 dark:text-white leading-none mb-1">{s.team.name}</span>
                                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.team.unit?.name}</span>
                                                                    </div>
                                                                </Link>
                                                            </TableCell>
                                                            <TableCell className="text-center font-bold text-slate-500">{s.played}</TableCell>
                                                            <TableCell className="text-center font-bold text-emerald-600">{s.won}</TableCell>
                                                            <TableCell className="text-center font-bold text-slate-500">{s.drawn}</TableCell>
                                                            <TableCell className="text-center font-bold text-rose-600">{s.lost}</TableCell>
                                                            <TableCell className="text-center font-bold text-slate-500">{s.goals_for - s.goals_against}</TableCell>
                                                            <TableCell className="text-center">
                                                                <span className="bg-blue-600 text-white px-3 py-1.5 rounded-xl font-black text-xs shadow-lg shadow-blue-500/30">{s.points}</span>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="py-24 rounded-[3rem] border border-dashed border-border flex flex-col items-center justify-center text-center">
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-muted-foreground/40 mb-2">PUAN DURUMU HENÜZ HAZIR DEĞİL</h3>
                                <p className="max-w-md text-muted-foreground/50 text-xs font-bold uppercase tracking-widest">KURAYI ÇEKTİĞİNİZDE GRUPLAR VE SIRALAMALAR BURADA OLUŞACAKTIR.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="fixtures" className="space-y-8 mt-0 border-none outline-none">
                        {tournament.groups.length > 0 || knockoutGames.length > 0 ? (
                            <div className="space-y-12 pb-20">
                                {tournament.groups.map(group => (
                                    <div key={group.id} className="space-y-6">
                                        <div className="flex items-center gap-4 px-4">
                                            <div className="h-10 w-10 bg-blue-50 dark:bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
                                                <Calendar className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <h3 className="text-xl font-black uppercase tracking-tighter">{group.name} FİKSTÜRÜ</h3>
                                        </div>

                                        <div className="grid gap-4">
                                            {group.games.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()).map(game => (
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
                                                            <div className="flex items-center gap-6 justify-end">
                                                                <div className="text-right">
                                                                    <p className="font-black uppercase text-sm tracking-tight group-hover:text-blue-500 transition-colors line-clamp-1">{game.home_team?.name || 'BELİRLENMEDİ'}</p>
                                                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">{game.home_team?.unit?.name || '---'}</p>
                                                                </div>
                                                                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center font-black text-xs text-muted-foreground group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner shrink-0">
                                                                    {(game.home_team?.name || '??').substring(0, 2).toUpperCase()}
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col items-center gap-3">
                                                                <Link href={route('games.show', game.id)} className="w-full">
                                                                    <div className="flex items-center justify-center gap-4 px-8 py-3 bg-background rounded-2xl border border-border shadow-sm hover:border-blue-300 dark:hover:border-blue-500 transition-all active:scale-95 group/score relative mx-auto w-fit">
                                                                        {game.status === 'scheduled' ? (
                                                                            <span className="text-lg font-black">{format(new Date(game.scheduled_at), 'HH:mm')}</span>
                                                                        ) : (
                                                                            <div className="flex flex-col items-center gap-1">
                                                                                {game.status === 'playing' && (
                                                                                    <span className="text-[8px] font-black text-emerald-500 animate-pulse tracking-[0.2em] absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                                                                        ● {getMatchMinute(game)}' CANLI
                                                                                    </span>
                                                                                )}
                                                                                <div className="flex items-center justify-center gap-4">
                                                                                    <span className="text-3xl font-black tabular-nums">{game.home_score ?? 0}</span>
                                                                                    <span className="text-muted-foreground text-sm font-black">-</span>
                                                                                    <span className="text-3xl font-black tabular-nums">{game.away_score ?? 0}</span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </Link>
                                                                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Clock className="h-3 w-3 text-blue-600" />
                                                                        {format(new Date(game.scheduled_at), 'd MMMM yyyy', { locale: tr })}
                                                                    </div>
                                                                    {game.field && (
                                                                        <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-white/10 pl-3">
                                                                            <MapPin className="h-3 w-3 text-emerald-500" />
                                                                            {game.field.name}
                                                                        </div>
                                                                    )}
                                                                    {isCommittee && (
                                                                        <button 
                                                                            type="button"
                                                                            onClick={() => openFieldModal(game)}
                                                                            className="text-[9px] text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-600/10 px-2 py-0.5 rounded-md transition-colors"
                                                                        >
                                                                            {game.field ? 'DEĞİŞTİR' : '+ SAHA SEÇ'}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-6 justify-start">
                                                                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center font-black text-xs text-muted-foreground group-hover:bg-rose-600 group-hover:text-white transition-all shadow-inner shrink-0">
                                                                    {(game.away_team?.name || '??').substring(0, 2).toUpperCase()}
                                                                </div>
                                                                <div className="text-left">
                                                                    <p className="font-black uppercase text-sm tracking-tight group-hover:text-rose-500 transition-colors line-clamp-1">{game.away_team?.name || 'BELİRLENMEDİ'}</p>
                                                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">{game.away_team?.unit?.name || '---'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {knockoutGames.length > 0 && (
                                    <div className="space-y-6 pt-12 border-t border-slate-100 dark:border-white/5">
                                        <div className="flex items-center gap-4 px-4">
                                            <div className="h-10 w-10 bg-rose-50 dark:bg-rose-600/10 rounded-xl flex items-center justify-center border border-rose-100 dark:border-rose-500/20">
                                                <Trophy className="h-5 w-5 text-rose-600" />
                                            </div>
                                            <h3 className="text-xl font-black uppercase tracking-tighter">ELEME TURU MAÇLARI</h3>
                                        </div>
                                        <div className="grid gap-4">
                                            {knockoutGames.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()).map(game => (
                                                <Card key={game.id} className="bg-card border-border rounded-[2rem] hover:bg-muted/50 transition-all group overflow-hidden shadow-sm relative">
                                                    <CardContent className="p-6">
                                                        <Badge className="absolute top-4 left-4 bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-500 border-none font-black text-[8px] uppercase tracking-widest">
                                                            {game.round === 'quarter' ? 'ÇEYREK FİNAL' : game.round === 'semi' ? 'YARI FİNAL' : game.round === 'third_place' ? '3.LÜK MAÇI' : 'FİNAL'}
                                                        </Badge>
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
                                                            <div className="flex items-center gap-6 justify-end">
                                                                <div className="text-right">
                                                                    <p className="font-black uppercase text-sm tracking-tight group-hover:text-blue-500 transition-colors line-clamp-1">{game.home_team?.name || 'BELİRLENMEDİ'}</p>
                                                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">{game.home_team?.unit?.name || '---'}</p>
                                                                </div>
                                                                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center font-black text-xs text-muted-foreground group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner shrink-0">
                                                                    {(game.home_team?.name || '??').substring(0, 2).toUpperCase()}
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col items-center gap-3">
                                                                <Link href={route('games.show', game.id)} className="w-full">
                                                                    <div className="flex items-center justify-center gap-4 px-8 py-3 bg-background rounded-2xl border border-border shadow-sm hover:border-blue-300 dark:hover:border-blue-500 transition-all active:scale-95 group/score relative mx-auto w-fit">
                                                                        {game.status === 'scheduled' ? (
                                                                            <span className="text-lg font-black">{format(new Date(game.scheduled_at), 'HH:mm')}</span>
                                                                        ) : (
                                                                            <div className="flex flex-col items-center gap-1">
                                                                                <div className="flex items-center justify-center gap-4">
                                                                                    <span className="text-3xl font-black tabular-nums">{game.home_score ?? 0}</span>
                                                                                    <span className="text-muted-foreground text-sm font-black">-</span>
                                                                                    <span className="text-3xl font-black tabular-nums">{game.away_score ?? 0}</span>
                                                                                </div>
                                                                                {game.has_penalties && (
                                                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                                                        P: {game.home_penalty_score} - {game.away_penalty_score}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </Link>
                                                                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Clock className="h-3 w-3 text-rose-600" />
                                                                        {format(new Date(game.scheduled_at), 'd MMMM yyyy', { locale: tr })}
                                                                    </div>
                                                                    {game.field && (
                                                                        <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-white/10 pl-3">
                                                                            <MapPin className="h-3 w-3 text-emerald-500" />
                                                                            {game.field.name}
                                                                        </div>
                                                                    )}
                                                                    {isCommittee && (
                                                                        <button 
                                                                            type="button"
                                                                            onClick={() => openFieldModal(game)}
                                                                            className="text-[9px] text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-600/10 px-2 py-0.5 rounded-md transition-colors"
                                                                        >
                                                                            {game.field ? 'DEĞİŞTİR' : '+ SAHA SEÇ'}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-6 justify-start">
                                                                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center font-black text-xs text-muted-foreground group-hover:bg-rose-600 group-hover:text-white transition-all shadow-inner shrink-0">
                                                                    {(game.away_team?.name || '??').substring(0, 2).toUpperCase()}
                                                                </div>
                                                                <div className="text-left">
                                                                    <p className="font-black uppercase text-sm tracking-tight group-hover:text-rose-500 transition-colors line-clamp-1">{game.away_team?.name || 'BELİRLENMEDİ'}</p>
                                                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">{game.away_team?.unit?.name || '---'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-32 rounded-[3rem] border border-dashed border-border bg-card flex flex-col items-center justify-center text-center">
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-muted-foreground/30 mb-2">FİKSTÜR ANALİZ EDİLİYOR</h3>
                                <p className="max-w-md text-muted-foreground/40 text-xs font-bold uppercase tracking-widest leading-relaxed">KURA ÇEKİMİ YAPILDIĞINDA TÜM MAÇ PROGRAMI BURADA LİSTELENECEKTİR.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="knockout" className="space-y-8 mt-0 border-none outline-none">
                        <Card className="border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[3rem] overflow-hidden">
                            <div className="p-12">
                                <div className="flex flex-col items-center justify-center mb-12 text-center px-4">
                                    <Badge className="bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500 border-none font-black mb-4 uppercase tracking-widest text-[9px]">GÖRSEL MAÇ AĞACI</Badge>
                                    <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">ELEME TURLARI</h3>
                                    <p className="text-slate-500 mt-2 font-medium text-xs md:text-base px-6">Şampiyonluğa giden yol burada şekilleniyor.</p>
                                </div>

                                <div className="flex flex-nowrap overflow-x-auto pb-12 gap-12 md:gap-24 justify-start md:justify-center min-h-[500px] items-center -mx-6 px-6">
                                    {['round_16', 'quarter', 'semi', 'final', 'third_place'].map((round) => {
                                        const matches = (tournament.games || []).filter(g => g.round === round);
                                        if (matches.length === 0) return null;

                                        return (
                                            <div key={round} className="flex flex-col gap-12 relative">
                                                <div className="text-center mb-4">
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full ${round === 'third_place' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10'}`}>
                                                        {round === 'round_16' ? 'SON 16' : round === 'quarter' ? 'ÇEYREK FİNAL' : round === 'semi' ? 'YARI FİNAL' : round === 'third_place' ? '3.LÜK MAÇI' : 'FİNAL'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-12">
                                                    {matches.map((m) => (
                                                        <div key={m.id} className="relative group">
                                                            {isCommittee && (
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        openResultModal(m);
                                                                    }}
                                                                    className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-white dark:bg-neutral-800 shadow-xl border border-border hover:bg-blue-600 hover:text-white transition-all z-20"
                                                                >
                                                                    <Edit3 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            )}
                                                            <Link href={route('games.show', m.id)}>
                                                                <div className="w-[260px] md:w-[280px] bg-white dark:bg-neutral-800 rounded-2xl md:rounded-3xl shadow-xl border-2 border-slate-100 dark:border-white/5 group-hover:border-blue-500 transition-all p-3 md:p-4 z-10 relative">
                                                                    <div className="space-y-4">
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-black/20 flex items-center justify-center text-[10px] font-black">{(m.home_team?.name || '??').substring(0, 2).toUpperCase()}</div>
                                                                                <span className="font-bold text-sm truncate w-32">{m.home_team?.name || 'BELİRLENMEDİ'}</span>
                                                                            </div>
                                                                            <span className={`text-xl font-black tabular-nums ${m.status === 'completed' && (m.home_score ?? 0) > (m.away_score ?? 0) ? 'text-blue-600' : 'text-slate-400'}`}>{m.home_score ?? 0}</span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-black/20 flex items-center justify-center text-[10px] font-black">{(m.away_team?.name || '??').substring(0, 2).toUpperCase()}</div>
                                                                                <span className="font-bold text-sm truncate w-32">{m.away_team?.name || 'BELİRLENMEDİ'}</span>
                                                                            </div>
                                                                            <span className={`text-xl font-black tabular-nums ${m.status === 'completed' && (m.away_score ?? 0) > (m.home_score ?? 0) ? 'text-blue-600' : 'text-slate-400'}`}>{m.away_score ?? 0}</span>
                                                                        </div>
                                                                        {m.has_penalties && (
                                                                            <div className="pt-2 border-t border-slate-50 dark:border-white/5 text-center">
                                                                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">PENALTILAR: {m.home_penalty_score} - {m.away_penalty_score}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                            {round !== 'final' && round !== 'third_place' && (
                                                                <div className="absolute top-1/2 -right-24 w-24 h-px border-t-2 border-dashed border-slate-200 dark:border-white/10 -z-10 group-hover:border-blue-400" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {(!tournament.games || tournament.games.filter(g => g.round && g.round !== 'group').length === 0) && (
                                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                                            <Trophy className="h-20 w-20 mb-6 text-slate-200" />
                                            <p className="text-sm font-bold uppercase tracking-widest">Eleme turları henüz başlatılmadı.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="stats" className="space-y-8 mt-0 border-none outline-none">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Gol Krallığı */}
                            <Card className="border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
                                <CardHeader className="p-8 border-b border-neutral-100 dark:border-white/5 bg-amber-500/5">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                            <Trophy className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-black uppercase tracking-tighter">Altın Ayakkabı</CardTitle>
                                            <CardDescription className="text-[10px] uppercase font-black tracking-widest text-amber-600">GOL KRALLIĞI YARIŞI</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableHead className="w-16 text-center font-black text-[9px] uppercase tracking-widest">Sıra</TableHead>
                                                <TableHead className="font-black text-[9px] uppercase tracking-widest">Oyuncu</TableHead>
                                                <TableHead className="text-center font-black text-[9px] uppercase tracking-widest">Gol</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {stats.topScorers.length > 0 ? stats.topScorers.map((player, idx) => (
                                                <TableRow key={player.id} className="group hover:bg-amber-500/5 transition-colors border-b border-slate-50 dark:border-white/5">
                                                    <TableCell className="text-center">
                                                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black ${idx === 0 ? 'bg-amber-500 text-white' : idx === 1 ? 'bg-slate-300 text-slate-700' : idx === 2 ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                            {idx + 1}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <Link href={route('players.show', player.id)} className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-[10px] font-black group-hover:bg-amber-500 group-hover:text-white transition-all">
                                                                {player.first_name[0]}{player.last_name[0]}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-sm uppercase tracking-tight">{player.first_name} {player.last_name}</p>
                                                                <p className="text-[9px] font-bold text-muted-foreground uppercase">{player.unit?.name}</p>
                                                            </div>
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge className="bg-amber-500 text-white border-none font-black text-lg px-3 py-1 rounded-xl tabular-nums shadow-lg shadow-amber-500/20">{player.goals_count}</Badge>
                                                    </TableCell>
                                                </TableRow>
                                            )) : (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="py-12 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">Henüz gol verisi bulunmuyor.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Fair Play Tablosu */}
                            <Card className="border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
                                <CardHeader className="p-8 border-b border-neutral-100 dark:border-white/5 bg-emerald-500/5">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                            <Shield className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-black uppercase tracking-tighter">Fair Play</CardTitle>
                                            <CardDescription className="text-[10px] uppercase font-black tracking-widest text-emerald-600">EN TEMİZ TAKIMLAR (AZ PUAN İYİDİR)</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableHead className="w-16 text-center font-black text-[9px] uppercase tracking-widest">Sıra</TableHead>
                                                <TableHead className="font-black text-[9px] uppercase tracking-widest">Takım</TableHead>
                                                <TableHead className="text-center font-black text-[9px] uppercase tracking-widest">Sarı</TableHead>
                                                <TableHead className="text-center font-black text-[9px] uppercase tracking-widest">Kırmızı</TableHead>
                                                <TableHead className="text-center font-black text-[9px] uppercase tracking-widest">Puan</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {stats.fairPlay.length > 0 ? stats.fairPlay.map((item, idx) => (
                                                <TableRow key={item.team.id} className="group hover:bg-emerald-500/5 transition-colors border-b border-slate-50 dark:border-white/5">
                                                    <TableCell className="text-center">
                                                        <span className="font-black text-xs text-slate-400">{idx + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="flex flex-col">
                                                            <p className="font-black text-sm uppercase tracking-tight">{item.team.name}</p>
                                                            <p className="text-[9px] font-bold text-muted-foreground uppercase">{item.team.unit.name}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className="w-6 h-8 bg-amber-400 rounded-sm inline-block shadow-sm border border-amber-500/20 flex items-center justify-center font-black text-[10px] text-amber-900">{item.yellow_cards}</span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className="w-6 h-8 bg-rose-500 rounded-sm inline-block shadow-sm border border-rose-600/20 flex items-center justify-center font-black text-[10px] text-white">{item.red_cards}</span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className={`${item.points === 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'} font-black px-3 py-1 rounded-lg tabular-nums`}>{item.points}</Badge>
                                                    </TableCell>
                                                </TableRow>
                                            )) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="py-12 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">Henüz kart verisi bulunmuyor.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="teams" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    </TabsContent>

                    {isCommittee && (
                        <TabsContent value="settings" className="mt-0 border-none outline-none">
                            <Card className="border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[3rem] overflow-hidden">
                                <CardHeader className="p-12 border-b border-border bg-slate-50/50 dark:bg-black/20">
                                    <div className="flex items-center gap-6">
                                        <div className="h-16 w-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-blue-500/20">
                                            <Settings className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-3xl font-black uppercase tracking-tighter">Turnuva Kuralları</CardTitle>
                                            <CardDescription className="text-xs font-black uppercase tracking-widest text-blue-600 mt-1">KADRO VE SAHA LİMİTLERİNİ ÖZELLEŞTİRİN</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-12">
                                    <form onSubmit={handleSettingsSubmit} className="space-y-12">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            {/* Kadro Limitleri */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Users className="h-5 w-5 text-slate-400" />
                                                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Kadro Yapısı</h4>
                                                </div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Min. Kadro Sayısı</Label>
                                                        <Input 
                                                            type="number" 
                                                            className="h-14 rounded-2xl font-bold bg-white dark:bg-black/20"
                                                            value={settingsForm.data.settings.min_roster_size}
                                                            onChange={e => settingsForm.setData('settings', { ...settingsForm.data.settings, min_roster_size: parseInt(e.target.value) })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Max. Kadro Sayısı</Label>
                                                        <Input 
                                                            type="number" 
                                                            className="h-14 rounded-2xl font-bold bg-white dark:bg-black/20"
                                                            value={settingsForm.data.settings.max_roster_size}
                                                            onChange={e => settingsForm.setData('settings', { ...settingsForm.data.settings, max_roster_size: parseInt(e.target.value) })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Max. Lisanslı Personel</Label>
                                                        <Input 
                                                            type="number" 
                                                            className="h-14 rounded-2xl font-bold bg-white dark:bg-black/20 border-emerald-100/50"
                                                            value={settingsForm.data.settings.max_licensed_players}
                                                            onChange={e => settingsForm.setData('settings', { ...settingsForm.data.settings, max_licensed_players: parseInt(e.target.value) })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-blue-600">Max. Firma Personeli</Label>
                                                        <Input 
                                                            type="number" 
                                                            className="h-14 rounded-2xl font-bold bg-white dark:bg-black/20 border-blue-100/50"
                                                            value={settingsForm.data.settings.max_company_players}
                                                            onChange={e => settingsForm.setData('settings', { ...settingsForm.data.settings, max_company_players: parseInt(e.target.value) })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Saha Limitleri */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Trophy className="h-5 w-5 text-slate-400" />
                                                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Saha İçi Limitler</h4>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Sahada Max. Lisanslı</Label>
                                                        <Input 
                                                            type="number" 
                                                            className="h-14 rounded-2xl font-bold bg-emerald-500/5 border-emerald-100/50"
                                                            value={settingsForm.data.settings.max_licensed_on_pitch}
                                                            onChange={e => settingsForm.setData('settings', { ...settingsForm.data.settings, max_licensed_on_pitch: parseInt(e.target.value) })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-blue-600">Sahada Max. Firma</Label>
                                                        <Input 
                                                            type="number" 
                                                            className="h-14 rounded-2xl font-bold bg-blue-500/5 border-blue-100/50"
                                                            value={settingsForm.data.settings.max_company_on_pitch}
                                                            onChange={e => settingsForm.setData('settings', { ...settingsForm.data.settings, max_company_on_pitch: parseInt(e.target.value) })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Toplam Oyuncu (Kaleci Dahil)</Label>
                                                        <Input 
                                                            type="number" 
                                                            className="h-14 rounded-2xl font-bold bg-slate-500/5 border-slate-100/50"
                                                            value={settingsForm.data.settings.total_players_on_pitch}
                                                            onChange={e => settingsForm.setData('settings', { ...settingsForm.data.settings, total_players_on_pitch: parseInt(e.target.value) })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-orange-600">Min. Oyuncu Sayısı (Maç Başlaması İçin)</Label>
                                                        <Input 
                                                            type="number" 
                                                            className="h-14 rounded-2xl font-bold bg-orange-500/5 border-orange-100/50"
                                                            value={settingsForm.data.settings.min_players_on_pitch}
                                                            onChange={e => settingsForm.setData('settings', { ...settingsForm.data.settings, min_players_on_pitch: parseInt(e.target.value) })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-rose-600">Sarı Kart Cezası (Limit)</Label>
                                                        <Input 
                                                            type="number" 
                                                            className="h-14 rounded-2xl font-bold bg-rose-500/5 border-rose-100/50"
                                                            value={settingsForm.data.settings.yellow_card_limit}
                                                            onChange={e => settingsForm.setData('settings', { ...settingsForm.data.settings, yellow_card_limit: parseInt(e.target.value) })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-amber-600">Max Değişiklik Hakkı</Label>
                                                        <Input 
                                                            type="number" 
                                                            className="h-14 rounded-2xl font-bold bg-amber-500/5 border-amber-100/50"
                                                            value={settingsForm.data.settings.substitution_limit}
                                                            onChange={e => settingsForm.setData('settings', { ...settingsForm.data.settings, substitution_limit: parseInt(e.target.value) })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-xl shadow-blue-600/20 gap-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                                                    <Shield className="h-8 w-8" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Güvenlik ve Kurallar</p>
                                                    <p className="font-bold text-sm tracking-tight leading-relaxed max-w-xl">Kural değişiklikleri mevcut takımları etkilemez, yeni oyuncu girişlerinde ve onaylama süreçlerinde otomatik olarak devreye girer.</p>
                                                </div>
                                            </div>
                                            <Button 
                                                disabled={settingsForm.processing}
                                                className="w-full md:w-auto h-16 px-12 bg-white text-blue-600 hover:bg-slate-50 font-black uppercase tracking-widest text-[10px] rounded-[1.5rem] shadow-xl transition-all hover:scale-105 active:scale-95 shrink-0"
                                            >
                                                {settingsForm.processing ? 'GÜNCELLENİYOR...' : 'AYARLARI KAYDET'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                    </Tabs>

            {/* Field Selection Modal */}
            <Dialog open={isFieldModalOpen} onOpenChange={setIsFieldModalOpen}>
                <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-border bg-background shadow-3xl">
                    <DialogHeader className="p-10 bg-slate-900 text-white">
                        <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
                            <MapPin className="h-8 w-8 text-white" />
                        </div>
                        <DialogTitle className="text-3xl font-black uppercase tracking-tighter">SAHA ATA</DialogTitle>
                        <DialogDescription className="text-white/40 font-bold uppercase text-[10px] tracking-widest mt-2 px-1">
                            {selectedGame?.home_team?.name} VS {selectedGame?.away_team?.name} MAÇININ OYNANACAĞI SAHAYI SEÇİN.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleFieldSubmit} className="p-10 space-y-8">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">MÜSAİT SAHALAR</Label>
                            <div className="grid grid-cols-1 gap-3">
                                {fields.map((field) => (
                                    <button
                                        key={field.id}
                                        type="button"
                                        onClick={() => setFieldData('field_id', field.id.toString())}
                                        className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all text-left ${
                                            fieldData.field_id === field.id.toString()
                                                ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-lg'
                                                : 'border-slate-50 hover:border-slate-200 bg-slate-50/50 text-slate-600'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center font-black ${
                                                fieldData.field_id === field.id.toString() ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                                            }`}>
                                                {field.name.substring(0, 1).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-black uppercase text-sm">{field.name}</p>
                                                {field.location && <p className="text-[9px] font-bold opacity-60 uppercase">{field.location}</p>}
                                            </div>
                                        </div>
                                        {fieldData.field_id === field.id.toString() && (
                                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                        )}
                                    </button>
                                ))}
                                {fields.length === 0 && (
                                    <div className="p-8 text-center bg-slate-50 rounded-3xl opacity-50 space-y-2">
                                        <Info className="h-6 w-6 mx-auto text-slate-400" />
                                        <p className="text-[10px] font-black uppercase text-slate-400">Önce Saha Yönetimi menüsünden saha tanımlamalısınız.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={fieldProcessing || !fieldData.field_id}
                            className="w-full h-16 bg-blue-600 hover:bg-black text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl transition-all"
                        >
                            SAHA ATAMASINI TAMAMLA
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Quick Result Modal */}
            <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
                <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-border bg-background">
                    <form onSubmit={handleResultSubmit}>
                        <DialogHeader className="p-8 pb-0">
                            <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-foreground">HIZLI SONUÇ GİRİŞİ</DialogTitle>
                            <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest">MAÇ SKORUNUN VE DURUMUNUN GÜNCELLENMESİ</DialogDescription>
                        </DialogHeader>

                        <div className="p-8 space-y-8">
                            <div className="flex items-center justify-between gap-6 p-8 bg-muted/30 rounded-[2rem] border border-border">
                                <div className="flex flex-col items-center gap-4 flex-1">
                                    <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow-lg">
                                        {selectedGame?.home_team.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="space-y-2 text-center">
                                        <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest truncate block w-32">{selectedGame?.home_team.name}</Label>
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
                                        <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest truncate block w-32">{selectedGame?.away_team.name}</Label>
                                        <Input
                                            type="number"
                                            value={resultForm.data.away_score}
                                            onChange={e => resultForm.setData('away_score', parseInt(e.target.value) || 0)}
                                            className="h-16 text-3xl font-black text-center rounded-2xl bg-background border-border"
                                        />
                                    </div>
                                </div>
                            </div>

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

            {/* Reset Tournament Modal */}
            <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
                <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-border bg-background">
                    <form onSubmit={handleReset}>
                        <DialogHeader className="p-8 pb-0">
                            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6">
                                <AlertCircle className="h-8 w-8 text-rose-600" />
                            </div>
                            <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-foreground">TURNUVAYI SIFIRLA</DialogTitle>
                            <DialogDescription className="text-xs font-medium text-muted-foreground mt-4 leading-relaxed">
                                Bu işlem tüm fikstürü, grupları, maç sonuçlarını ve istatistikleri <strong>kalıcı olarak silecektir</strong>. Sadece onaylı takımlar korunacaktır.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-8 space-y-6">
                            <div className="p-6 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 rounded-2xl space-y-2">
                                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-2">
                                    <Info className="h-3 w-3" /> GÜVENLİK ONAYI
                                </p>
                                <p className="text-[10px] text-amber-600 font-bold leading-tight uppercase">Tüm veriler silinecektir!</p>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Sıfırlama Şifresi Giriniz!</Label>
                                <Input
                                    type="text"
                                    placeholder=""
                                    className="h-14 text-center text-xl font-black bg-muted/50 border-border focus:border-rose-500 rounded-2xl tracking-[0.5em]"
                                    value={resetForm.data.password}
                                    onChange={e => resetForm.setData('password', e.target.value)}
                                    maxLength={8}
                                />
                            </div>
                        </div>

                        <DialogFooter className="p-8 bg-muted/20 border-t border-border">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsResetModalOpen(false)}
                                className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                            >
                                VAZGEÇ
                            </Button>
                            <Button
                                type="submit"
                                disabled={resetForm.processing || resetForm.data.password.length < 8}
                                className="h-14 px-12 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-rose-500/20"
                            >
                                HER ŞEYİ SIFIRLA
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Draw Confirmation Modal */}
            <Dialog open={isDrawConfirmModalOpen} onOpenChange={setIsDrawConfirmModalOpen}>
                <DialogContent className="max-w-md rounded-[2rem] p-0 overflow-hidden border-border bg-background">
                    <div className="p-8 pb-0">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                            <Dices className="h-8 w-8 text-blue-600" />
                        </div>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-foreground">KURA ÇEKİMİNİ BAŞLAT</DialogTitle>
                        <DialogDescription className="text-xs font-medium text-muted-foreground mt-4 leading-relaxed">
                            Kura çekimi mevcut tüm grupları, maç sonuçlarını ve fikstürü <strong>sıfırlayacaktır</strong>. Bu işlemi onaylıyor musunuz?
                        </DialogDescription>
                    </div>

                    <DialogFooter className="p-8 bg-muted/20 border-t border-border mt-8">
                        <Button
                            variant="ghost"
                            onClick={() => setIsDrawConfirmModalOpen(false)}
                            className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px]"
                        >
                            İPTAL
                        </Button>
                        <Button
                            onClick={handleDrawSubmit}
                            disabled={drawProcessing}
                            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20"
                        >
                            EVET, KURAYI ÇEK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Advance Round Confirmation Modal */}
            <Dialog open={isAdvanceConfirmModalOpen} onOpenChange={setIsAdvanceConfirmModalOpen}>
                <DialogContent className="max-w-md rounded-[2rem] p-0 overflow-hidden border-border bg-background">
                    <div className="p-8 pb-0">
                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                            <ArrowRight className="h-8 w-8 text-emerald-600" />
                        </div>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-foreground">TUR ATLAT</DialogTitle>
                        <DialogDescription className="text-xs font-medium text-muted-foreground mt-4 leading-relaxed">
                            {advanceForm.data.current_round?.toUpperCase()} turunu tamamlayıp {advanceForm.data.next_round?.toUpperCase()} turunu oluşturmak istediğinize emin misiniz?
                        </DialogDescription>
                    </div>

                    <DialogFooter className="p-8 bg-muted/20 border-t border-border mt-8">
                        <Button
                            variant="ghost"
                            onClick={() => setIsAdvanceConfirmModalOpen(false)}
                            className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px]"
                        >
                            İPTAL
                        </Button>
                        <Button
                            onClick={handleAdvanceSubmit}
                            disabled={advanceForm.processing}
                            className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20"
                        >
                            TURU OLUŞTUR
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Third Place Match Confirmation Modal */}
            <Dialog open={isThirdPlaceConfirmModalOpen} onOpenChange={setIsThirdPlaceConfirmModalOpen}>
                <DialogContent className="max-w-md rounded-[2rem] p-0 overflow-hidden border-border bg-background">
                    <div className="p-8 pb-0">
                        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6">
                            <Medal className="h-8 w-8 text-amber-600" />
                        </div>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-foreground">3.LÜK MAÇI OLUŞTUR</DialogTitle>
                        <DialogDescription className="text-xs font-medium text-muted-foreground mt-4 leading-relaxed">
                            Yarı final mağluplarını eşleştirip 3.lük maçını oluşturmak istediğinize emin misiniz?
                        </DialogDescription>
                    </div>

                    <DialogFooter className="p-8 bg-muted/20 border-t border-border mt-8">
                        <Button
                            variant="ghost"
                            onClick={() => setIsThirdPlaceConfirmModalOpen(false)}
                            className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px]"
                        >
                            İPTAL
                        </Button>
                        <Button
                            onClick={handleThirdPlaceSubmit}
                            disabled={thirdPlaceForm.processing}
                            className="h-12 px-8 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-amber-500/20"
                        >
                            MAÇI OLUŞTUR
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Complete Tournament Confirmation Modal */}
            <Dialog open={isCompleteConfirmModalOpen} onOpenChange={setIsCompleteConfirmModalOpen}>
                <DialogContent className="max-w-md rounded-[2rem] p-0 overflow-hidden border-border bg-background">
                    <div className="p-8 pb-0">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                            <Trophy className="h-8 w-8 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-foreground">TURNUVAYI TAMAMLA</DialogTitle>
                        <DialogDescription className="text-xs font-medium text-muted-foreground mt-4 leading-relaxed">
                            Turnuvayı tamamlandı olarak işaretlemek istiyor musunuz? Bu işlemden sonra sistem yeni turnuvalara odaklanacaktır.
                        </DialogDescription>
                    </div>

                    <DialogFooter className="p-8 bg-muted/20 border-t border-border mt-8">
                        <Button
                            variant="ghost"
                            onClick={() => setIsCompleteConfirmModalOpen(false)}
                            className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px]"
                        >
                            VAZGEÇ
                        </Button>
                        <Button
                            onClick={handleCompleteSubmit}
                            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20"
                        >
                            TURNUVAYI BİTİR
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    </AppLayout>
    );
}
