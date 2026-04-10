import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlayCircle, Calendar, Hash, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Fikstür', href: '/games' },
];

interface Game {
    id: number;
    home_team: { name: string };
    away_team: { name: string };
    home_score: number;
    away_score: number;
    status: 'scheduled' | 'playing' | 'completed';
    scheduled_at: string;
    group?: { name: string };
    tournament: { name: string };
}

interface Props {
    games: Game[];
}

export default function Index({ games }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Fikstür & Sonuçlar" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Fikstür & Sonuçlar</h1>
                        <p className="text-neutral-500">Oynanacak ve tamamlanan tüm maçların listesi.</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Simplified Grouping by Date could be added here */}
                    <div className="grid grid-cols-1 gap-4">
                        {games.map((game) => (
                            <Card key={game.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row items-center border-l-4 border-blue-600">
                                        {/* Date Info */}
                                        <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-neutral-900 border-r p-4 min-w-[140px]">
                                            <p className="text-xs font-bold text-neutral-500 uppercase">
                                                {game.scheduled_at ? format(new Date(game.scheduled_at), 'dd MMM yyyy', { locale: tr }) : 'Tarih Belirtilmedi'}
                                            </p>
                                            <p className="text-lg font-black text-blue-600">
                                                {game.scheduled_at ? format(new Date(game.scheduled_at), 'HH:mm') : '--:--'}
                                            </p>
                                            <Badge variant="outline" className="mt-2 text-[10px]">
                                                {game.group ? game.group.name : 'Eleme'}
                                            </Badge>
                                        </div>

                                        {/* Match Info */}
                                        <div className="flex-1 flex flex-col md:flex-row items-center justify-between p-6 gap-6">
                                            <div className="flex-1 text-right font-bold text-lg md:text-xl">
                                                {game.home_team.name}
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {game.status === 'scheduled' ? (
                                                    <div className="flex h-12 w-24 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-400 font-bold">
                                                        VS
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-12 w-14 items-center justify-center rounded-lg bg-neutral-900 text-white text-2xl font-black shadow-lg">
                                                            {game.home_score}
                                                        </div>
                                                        <div className="flex h-12 w-14 items-center justify-center rounded-lg bg-neutral-900 text-white text-2xl font-black shadow-lg">
                                                            {game.away_score}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 text-left font-bold text-lg md:text-xl">
                                                {game.away_team.name}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="p-4 flex items-center justify-center border-t md:border-t-0 md:border-l">
                                            <Link href={route('games.show', game.id)}>
                                                <Button variant={game.status === 'playing' ? 'destructive' : 'outline'} className="font-bold gap-2">
                                                    {game.status === 'playing' ? (
                                                        <>
                                                            <PlayCircle className="h-4 w-4 animate-pulse" /> Maçı Yönet
                                                        </>
                                                    ) : game.status === 'completed' ? (
                                                        'Detaylar'
                                                    ) : (
                                                        'Maç Sayfası'
                                                    )}
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
