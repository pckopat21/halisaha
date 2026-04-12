import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlayCircle, Calendar, Clock, Trophy, ChevronRight, Activity, Timer as TimerIcon, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
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
    started_at: string | null;
    group?: { name: string };
    tournament: { name: string };
}

interface Props {
    games: Game[];
}

export default function Index({ games }: Props) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 30000); // 30s is enough for index
        return () => clearInterval(interval);
    }, []);

    const getMatchMinute = (game: Game) => {
        if (!game.started_at) return 1;
        const start = new Date(game.started_at);
        const diff = Math.floor((currentTime.getTime() - start.getTime()) / 60000);
        return Math.min(90, Math.max(1, diff + 1));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Fikstür & Sonuçlar" />
            
            <div className="flex h-full flex-1 flex-col gap-8 p-6 md:p-12 bg-slate-50 dark:bg-black font-sans">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <Badge className="bg-blue-600 text-white border-none font-black text-[10px] items-center gap-2 mb-4 uppercase tracking-widest px-4 py-1.5 rounded-full">
                            <Activity className="h-3 w-3" /> FİKSTÜR SİSTEMİ
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-slate-900 dark:text-white leading-none">MAÇ PROGRAMI</h1>
                        <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-[10px]">TÜM TURNUVA MAÇLARI VE CANLI SKORLAR</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {games.length === 0 ? (
                        <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[3rem]">
                            <Calendar className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Henüz planlanmış bir maç bulunmuyor.</p>
                        </div>
                    ) : (
                        games.map((game) => (
                            <Card key={game.id} className="overflow-hidden border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl rounded-[2.5rem] group hover:scale-[1.01] transition-all duration-300">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row items-stretch">
                                        {/* Left Side: Status & Time */}
                                        <div className={`p-8 md:w-56 flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden ${
                                            game.status === 'playing' ? 'bg-emerald-500 text-white' : 
                                            game.status === 'completed' ? 'bg-slate-100 dark:bg-neutral-800 text-slate-500' : 'bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white'
                                        }`}>
                                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                                            
                                            {game.status === 'playing' ? (
                                                <div className="relative z-10 flex flex-col items-center gap-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]" />
                                                        <span className="font-black text-[10px] tracking-[0.2em] uppercase whitespace-nowrap">CANLI</span>
                                                    </div>
                                                    <span className="text-5xl font-black tracking-tighter tabular-nums">{getMatchMinute(game)}'</span>
                                                </div>
                                            ) : (
                                                <div className="relative z-10">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-60">
                                                        {game.scheduled_at ? format(new Date(game.scheduled_at), 'dd MMM yyyy', { locale: tr }) : 'TARİHSİZ'}
                                                    </p>
                                                    <p className="text-3xl font-black tracking-tighter">
                                                        {game.scheduled_at ? format(new Date(game.scheduled_at), 'HH:mm') : '--:--'}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            <Badge variant="outline" className={`mt-2 font-black text-[9px] uppercase tracking-widest px-3 border-current overflow-hidden truncate max-w-full ${game.status === 'playing' ? 'text-white border-white/40' : ''}`}>
                                                {game.group ? game.group.name : 'ELEME TURU'}
                                            </Badge>
                                        </div>

                                        {/* Center: Matchup */}
                                        <div className="flex-1 p-8 flex items-center justify-center relative bg-white dark:bg-neutral-900">
                                            <div className="grid grid-cols-1 md:grid-cols-3 items-center w-full gap-6 md:gap-12">
                                                {/* Home Team */}
                                                <div className="flex flex-col md:flex-row items-center gap-4 justify-end text-center md:text-right">
                                                    <span className="font-black text-lg md:text-2xl uppercase tracking-tighter group-hover:text-blue-600 transition-colors order-2 md:order-1">{game.home_team?.name || 'BELİRLENMEDİ'}</span>
                                                    <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-slate-50 dark:bg-black/20 flex items-center justify-center shrink-0 order-1 md:order-2">
                                                        <Trophy className={`h-6 w-6 ${game.status === 'completed' && (game.home_score || 0) > (game.away_score || 0) ? 'text-amber-500 animate-bounce' : 'text-slate-300'}`} />
                                                    </div>
                                                </div>

                                                {/* Score */}
                                                <div className="flex items-center justify-center">
                                                    <div className={`flex items-center gap-4 px-8 py-4 rounded-[2rem] shadow-xl relative overflow-hidden ${
                                                        game.status === 'playing' ? 'bg-emerald-600 text-white shadow-emerald-500/20' : 
                                                        game.status === 'completed' ? 'bg-slate-900 text-white' : 'bg-slate-50 dark:bg-black/40 text-slate-400 border border-slate-200 dark:border-white/5'
                                                    }`}>
                                                        {game.status === 'scheduled' ? (
                                                            <span className="text-2xl font-black">VS</span>
                                                        ) : (
                                                            <div className="flex items-center gap-4 text-4xl font-black tabular-nums tracking-tighter">
                                                                <span>{game.home_score}</span>
                                                                <span className="text-xl opacity-30">:</span>
                                                                <span>{game.away_score}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Away Team */}
                                                <div className="flex flex-col md:flex-row items-center gap-4 justify-start text-center md:text-left">
                                                    <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-slate-50 dark:bg-black/20 flex items-center justify-center shrink-0">
                                                        <Trophy className={`h-6 w-6 ${game.status === 'completed' && (game.away_score || 0) > (game.home_score || 0) ? 'text-amber-500 animate-bounce' : 'text-slate-300'}`} />
                                                    </div>
                                                    <span className="font-black text-lg md:text-2xl uppercase tracking-tighter group-hover:text-rose-600 transition-colors">{game.away_team?.name || 'BELİRLENMEDİ'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side: Actions */}
                                        <div className="p-8 md:w-48 bg-slate-50/50 dark:bg-black/20 border-t md:border-l border-slate-100 dark:border-white/5 flex items-center justify-center">
                                            <Link href={route('games.show', game.id)} className="w-full">
                                                <Button 
                                                    className={`w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95 ${
                                                        game.status === 'playing' 
                                                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20' 
                                                        : 'bg-white dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 hover:bg-slate-50 shadow-sm'
                                                    }`}
                                                >
                                                    {game.status === 'playing' ? (
                                                        <Activity className="h-4 w-4 mr-2 animate-pulse" />
                                                    ) : game.status === 'completed' ? (
                                                        <CheckCircle2 className="h-4 w-4 mr-2 text-blue-600" />
                                                    ) : (
                                                        <PlayCircle className="h-4 w-4 mr-2 text-blue-600" />
                                                    )}
                                                    İZLE
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
