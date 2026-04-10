import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Trophy, Users, Calendar, Activity, ChevronRight, PlayCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Stats {
    tournaments_count: number;
    teams_count: number;
    games_count: number;
    players_count: number;
}

interface Game {
    id: number;
    home_team: { name: string };
    away_team: { name: string };
    home_score: number;
    away_score: number;
    status: string;
    scheduled_at: string;
}

interface Props {
    stats: Stats;
    recent_games: Game[];
    active_tournament: any;
}

export default function Dashboard({ stats, recent_games, active_tournament }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            <div className="relative flex h-full flex-1 flex-col gap-6 p-6 overflow-hidden">
                {/* Decorative Soccer Field Background Pattern (Subtle) */}
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none dark:opacity-[0.05]">
                    <div className="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:40px_40px]" />
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-900" />
                    <div className="absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-emerald-900" />
                </div>

                {/* Stats Grid */}
                <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="overflow-hidden border-none bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg transition-transform hover:scale-105">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-80">Aktif Turnuvalar</p>
                                    <h3 className="text-3xl font-bold">{stats.tournaments_count}</h3>
                                </div>
                                <div className="rounded-full bg-white/20 p-3">
                                    <Trophy className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-none bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg transition-transform hover:scale-105">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-80">Toplam Takımlar</p>
                                    <h3 className="text-3xl font-bold">{stats.teams_count}</h3>
                                </div>
                                <div className="rounded-full bg-white/20 p-3">
                                    <Users className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-none bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg transition-transform hover:scale-105">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-80">Oynanan Maçlar</p>
                                    <h3 className="text-3xl font-bold">{stats.games_count}</h3>
                                </div>
                                <div className="rounded-full bg-white/20 p-3">
                                    <Calendar className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-none bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg transition-transform hover:scale-105">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-80">Kayıtlı Oyuncular</p>
                                    <h3 className="text-3xl font-bold">{stats.players_count}</h3>
                                </div>
                                <div className="rounded-full bg-white/20 p-3">
                                    <Activity className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Recent Games List */}
                    <div className="lg:col-span-2">
                        <Card className="h-full shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-bold">Son Maçlar</CardTitle>
                                <button className="text-sm font-medium text-blue-600 hover:underline">Tümünü Gör</button>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                {recent_games.length > 0 ? (
                                    recent_games.map((game) => (
                                        <div key={game.id} className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900">
                                            <div className="flex flex-1 items-center justify-end font-bold">
                                                {game.home_team.name}
                                            </div>
                                            <div className="mx-6 flex items-center gap-3">
                                                <div className="flex h-10 w-12 items-center justify-center rounded bg-slate-100 text-lg font-black dark:bg-neutral-800">
                                                    {game.home_score}
                                                </div>
                                                <span className="text-neutral-400">-</span>
                                                <div className="flex h-10 w-12 items-center justify-center rounded bg-slate-100 text-lg font-black dark:bg-neutral-800">
                                                    {game.away_score}
                                                </div>
                                            </div>
                                            <div className="flex flex-1 items-center justify-start font-bold">
                                                {game.away_team.name}
                                            </div>
                                            <div className="ml-4">
                                                {game.status === 'playing' ? (
                                                    <span className="flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-600 animate-pulse">
                                                        <PlayCircle className="h-3 w-3" /> CANLI
                                                    </span>
                                                ) : (
                                                    <ChevronRight className="h-5 w-5 text-neutral-300" />
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
                                        <Calendar className="mb-2 h-12 w-12 opacity-20" />
                                        <p>Henüz maç verisi bulunmuyor.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Active Tournament Card */}
                    <div>
                        <Card className="h-full bg-slate-50 shadow-sm dark:bg-neutral-950/50">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Turnuva Durumu</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {active_tournament ? (
                                    <div className="space-y-4">
                                        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-900">
                                            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Aktif Turnuva</p>
                                            <h4 className="mt-1 text-xl font-black">{active_tournament.name}</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-neutral-900">
                                                <p className="text-xs font-medium text-neutral-500 text-center">Yıl</p>
                                                <p className="text-lg font-bold text-center">{active_tournament.year}</p>
                                            </div>
                                            <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-neutral-900">
                                                <p className="text-xs font-medium text-neutral-500 text-center">Aşama</p>
                                                <p className="text-lg font-bold text-center uppercase tracking-tighter text-blue-600">{active_tournament.status}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
                                        <Trophy className="mb-2 h-12 w-12 opacity-20" />
                                        <p>Aktif bir turnuva yok.</p>
                                        <button className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-blue-700">
                                            Turnuva Oluştur
                                        </button>
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
