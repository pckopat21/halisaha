import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router, Link } from '@inertiajs/react';
import { Trophy, Clock, User, AlertTriangle, Goal, Ban, Repeat, X, Shield, Play, CheckCircle2, Timer as TimerIcon, ArrowLeft, Activity, Target, Undo2, AlertCircle, Info, Users, MapPin, Tv } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';

interface Field {
    id: number;
    name: string;
    location: string | null;
}

interface Player {
    id: number;
    first_name: string;
    last_name: string;
    suspension?: {
        is_suspended: boolean;
        reason: string | null;
    };
}

interface Game {
    id: number;
    home_team: { id: number; name: string; user_id: number; players: Player[]; can_manage_roster?: boolean };
    away_team: { id: number; name: string; user_id: number; players: Player[]; can_manage_roster?: boolean };
    home_score: number;
    away_score: number;
    status: 'scheduled' | 'playing' | 'completed';
    tournament: { 
        id: number; 
        name: string;
        settings: {
            max_roster_size: number;
            min_roster_size: number;
            total_players_on_pitch: number;
            max_licensed_on_pitch: number;
            max_company_on_pitch: number;
            yellow_card_limit: number;
            substitution_limit: number;
            min_players_on_pitch: number;
            match_duration: number;
        }
    };
    group?: { name: string };
    events: any[];
    rosters: any[];
    scheduled_at: string;
    started_at: string | null;
    home_penalty_score?: number;
    away_penalty_score?: number;
    field?: Field | null;
    live_stream_url?: string | null;
}

interface Props {
    game: Game;
}

export default function Show({ game }: Props) {
    const { auth, errors } = usePage().props as any;
    const isCommittee = auth.user?.role === 'committee' || auth.user?.role === 'super_admin';
    const isReferee = auth.user?.role === 'referee';
    const canManageEvents = isCommittee || isReferee;
    
    const [selectedMinute, setSelectedMinute] = useState('1');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
    const [isReopenDialogOpen, setIsReopenDialogOpen] = useState(false);
    const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [managingTeam, setManagingTeam] = useState<any>(null);
    const [subOutPlayer, setSubOutPlayer] = useState<any>(null);
    const [selectedRoster, setSelectedRoster] = useState<{id: number, is_starting: boolean}[]>([]);
    const [rosterProcessing, setRosterProcessing] = useState(false);

    const onPitchIds = (teamId: number) => {
        let players = game.rosters
            .filter((r: any) => r.team_id === teamId && r.is_starting)
            .map((r: any) => r.player_id);
        
        // If no rosters defined, we treat everyone as "on pitch" potentially 
        // but for substitution logic we need a base. 
        // Let's assume if no rosters, everyone is eligible but substitution logic is disabled.
        if (game.rosters.filter((r: any) => r.team_id === teamId).length === 0) return [];

        game.events.filter(e => e.team_id === teamId).forEach((e: any) => {
            if (e.event_type === 'sub_in') players.push(e.player_id);
            if (e.event_type === 'sub_out' || e.event_type === 'red_card') {
                players = players.filter(id => id !== e.player_id);
            }
        });
        return players;
    };

    const eligibleForSubIn = (teamId: number) => {
        const onPitch = onPitchIds(teamId);
        return game.rosters
            .filter((r: any) => r.team_id === teamId && !onPitch.includes(r.player_id))
            .map((r: any) => {
                const p = game.home_team.id === teamId ? game.home_team.players.find(p => p.id === r.player_id) : game.away_team.players.find(p => p.id === r.player_id);
                
                // Also check if they were already subbed OUT (can't come back in usually)
                const alreadySubbedOut = game.events.some(e => e.team_id === teamId && e.player_id === r.player_id && e.event_type === 'sub_out');
                if (alreadySubbedOut) return null;
                
                return p;
            }).filter(Boolean);
    };

    const submitSubstitution = (inPlayerId: number) => {
        router.post(route('games.event', game.id), {
            team_id: managingTeam.id,
            player_id: subOutPlayer.id,
            event_type: 'sub_out',
            minute: selectedMinute
        }, {
            preserveScroll: true,
            onSuccess: () => {
                router.post(route('games.event', game.id), {
                    team_id: managingTeam.id,
                    player_id: inPlayerId,
                    event_type: 'sub_in',
                    minute: selectedMinute,
                    details: { replaced_player_id: subOutPlayer.id }
                }, {
                    preserveScroll: true,
                    onSuccess: () => setIsSubModalOpen(false)
                });
            }
        });
    };

    const togglePlayerInRoster = (playerId: number) => {
        setSelectedRoster(prev => {
            const exists = prev.find(p => p.id === playerId);
            if (exists) {
                if (exists.is_starting) {
                    return prev.map(p => p.id === playerId ? { ...p, is_starting: false } : p);
                } else {
                    return prev.filter(p => p.id !== playerId);
                }
            } else {
                return [...prev, { id: playerId, is_starting: true }];
            }
        });
    };

    const saveRoster = () => {
        setRosterProcessing(true);
        router.post(route('games.roster.update', game.id), {
            team_id: managingTeam.id,
            players: selectedRoster
        }, {
            onSuccess: () => {
                setIsRosterModalOpen(false);
                setRosterProcessing(false);
            },
            onError: () => setRosterProcessing(false),
            preserveScroll: true
        });
    };

    const openRosterModal = (team: any) => {
        setManagingTeam(team);
        const existingRoster = game.rosters
            .filter((r: any) => r.team_id === team.id)
            .map((r: any) => ({ id: r.player_id, is_starting: r.is_starting }));
        setSelectedRoster(existingRoster);
        setIsRosterModalOpen(true);
    };

    useEffect(() => {
        let interval: any;
        if (game.status === 'playing') {
            interval = setInterval(() => {
                setCurrentTime(new Date());
            }, 10000);
        }
        return () => clearInterval(interval);
    }, [game.status]);

    const matchMinute = (() => {
        if (game.status === 'scheduled') return 0;
        const maxDuration = game.tournament.settings.match_duration || 50;
        if (game.status === 'completed') return game.events.length > 0 ? Math.min(maxDuration, Math.max(...game.events.map((e: any) => e.minute))) : maxDuration;
        if (!game.started_at) return 1;

        const start = new Date(game.started_at);
        const diff = Math.floor((currentTime.getTime() - start.getTime()) / 60000);
        return Math.min(maxDuration, Math.max(1, diff + 1));
    })();

    // Auto-update selected minute if user hasn't typed manually
    useEffect(() => {
        if (game.status === 'playing') {
            setSelectedMinute(matchMinute.toString());
        }
    }, [matchMinute, game.status]);

    const submitEvent = (teamId: number, playerId: number, type: string) => {
        router.post(route('games.event', game.id), {
            team_id: teamId,
            player_id: playerId,
            event_type: type,
            minute: parseInt(selectedMinute),
        }, {
            preserveScroll: true,
        });
    };

    const handleComplete = () => {
        router.post(route('games.complete', game.id), {}, {
            onSuccess: () => setIsCompleteDialogOpen(false)
        });
    };

    const handleReopen = () => {
        router.post(route('games.reopen', game.id), {}, {
            onSuccess: () => setIsReopenDialogOpen(false)
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Turnuvalar', href: '/tournaments' },
        { title: game.tournament.name, href: `/tournaments/${game.tournament.id}` },
        { title: `${game.home_team.name} vs ${game.away_team.name}`, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${game.home_team.name} vs ${game.away_team.name} - Canlı Maç Merkezi`} />
            
            <div className="min-h-screen bg-slate-50 dark:bg-black p-4 md:p-8 font-sans">
                {/* Back Link */}
                <Link href={route('tournaments.show', game.tournament.id)} className="inline-flex items-center gap-2 text-muted-foreground hover:text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-8 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    TURNUVA MERKEZİNE DÖN
                </Link>

                {/* Premium Scoreboard */}
                <Card className="border-none bg-gradient-to-br from-slate-900 to-black text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden rounded-[3rem] mb-12 relative">
                    {/* Live Indicator Overlay */}
                    {game.status === 'playing' && (
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
                            <Badge className="bg-rose-600 text-white animate-pulse border-none px-4 py-1.5 rounded-full font-black text-[10px] tracking-[0.2em] shadow-lg shadow-rose-600/20">
                                <span className="w-2 h-2 bg-white rounded-full mr-2" /> CANLI MAÇ
                            </Badge>
                        </div>
                    )}

                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    </div>

                    <CardContent className="p-12 md:p-20 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-12 md:gap-24">
                            {/* Home Team */}
                            <div className="flex flex-col items-center gap-6">
                                <div className="h-24 w-24 md:h-32 md:w-32 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-4xl md:text-5xl font-black text-blue-400 shadow-2xl backdrop-blur-xl">
                                    {game.home_team.name.charAt(0)}
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-center uppercase tracking-tighter leading-none">{game.home_team.name}</h2>
                            </div>

                            {/* Score Display */}
                            <div className="flex flex-col items-center justify-center space-y-8">
                                <div className="flex items-center gap-8 md:gap-12">
                                    <span className="text-7xl md:text-9xl font-black tabular-nums tracking-tighter text-white drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">{game.home_score}</span>
                                    <span className="text-4xl md:text-6xl text-slate-700 font-black">:</span>
                                    <span className="text-7xl md:text-9xl font-black tabular-nums tracking-tighter text-white drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">{game.away_score}</span>
                                </div>
                                
                                <div className="flex flex-col items-center gap-3">
                                    <Badge variant="outline" className="border-white/10 text-white/40 font-black text-[9px] px-4 py-1.5 rounded-full uppercase tracking-[0.3em] bg-white/5">
                                        {game.tournament.name} • {game.group?.name || 'ELEME TURU'}
                                    </Badge>
                                    <div className="flex items-center gap-6 text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <TimerIcon className={`h-4 w-4 ${game.status === 'playing' ? 'text-emerald-500 animate-spin-slow' : 'text-blue-500'}`} />
                                            <span className="font-black uppercase tracking-widest text-[10px]">
                                                {game.status === 'scheduled' ? 'BAŞLAMADI' : 
                                                 game.status === 'playing' ? `${matchMinute}. DAKİKA` : 'MÜSABAKA BİTTİ'}
                                            </span>
                                        </div>
                                        {game.live_stream_url && (
                                            <a 
                                                href={game.live_stream_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="border-l border-white/10 pl-6 flex items-center gap-2 group/stream"
                                            >
                                                <div className="relative">
                                                    <Tv className="h-4 w-4 text-rose-500 animate-pulse" />
                                                    {game.status === 'playing' && (
                                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-600 rounded-full animate-ping" />
                                                    )}
                                                </div>
                                                <span className="font-black uppercase tracking-widest text-[10px] text-rose-500 group-hover/stream:underline decoration-2 underline-offset-4">
                                                    {game.status === 'playing' ? 'CANLI İZLE' : 'YAYIN LİNKİ'}
                                                </span>
                                            </a>
                                        )}
                                        {game.field && (
                                            <div className="flex items-center gap-2 border-l border-white/10 pl-6">
                                                <MapPin className="h-4 w-4 text-rose-500" />
                                                <span className="font-black uppercase tracking-widest text-[10px] text-white/60">
                                                    {game.field.name}
                                                    {game.field.location && <span className="ml-2 opacity-50 font-medium">({game.field.location})</span>}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Away Team */}
                            <div className="flex flex-col items-center gap-6">
                                <div className="h-24 w-24 md:h-32 md:w-32 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-4xl md:text-5xl font-black text-slate-400 shadow-2xl backdrop-blur-xl">
                                    {game.away_team.name.charAt(0)}
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-center uppercase tracking-tighter leading-none">{game.away_team.name}</h2>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    
                    {/* Events Timeline (Visual Story) */}
                    <div className="xl:col-span-4 flex flex-col gap-6">
                        <Card className="border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[3rem] overflow-hidden">
                            <CardHeader className="p-8 border-b border-neutral-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                                <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-blue-600" /> MAÇIN ÖYKÜSÜ
                                    </div>
                                    {game.status === 'completed' && (
                                        <Badge className="bg-slate-100 text-slate-500 border-none px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg">
                                            ÖYKÜ DONDURULDU
                                        </Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-white/5">
                                    {game.events.length === 0 ? (
                                        <div className="py-12 text-center">
                                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Henüz kritik bir an yaşanmadı.</p>
                                        </div>
                                    ) : (
                                        game.events.sort((a:any, b:any) => b.minute - a.minute).map((event: any, idx) => (
                                            <div key={idx} className="relative pl-10 group">
                                                <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white dark:bg-neutral-800 border-2 border-blue-600 shadow-lg z-10 flex items-center justify-center">
                                                    {event.event_type === 'goal' && <Goal className="h-3 w-3 text-emerald-500" />}
                                                    {event.event_type === 'assist' && <Target className="h-3 w-3 text-blue-500" />}
                                                    {event.event_type === 'yellow_card' && <div className="h-2.5 w-1.5 bg-amber-400 rounded-sm" />}
                                                    {event.event_type === 'red_card' && <div className="h-2.5 w-1.5 bg-rose-600 rounded-sm" />}
                                                    {(event.event_type === 'sub_in' || event.event_type === 'sub_out') && <Repeat className="h-3 w-3 text-blue-500" />}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-black tabular-nums text-blue-600">{event.minute}' Dakika</span>
                                                        {isCommittee && game.status !== 'completed' && (
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600 transition-all font-black"
                                                                onClick={() => router.delete(route('games.events.destroy', { game: game.id, event: event.id }), { preserveScroll: true })}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <h4 className="font-black text-sm uppercase tracking-tight">{event.player?.first_name} {event.player?.last_name}</h4>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                                                        {event.event_type === 'goal' ? 'GOOOL!' : 
                                                         event.event_type === 'assist' ? 'ŞIK BİR ASİST YAPTI' :
                                                         event.event_type === 'yellow_card' ? 'SARI KART GÖRDÜ' : 
                                                         event.event_type === 'red_card' ? 'OYUN DIŞI KALDI' : 'OYUNCU DEĞİŞİKLİĞİ'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Referee Tool & Management Area */}
                    <div className="xl:col-span-8 flex flex-col gap-8">
                        
                        {canManageEvents && game.status !== 'completed' && (
                            <Card className="border-none shadow-2xl bg-blue-600 text-white rounded-[3rem] overflow-hidden">
                                <CardContent className="p-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Tv className="h-4 w-4 text-white" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">CANLI YAYIN AYARLARI</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="url" 
                                                    id="live_stream_input"
                                                    placeholder="YouTube / Twitch Yayın Linki"
                                                    defaultValue={game.live_stream_url || ''}
                                                    className="flex-1 h-12 bg-white/10 rounded-xl border border-white/20 px-4 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:text-white/20"
                                                />
                                                <Button 
                                                    onClick={() => {
                                                        const val = (document.getElementById('live_stream_input') as HTMLInputElement).value;
                                                        router.post(route('games.quick-result', game.id), { 
                                                            live_stream_url: val,
                                                            status: game.status,
                                                            home_score: game.home_score,
                                                            away_score: game.away_score,
                                                            scheduled_at: game.scheduled_at
                                                        }, { preserveScroll: true });
                                                    }}
                                                    className="h-12 px-6 bg-white text-blue-600 hover:bg-blue-50 font-black uppercase tracking-widest text-[10px] rounded-xl"
                                                >
                                                    KAYDET
                                                </Button>
                                            </div>
                                            <p className="text-[9px] font-medium text-blue-100 opacity-60 italic">Yayın linkini buraya yapıştırıp enter tuşuna basabilirsiniz.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock className="h-4 w-4 text-white" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">MAÇ DAKİKASI</span>
                                            </div>
                                            <div className="flex items-center gap-4 bg-white/10 p-2 rounded-2xl border border-white/10 w-fit">
                                                <span className="text-[10px] font-black uppercase tracking-widest ml-4">DAKİKA:</span>
                                                <input 
                                                    type="number" 
                                                    value={selectedMinute}
                                                    onChange={(e) => setSelectedMinute(e.target.value)}
                                                    className="w-16 h-10 bg-white/10 rounded-xl border border-white/20 text-center font-black text-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/10">
                                    {[game.home_team, game.away_team].map((team) => (
                                        <div key={team.id} className="space-y-6">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex flex-col flex-1">
                                                    <Badge className={`border-none font-black text-xs px-4 py-1.5 rounded-xl uppercase tracking-widest ${team.id === game.home_team.id ? 'bg-blue-600 text-white' : 'bg-slate-400 text-white'}`}>
                                                        {team.name} KONTROLLERİ
                                                    </Badge>
                                                    <div className="flex items-center gap-2 mt-2 px-1">
                                                        <Repeat className="h-3 w-3 text-slate-500" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                                            DEĞİŞİKLİK: {game.events.filter(e => e.team_id === team.id && e.event_type === 'sub_in').length} / {game.tournament.settings.substitution_limit}
                                                        </span>
                                                    </div>
                                                </div>
                                                {team.can_manage_roster && (
                                                    <Button 
                                                        onClick={() => openRosterModal(team)}
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="h-9 px-4 border-white/20 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shrink-0"
                                                    >
                                                        <Users className="h-3.5 w-3.5 mr-2" /> ESAME LİSTESİ
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="space-y-3">
                                                {(game.rosters.filter((r: any) => r.team_id === team.id).length > 0 
                                                    ? team.players.filter((p: any) => game.rosters.some((r: any) => r.player_id === p.id))
                                                    : team.players
                                                ).map((player: any) => {
                                                    const isSuspended = player.suspension?.is_suspended;
                                                    const isOnPitch = onPitchIds(team.id).includes(player.id);
                                                    const isRosterEmpty = game.rosters.filter((r: any) => r.team_id === team.id).length === 0;

                                                    return (
                                                        <div key={player.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-2xl transition-all ${isSuspended ? 'bg-rose-500/5 border-rose-500/20 opacity-80' : !isOnPitch && !isRosterEmpty ? 'bg-slate-500/5 border-white/5 opacity-40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex flex-col">
                                                                    <span className="font-black text-sm uppercase truncate max-w-[150px]">{player.first_name} {player.last_name}</span>
                                                                    {!isOnPitch && !isRosterEmpty && <span className="text-[8px] font-black uppercase text-slate-500">YEDEK KULÜBESİNDE</span>}
                                                                </div>
                                                                {isSuspended && (
                                                                    <Badge className="bg-rose-600 text-white border-none text-[8px] font-black px-2 py-0.5 rounded-md animate-pulse" title={player.suspension?.reason || ''}>
                                                                        CEZALI
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-1.5 self-end">
                                                                <Button disabled={isSuspended} onClick={() => submitEvent(team.id, player.id, 'goal')} size="sm" className="h-10 px-3 bg-emerald-500 hover:bg-emerald-600 border-none rounded-xl shadow-lg shadow-emerald-900/40 disabled:opacity-30" title="Gol">
                                                                    <Goal className="h-4 w-4" />
                                                                </Button>
                                                                <Button disabled={isSuspended} onClick={() => submitEvent(team.id, player.id, 'assist')} size="sm" className="h-10 px-3 bg-blue-400 hover:bg-blue-500 border-none rounded-xl shadow-lg shadow-blue-900/40 disabled:opacity-30" title="Asist">
                                                                    <Target className="h-4 w-4" />
                                                                </Button>
                                                                <Button disabled={isSuspended} onClick={() => submitEvent(team.id, player.id, 'yellow_card')} size="sm" className="h-10 px-3 bg-amber-400 hover:bg-amber-500 border-none rounded-xl shadow-lg shadow-amber-900/40 disabled:opacity-30" title="Sarı Kart">
                                                                    <div className="h-4 w-3 bg-white/50 rounded-sm" />
                                                                </Button>
                                                                <Button disabled={isSuspended} onClick={() => submitEvent(team.id, player.id, 'red_card')} size="sm" className="h-10 px-3 bg-rose-500 hover:bg-rose-600 border-none rounded-xl shadow-lg shadow-rose-900/40 disabled:opacity-30" title="Kırmızı Kart">
                                                                    <div className="h-4 w-3 bg-white/50 rounded-sm" />
                                                                </Button>
                                                                {onPitchIds(team.id).includes(player.id) && (
                                                                    <Button 
                                                                        onClick={() => { setManagingTeam(team); setSubOutPlayer(player); setIsSubModalOpen(true); }}
                                                                        size="sm" className="h-10 px-3 bg-slate-700 hover:bg-slate-800 border-none rounded-xl shadow-lg" title="Oyuncu Değiştir">
                                                                        <Repeat className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Management Actions */}
                        {isCommittee && (
                            <div className="flex flex-col sm:flex-row justify-between gap-6 p-8 bg-white dark:bg-neutral-900 border border-border rounded-[3rem] shadow-xl">
                                <div className="flex flex-col gap-2">
                                    <h4 className="font-black text-lg uppercase tracking-tighter">MAÇ YÖNETİMİ</h4>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">TURNUVA KOMİTESİ YETKİLİ İŞLEMLERİ</p>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    {game.status !== 'playing' && game.status !== 'completed' && (
                                        <Button 
                                            onClick={() => router.post(route('games.quick-result', game.id), { status: 'playing' })}
                                            className="h-14 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-emerald-500/20"
                                        >
                                            <Play className="mr-2 h-4 w-4" /> MAÇI BAŞLAT
                                        </Button>
                                    )}
                                    {game.status !== 'completed' ? (
                                        <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-blue-500/20">
                                                    <CheckCircle2 className="mr-2 h-4 w-4" /> MAÇI TAMAMLA
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="rounded-[2.5rem] border-none bg-white dark:bg-neutral-950 shadow-2xl p-0 overflow-hidden max-w-[450px]">
                                                <div className="bg-blue-600 p-8 text-white flex flex-col items-center text-center gap-4">
                                                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                                                        <Trophy className="h-8 w-8 text-white" />
                                                    </div>
                                                    <DialogHeader>
                                                        <DialogTitle className="text-2xl font-black uppercase tracking-tight text-white m-0">Skorları Kilitle</DialogTitle>
                                                        <DialogDescription className="text-blue-100 text-xs font-bold uppercase tracking-widest opacity-80">BU İŞLEMDEN SONRA MAÇ SONUCU RESMİYET KAZANACAKTIR.</DialogDescription>
                                                    </DialogHeader>
                                                </div>
                                                <div className="p-8 space-y-6">
                                                    <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center gap-4">
                                                        <AlertCircle className="h-6 w-6 text-blue-600" />
                                                        <p className="text-xs font-bold leading-relaxed">Maçı tamamlamak istediğinize emin misiniz? Puan durumları anlık olarak hesaplanacaktır.</p>
                                                    </div>
                                                    <DialogFooter className="flex flex-col sm:flex-row gap-3">
                                                        <Button variant="ghost" onClick={() => setIsCompleteDialogOpen(false)} className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[10px]">İPTAL</Button>
                                                        <Button onClick={handleComplete} className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20">ONAYLA VE BİTİR</Button>
                                                    </DialogFooter>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    ) : (
                                        <Dialog open={isReopenDialogOpen} onOpenChange={setIsReopenDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button className="h-14 px-8 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] rounded-2xl border border-slate-200 dark:border-white/10">
                                                    <Undo2 className="mr-2 h-4 w-4 text-blue-600" /> MAÇI TEKRAR BAŞLAT
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="rounded-[2.5rem] border-none bg-white dark:bg-neutral-950 shadow-2xl p-0 overflow-hidden max-w-[450px]">
                                                <div className="bg-amber-500 p-8 text-white flex flex-col items-center text-center gap-4">
                                                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                                                        <AlertTriangle className="h-8 w-8 text-white" />
                                                    </div>
                                                    <DialogHeader>
                                                        <DialogTitle className="text-2xl font-black uppercase tracking-tight text-white m-0">Düzenlemeye Aç</DialogTitle>
                                                        <DialogDescription className="text-amber-50 text-xs font-bold uppercase tracking-widest opacity-80">MAÇ DURUMU CANLIYA ÇEKİLECEK VE PUANLAR GERİ ALINACAKTIR.</DialogDescription>
                                                    </DialogHeader>
                                                </div>
                                                <div className="p-8 space-y-6">
                                                    <div className="bg-amber-50 dark:bg-amber-500/5 p-6 rounded-2xl border border-amber-100 dark:border-amber-500/10 flex items-center gap-4">
                                                        <Info className="h-6 w-6 text-amber-600" />
                                                        <p className="text-xs font-bold leading-relaxed">Hatalı bir giriş mi yaptınız? Bu işlem puan durumlarını geçici olarak eski haline getirecektir.</p>
                                                    </div>
                                                    <DialogFooter className="flex flex-col sm:flex-row gap-3">
                                                        <Button variant="ghost" onClick={() => setIsReopenDialogOpen(false)} className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[10px]">VAZGEÇ</Button>
                                                        <Button onClick={handleReopen} className="flex-1 h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-amber-500/20">MAÇI GERİ AL</Button>
                                                    </DialogFooter>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Penalty Shootout section */}
                        {game.group === null && game.status === 'playing' && game.home_score === game.away_score && (
                            <Card className="border-2 border-rose-500 bg-rose-50 dark:bg-rose-900/10 rounded-[3rem] overflow-hidden">
                                <CardHeader className="p-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-2xl font-black text-rose-600 uppercase tracking-tighter flex items-center gap-3">
                                                <Target className="h-6 w-6" /> PENALTI ATIŞLARI
                                            </CardTitle>
                                            <CardDescription className="text-xs font-black uppercase tracking-widest text-rose-500 opacity-60 mt-1">BERABERLİK DURUMU SERİ ATIŞLAR</CardDescription>
                                        </div>
                                        <div className="flex items-center gap-8 text-6xl font-black text-rose-600 tabular-nums">
                                            <span>{game.home_penalty_score}</span>
                                            <span className="text-2xl opacity-40">-</span>
                                            <span>{game.away_penalty_score}</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 pt-0 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {[game.home_team, game.away_team].map((team) => (
                                        <div key={team.id} className="space-y-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{team.name} ATICILARI</p>
                                            <div className="flex flex-wrap gap-2">
                                                {(game.rosters.filter((r: any) => r.team_id === team.id).length > 0 
                                                    ? team.players.filter((p: any) => onPitchIds(team.id).includes(p.id))
                                                    : team.players
                                                ).map((p) => (
                                                    <Button 
                                                        key={p.id} 
                                                        size="sm" 
                                                        variant="outline" 
                                                        className="h-10 px-4 rounded-xl border-rose-200 text-rose-600 font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all"
                                                        onClick={() => router.post(route('games.penalty', game.id), { team_id: team.id, player_id: p.id })}
                                                    >
                                                        {p.last_name} +
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                    </div>
                </div>
            {/* Roster Selection Modal */}
            <Dialog open={isRosterModalOpen} onOpenChange={setIsRosterModalOpen}>
                <DialogContent className="max-w-2xl bg-slate-900 border-white/10 text-white rounded-[2.5rem] p-0 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]">
                    <div className="p-8 border-b border-white/5 bg-white/5">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4">
                                <Users className="h-8 w-8 text-blue-500" /> ESAME LİSTESİ DÜZENLE
                            </DialogTitle>
                            <DialogDescription className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">
                                {managingTeam?.name} • MAÇ KADROSU VE DİZİLİŞ
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    
                    <div className="p-8 max-h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {managingTeam?.players.map((player: any) => {
                                const inRoster = selectedRoster.find(p => p.id === player.id);
                                const isStarting = inRoster?.is_starting;
                                const isSuspended = player.suspension?.is_suspended;
                                
                                return (
                                    <div 
                                        key={player.id} 
                                        onClick={() => !isSuspended && togglePlayerInRoster(player.id)}
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${
                                            isSuspended ? 'bg-rose-500/5 border-rose-500/20 opacity-50 cursor-not-allowed' :
                                            inRoster ? (isStarting ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-blue-500/10 border-blue-500/50') : 
                                            'bg-white/5 border-white/5 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-black uppercase tracking-tight">{player.first_name} {player.last_name}</span>
                                            <div className="flex items-center gap-2">
                                                {isSuspended ? (
                                                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">{player.suspension?.reason}</span>
                                                ) : inRoster ? (
                                                    <Badge className={`border-none text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${isStarting ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}`}>
                                                        {isStarting ? 'İLK KADRO' : 'YEDEK'}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">KADRO DIŞI</span>
                                                )}
                                            </div>
                                        </div>
                                        {!isSuspended && (
                                            <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${inRoster ? 'bg-white border-white' : 'border-white/20 group-hover:border-white/50'}`}>
                                                {inRoster && <CheckCircle2 className={`h-4 w-4 ${isStarting ? 'text-emerald-600' : 'text-blue-600'}`} />}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-8 border-t border-white/5 bg-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">İlk Kadro</span>
                                <span className={`text-xl font-black tabular-nums ${selectedRoster.filter(p => p.is_starting).length > (game.tournament.settings.total_players_on_pitch || 7) ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {selectedRoster.filter(p => p.is_starting).length} / {game.tournament.settings.total_players_on_pitch || 7}
                                </span>
                            </div>
                            <div className="flex flex-col border-l border-white/10 pl-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Toplam Kadro</span>
                                <span className={`text-xl font-black tabular-nums ${selectedRoster.length > (game.tournament.settings.max_roster_size || 12) ? 'text-rose-500' : 'text-slate-200'}`}>
                                    {selectedRoster.length} / {game.tournament.settings.max_roster_size || 12}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Button variant="ghost" onClick={() => setIsRosterModalOpen(false)} className="h-14 font-black uppercase tracking-widest text-xs rounded-xl flex-1 md:flex-none">İPTAL</Button>
                            <Button 
                                onClick={saveRoster} 
                                disabled={rosterProcessing}
                                className="h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white border-none font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-blue-900/40 flex-1 md:flex-none"
                            >
                                {rosterProcessing ? 'KAYDEDİLİYOR...' : 'KADROYU ONAYLA'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Substitution Modal */}
            <Dialog open={isSubModalOpen} onOpenChange={setIsSubModalOpen}>
                <DialogContent className="max-w-md bg-slate-900 border-white/10 text-white rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-white/5 bg-white/5">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-4">
                                <Repeat className="h-6 w-6 text-amber-500" /> OYUNCU DEĞİŞİKLİĞİ
                            </DialogTitle>
                            <DialogDescription className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">
                                {subOutPlayer?.first_name} {subOutPlayer?.last_name} OYUNDAN ÇIKIYOR
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="p-8">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-6 text-slate-500">OYUNA GİRECEK YEDEK OYUNCU SEÇİN</p>
                        <div className="grid grid-cols-1 gap-3">
                            {eligibleForSubIn(managingTeam?.id || 0).map((player: any) => (
                                <Button 
                                    key={player.id}
                                    onClick={() => submitSubstitution(player.id)}
                                    variant="outline"
                                    className="h-14 justify-between border-white/5 bg-white/5 hover:bg-white/10 rounded-2xl p-4 transition-all"
                                >
                                    <span className="font-black text-sm uppercase">{player.first_name} {player.last_name}</span>
                                    <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                                        <Play className="h-3 w-3 fill-white" />
                                    </div>
                                </Button>
                            ))}
                            {eligibleForSubIn(managingTeam?.id || 0).length === 0 && (
                                <p className="text-center py-8 text-xs font-bold text-slate-600 uppercase tracking-widest">Girebilecek yedek oyuncu kalmadı.</p>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            </div>
        </AppLayout>
    );
}
