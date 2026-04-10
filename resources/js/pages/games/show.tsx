import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { Trophy, Clock, User, AlertTriangle, Goal, Ban, Repeat, X, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Player {
    id: number;
    first_name: string;
    last_name: string;
}

interface Game {
    id: number;
    home_team: { id: number; name: string; players: Player[] };
    away_team: { id: number; name: string; players: Player[] };
    home_score: number;
    away_score: number;
    status: 'scheduled' | 'playing' | 'completed';
    tournament: { name: string };
    group?: { name: string };
    events: any[];
}

interface Props {
    game: Game;
}

export default function Show({ game }: Props) {
    const { auth, errors } = usePage().props as any;
    const isCommittee = auth.user?.role === 'committee' || auth.user?.role === 'super_admin';
    const isReferee = auth.user?.role === 'referee';
    const canManageEvents = isCommittee || isReferee;
    
    const submitEvent = (teamId: number, playerId: number, type: string) => {
        router.post(route('games.event', game.id), {
            team_id: teamId,
            player_id: playerId,
            event_type: type,
            minute: 10, // In real app, this would be a timer
        }, {
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Fikstür', href: '/games' },
        { title: `${game.home_team.name} vs ${game.away_team.name}`, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Maç Yönetimi" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Scoreboard */}
                <Card className="border-none bg-neutral-900 text-white shadow-2xl overflow-hidden">
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex flex-1 flex-col items-center gap-4">
                                <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center text-4xl font-black">
                                    {game.home_team.name.charAt(0)}
                                </div>
                                <h2 className="text-2xl font-black text-center">{game.home_team.name}</h2>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <Badge className="bg-blue-600 text-[10px] font-black">{game.tournament.name} - {game.group?.name || 'Final'}</Badge>
                                <div className="flex items-center gap-6">
                                    <span className="text-7xl font-black tabular-nums">{game.home_score}</span>
                                    <span className="text-4xl text-neutral-500 font-black">:</span>
                                    <span className="text-7xl font-black tabular-nums">{game.away_score}</span>
                                </div>
                                <div className="flex items-center gap-2 text-neutral-400">
                                    <Clock className="h-4 w-4" />
                                    <span className="font-bold uppercase tracking-widest text-xs">{game.status}</span>
                                </div>
                            </div>

                            <div className="flex flex-1 flex-col items-center gap-4">
                                <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center text-4xl font-black">
                                    {game.away_team.name.charAt(0)}
                                </div>
                                <h2 className="text-2xl font-black text-center">{game.away_team.name}</h2>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Events Timeline */}
                    <Card className="lg:col-span-1 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="h-5 w-5" /> Maç Olayları
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {game.events.length === 0 && <p className="text-neutral-400 text-center py-8">Henüz olay yok.</p>}
                                {game.events.map((event: any, idx) => (
                                    <div key={idx} className="flex items-center gap-3 text-sm border-l-2 border-neutral-200 pl-4 py-2 group">
                                        <span className="font-black text-neutral-400 w-8">{event.minute}'</span>
                                        <div className="flex-1">
                                            <span className="font-bold">{event.player?.first_name} {event.player?.last_name}</span>
                                            <p className="text-xs text-neutral-500 uppercase font-bold">{event.event_type.replace('_', ' ')}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {event.event_type === 'goal' && <Goal className="h-4 w-4 text-emerald-500" />}
                                            {event.event_type === 'yellow_card' && <div className="h-4 w-3 bg-amber-400 rounded-sm" />}
                                            {event.event_type === 'red_card' && <div className="h-4 w-3 bg-rose-600 rounded-sm" />}
                                            
                                            {isCommittee && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-6 w-6 rounded-full opacity-40 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600 transition-all ml-2"
                                                    onClick={() => router.delete(route('games.events.destroy', { game: game.id, event: event.id }), { preserveScroll: true })}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Team Controls */}
                    <div className="lg:col-span-2 space-y-6">
                        {[game.home_team, game.away_team].map((team) => (
                            <Card key={team.id} className="shadow-sm">
                                <CardHeader className="bg-neutral-50 dark:bg-neutral-900 font-black uppercase tracking-wider text-xs border-b">
                                    {team.name} - Kontrol Paneli
                                </CardHeader>
                                    <CardContent className="p-4 overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-neutral-500">
                                                    <th className="pb-4">Oyuncu</th>
                                                    {canManageEvents && <th className="pb-4 text-right">Olay Ekle</th>}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {team.players.map((player) => (
                                                    <tr key={player.id} className="border-t">
                                                        <td className="py-3 font-bold">{player.first_name} {player.last_name}</td>
                                                        {canManageEvents && (
                                                            <td className="py-2 text-right">
                                                                <div className="flex justify-end gap-1">
                                                                    <Button 
                                                                        size="sm" variant="outline" className="h-8 w-8 p-0 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                                                        onClick={() => submitEvent(team.id, player.id, 'goal')}
                                                                    >
                                                                        G
                                                                    </Button>
                                                                    <Button 
                                                                        size="sm" variant="outline" className="h-8 w-8 p-0 border-amber-200 text-amber-600 hover:bg-amber-50"
                                                                        onClick={() => submitEvent(team.id, player.id, 'yellow_card')}
                                                                    >
                                                                        S
                                                                    </Button>
                                                                    <Button 
                                                                        size="sm" variant="outline" className="h-8 w-8 p-0 border-rose-200 text-rose-600 hover:bg-rose-50"
                                                                        onClick={() => submitEvent(team.id, player.id, 'red_card')}
                                                                    >
                                                                        K
                                                                    </Button>
                                                                    <Button 
                                                                        size="sm" variant="outline" className="h-8 w-8 p-0 border-blue-200 text-blue-600 hover:bg-blue-50"
                                                                        onClick={() => submitEvent(team.id, player.id, 'sub_in')}
                                                                    >
                                                                        D
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </CardContent>
                            </Card>
                        ))}
                        
                        {/* Penalty Shootout section (Rule 16) */}
                        {game.group === null && game.status === 'playing' && game.home_score === game.away_score && (
                            <Card className="shadow-sm border-2 border-rose-200 bg-rose-50/10">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2 text-rose-600">
                                            <Shield className="h-5 w-5" /> PENALTI ATIŞLARI
                                        </CardTitle>
                                        <div className="flex items-center gap-4 text-2xl font-black">
                                            <span>{game.home_penalty_score}</span>
                                            <span>-</span>
                                            <span>{game.away_penalty_score}</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-8">
                                        {[game.home_team, game.away_team].map((team) => (
                                            <div key={team.id} className="space-y-4">
                                                <p className="text-xs font-black uppercase text-neutral-500">{team.name}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {team.players.map((p) => (
                                                        <Button 
                                                            key={p.id} size="sm" variant="outline" className="text-[10px] h-7 font-bold"
                                                            onClick={() => router.post(route('games.penalty', game.id), { team_id: team.id, player_id: p.id })}
                                                        >
                                                            {p.last_name} +
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {isCommittee && (
                            <div className="flex flex-col gap-4 pt-4 border-t">
                                {errors && Object.keys(errors).length > 0 && (
                                    <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-100">
                                        {Object.values(errors).join(', ')}
                                    </div>
                                )}
                                <div className="flex justify-end gap-4">
                                    <Button variant="outline" className="font-bold">Maçı İptal Et</Button>
                                    <Button 
                                        onClick={() => router.post(route('games.complete', game.id))}
                                        className="bg-blue-600 hover:bg-blue-700 font-bold px-8"
                                    >
                                        Maçı Tamamla
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
