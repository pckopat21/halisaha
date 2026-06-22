import { useState } from 'react';
import { Head, usePage, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { 
    Trophy, 
    Target, 
    TrendingUp, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    HelpCircle, 
    AlertCircle, 
    Search,
    ChevronRight,
    Award,
    Zap,
    MapPin,
    ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Prediction {
    id: number;
    game_id: number;
    user_id: number;
    prediction_type: string;
    home_score: number | null;
    away_score: number | null;
    outcome: string | null;
    status: string;
    points: number;
    created_at: string;
    game: {
        id: number;
        home_team: { name: string };
        away_team: { name: string };
        home_score: number;
        away_score: number;
        status: string;
        scheduled_at: string;
        tournament: { name: string };
        group?: { name: string };
    };
}

interface LeaderboardUser {
    id: number;
    name: string;
    total_points: string | number;
    total_predictions: number;
    exact_hits: number;
    accuracy: number;
}

interface PredictableGame {
    id: number;
    home_team: { name: string };
    away_team: { name: string };
    status: string;
    scheduled_at: string;
    tournament: { name: string };
    group?: { name: string };
    user_prediction?: {
        id: number;
        home_score: number;
        away_score: number;
    } | null;
    stats?: {
        total: number;
        distribution: { home: number; draw: number; away: number };
        counts: { home: number; draw: number; away: number };
        common_scores: { score: string; count: number; percentage: number }[];
    };
}

interface Props {
    leaderboard: LeaderboardUser[];
    my_predictions: Prediction[];
    upcoming_games: PredictableGame[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kontrol Merkezi', href: '/dashboard' },
    { title: 'Tahmin Ligi', href: '#' },
];

export default function PredictionLeaderboardPage({ leaderboard, my_predictions, upcoming_games }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [scores, setScores] = useState<Record<number, { home: string; away: string }>>({});
    const [processingId, setProcessingId] = useState<number | null>(null);

    const handleScoreChange = (gameId: number, side: 'home' | 'away', value: string) => {
        setScores(prev => ({
            ...prev,
            [gameId]: {
                ...prev[gameId] || { home: '', away: '' },
                [side]: value
            }
        }));
    };

    const submitExactPrediction = (gameId: number) => {
        const gameScores = scores[gameId];
        if (!gameScores || gameScores.home === '' || gameScores.away === '') return;

        setProcessingId(gameId);
        router.post(route('predictions.store'), {
            game_id: gameId,
            home_score: parseInt(gameScores.home),
            away_score: parseInt(gameScores.away),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setProcessingId(null);
            },
            onError: () => {
                setProcessingId(null);
            }
        });
    };

    // Helper to calculate custom user badges dynamically
    const getUserBadges = (user: LeaderboardUser) => {
        const badges = [];
        const predictionsCount = user.total_predictions;
        const accuracy = user.accuracy;
        const exactHits = user.exact_hits;

        if (exactHits >= 1) {
            badges.push({
                text: 'KESKİN',
                description: 'En az 1 maçı tam skor bilmiş keskin nişancı!',
                icon: Target,
                color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            });
        }
        if (accuracy >= 30 && predictionsCount >= 3) {
            badges.push({
                text: 'KAHİN',
                description: 'Yüksek isabet oranına sahip bilge tahminci!',
                icon: Award,
                color: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            });
        }
        if (predictionsCount >= 5) {
            badges.push({
                text: 'AKTİF',
                description: 'Turnuva tahminlerine düzenli katılan sadık oyuncu!',
                icon: Zap,
                color: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            });
        }
        return badges;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tahmin Ligi & Tahmin Merkezi" />

            <div className="p-4 md:p-8 space-y-8 font-sans max-w-7xl mx-auto animate-in fade-in duration-500">
                
                {/* Hero Header */}
                <div className="relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-black text-white p-8 md:p-12 shadow-2xl border border-white/5 group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-25"></div>
                    <div className="absolute -right-20 -bottom-20 opacity-15 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                        <Trophy className="h-96 w-96 text-white" />
                    </div>
                    <div className="relative z-10 space-y-4 max-w-2xl">
                        <Badge className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border-none font-black text-[10px] px-5 py-2 rounded-full uppercase tracking-[0.3em]">TAHMİN MERKEZİ</Badge>
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                            KAHİNLER <span className="text-indigo-400">ARENASI</span>
                        </h1>
                        <p className="text-slate-400 text-xs md:text-sm font-semibold uppercase tracking-wider leading-relaxed">
                            Skorları tam isabet tahmin et, kupa madalyalarını ve efsanevi unvan rozetlerini topla! Liderlik tablosunda adını zirveye yazdır.
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="leaderboard" className="w-full space-y-6">
                    <TabsList className="bg-slate-100 dark:bg-white/5 p-1.5 rounded-[1.5rem] border border-slate-200 dark:border-white/10 w-fit">
                        <TabsTrigger value="leaderboard" className="rounded-[1.2rem] font-black text-xs uppercase tracking-wider px-6 py-3">
                            🏆 LİDERLİK TABLOSU
                        </TabsTrigger>
                        <TabsTrigger value="predict" className="rounded-[1.2rem] font-black text-xs uppercase tracking-wider px-6 py-3">
                            🎯 MAÇ TAHMİN ET ({upcoming_games.length})
                        </TabsTrigger>
                        <TabsTrigger value="history" className="rounded-[1.2rem] font-black text-xs uppercase tracking-wider px-6 py-3">
                            ⏳ TAHMİN GEÇMİŞİM ({my_predictions.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Leaderboard */}
                    <TabsContent value="leaderboard" className="space-y-6">
                        <Card className="border-none shadow-2xl bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-8 border-b border-neutral-100 dark:border-white/5">
                                <CardTitle className="text-xl font-black uppercase tracking-tighter">Genel Sıralama</CardTitle>
                                <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">TAHMİN LİGİNDEKİ TÜM KATILIMCILAR</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {leaderboard.length === 0 ? (
                                    <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
                                        <Trophy className="h-12 w-12 text-slate-300 opacity-30" />
                                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">Henüz kimse tahminde bulunmadı.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-neutral-100 dark:border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                                    <th className="p-6 text-center w-20">SIRA</th>
                                                    <th className="p-6">TAHMİNCİ</th>
                                                    <th className="p-6 text-center">TOPLAM PUAN</th>
                                                    <th className="p-6 text-center hidden md:table-cell">TAHMİN SAYISI</th>
                                                    <th className="p-6 text-center hidden md:table-cell">TAM SKOR (10P)</th>
                                                    <th className="p-6 text-center hidden md:table-cell">İSABET ORANI</th>
                                                    <th className="p-6 text-center hidden sm:table-cell">ROZETLER</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-50 dark:divide-white/5">
                                                {leaderboard.map((user, idx) => {
                                                    const rank = idx + 1;
                                                    const badges = getUserBadges(user);
                                                    const isMe = user.id === auth.user?.id;

                                                    return (
                                                        <tr key={user.id} className={`group transition-all hover:bg-slate-50 dark:hover:bg-white/[0.01] ${isMe ? 'bg-indigo-50/50 dark:bg-indigo-950/20 font-black' : ''}`}>
                                                            {/* Rank */}
                                                            <td className="p-6 text-center">
                                                                <div className="flex items-center justify-center">
                                                                    {rank === 1 ? (
                                                                        <span className="text-3xl inline-block animate-bounce" title="Altın Kupa">🥇</span>
                                                                    ) : rank === 2 ? (
                                                                        <span className="text-3xl inline-block" title="Gümüş Kupa">🥈</span>
                                                                    ) : rank === 3 ? (
                                                                        <span className="text-3xl inline-block" title="Bronz Kupa">🥉</span>
                                                                    ) : (
                                                                        <span className="text-sm font-black tabular-nums text-muted-foreground">#{rank}</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            
                                                            {/* Name */}
                                                            <td className="p-6">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${isMe ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300'}`}>
                                                                        {user.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm uppercase tracking-tight flex items-center gap-2">
                                                                            {user.name}
                                                                            {isMe && <Badge className="bg-indigo-600 text-white border-none text-[8px] font-black px-2 py-0.5 rounded">SİZ</Badge>}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* Points */}
                                                            <td className="p-6 text-center">
                                                                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                                                                    {user.total_points} Puan
                                                                </span>
                                                            </td>

                                                            {/* Total Predictions */}
                                                            <td className="p-6 text-center text-sm font-bold text-slate-500 tabular-nums hidden md:table-cell">
                                                                {user.total_predictions} Tahmin
                                                            </td>

                                                            {/* Exact Hits */}
                                                            <td className="p-6 text-center hidden md:table-cell">
                                                                <Badge className="bg-emerald-600/10 text-emerald-500 border-none font-black text-xs px-3 py-1 rounded-xl">
                                                                    {user.exact_hits} Kez 🎯
                                                                </Badge>
                                                            </td>

                                                            {/* Accuracy */}
                                                            <td className="p-6 text-center text-sm font-bold text-slate-500 tabular-nums hidden md:table-cell">
                                                                %{user.accuracy}
                                                            </td>

                                                            {/* Badges */}
                                                            <td className="p-6 hidden sm:table-cell">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    {badges.length === 0 ? (
                                                                        <span className="text-xs text-muted-foreground/30 font-black">—</span>
                                                                    ) : (
                                                                        badges.map((badge, bIdx) => {
                                                                            const Icon = badge.icon;
                                                                            return (
                                                                                <Badge 
                                                                                    key={bIdx} 
                                                                                    className={`border font-black text-[9px] px-3 py-1 rounded-xl flex items-center gap-1 uppercase tracking-widest ${badge.color}`}
                                                                                    title={badge.description}
                                                                                >
                                                                                    <Icon className="h-3 w-3" />
                                                                                    {badge.text}
                                                                                </Badge>
                                                                            );
                                                                        })
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 2: Make Predictions */}
                    <TabsContent value="predict" className="space-y-6">
                        {upcoming_games.length === 0 ? (
                            <Card className="border-none shadow-xl bg-white dark:bg-neutral-900 rounded-[2.5rem] p-12 text-center flex flex-col items-center justify-center gap-4">
                                <div className="h-16 w-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center opacity-40">
                                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-tight">TÜM TAHMİNLER TAMAMLANDI!</h3>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest max-w-sm">
                                    Şu anda tahmin edilecek aktif planlı bir maç bulunmuyor. Yeni fikstürler açıklandığında buralar şenlenecek!
                                </p>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {upcoming_games.map((game) => {
                                    const currentGuess = scores[game.id] || { home: '', away: '' };
                                    const hasPredicted = game.user_prediction !== null;
                                    const pred = game.user_prediction;

                                    return (
                                        <Card key={game.id} className={`border rounded-[2.5rem] overflow-hidden shadow-xl transition-all hover:scale-[1.01] ${hasPredicted ? 'bg-emerald-950/5 border-emerald-500/20' : 'bg-white dark:bg-neutral-900 border-slate-100 dark:border-white/5'}`}>
                                            <CardHeader className="p-6 pb-4 border-b border-neutral-100 dark:border-white/5 flex flex-row items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">
                                                        {game.tournament?.name || 'TURNUVA BELİRSİZ'} {game.group ? `• ${game.group.name}` : ''}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                                                        {format(new Date(game.scheduled_at), 'd MMMM HH:mm', { locale: tr })}
                                                    </span>
                                                </div>
                                                {hasPredicted && (
                                                    <Badge className="bg-emerald-600 text-white border-none font-black text-[9px] px-3 py-1 rounded-xl flex items-center gap-1 uppercase tracking-widest">
                                                        <CheckCircle2 className="h-3 w-3" /> TAHMİN YAPILDI
                                                    </Badge>
                                                )}
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-6">
                                                
                                                {/* Score Predictor Row */}
                                                <div className="flex items-center justify-between gap-4">
                                                    {/* Home Team */}
                                                    <div className="flex-1 text-center">
                                                        <p className="font-black text-sm uppercase tracking-tight line-clamp-1">{game.home_team?.name || 'BELİRLENMEDİ'}</p>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">EV SAHİBİ</span>
                                                    </div>

                                                    {/* Guess Form Inputs */}
                                                    <div className="flex items-center gap-2">
                                                        <input 
                                                            type="number"
                                                            min="0"
                                                            placeholder={hasPredicted ? pred?.home_score.toString() : "0"}
                                                            value={currentGuess.home}
                                                            onChange={(e) => handleScoreChange(game.id, 'home', e.target.value)}
                                                            className="w-12 h-12 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center font-black text-xl rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                        <span className="text-lg font-black text-slate-400">:</span>
                                                        <input 
                                                            type="number"
                                                            min="0"
                                                            placeholder={hasPredicted ? pred?.away_score.toString() : "0"}
                                                            value={currentGuess.away}
                                                            onChange={(e) => handleScoreChange(game.id, 'away', e.target.value)}
                                                            className="w-12 h-12 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center font-black text-xl rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </div>

                                                    {/* Away Team */}
                                                    <div className="flex-1 text-center">
                                                        <p className="font-black text-sm uppercase tracking-tight line-clamp-1">{game.away_team?.name || 'BELİRLENMEDİ'}</p>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">DEPLASMAN</span>
                                                    </div>
                                                </div>

                                                {/* Submit Button */}
                                                <div className="flex gap-3">
                                                    <Button 
                                                        onClick={() => submitExactPrediction(game.id)}
                                                        disabled={processingId === game.id || currentGuess.home === '' || currentGuess.away === ''}
                                                        className={`flex-1 rounded-2xl h-12 font-black text-[10px] uppercase tracking-widest ${hasPredicted ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} border-none shadow-lg`}
                                                    >
                                                        {processingId === game.id ? 'TUTULUYOR...' : hasPredicted ? '📈 TAHMİNİ GÜNCELLE' : '🎯 TAHMİNİ KAYDET'}
                                                    </Button>
                                                    
                                                    <Link href={route('games.show', game.id)} className="shrink-0">
                                                        <Button variant="outline" className="border-slate-200 dark:border-white/10 rounded-2xl h-12 px-4 hover:bg-slate-50 dark:hover:bg-white/5">
                                                            <ArrowUpRight className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>

                                                {hasPredicted && (
                                                    <div className="text-center bg-emerald-500/5 dark:bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/10">
                                                        <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                                                            KAYITLI TAHMİNİNİZ: <span className="font-black text-xs ml-1">{pred?.home_score} - {pred?.away_score}</span>
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Anonymous & General Prediction Stats */}
                                                {game.stats && game.stats.total > 0 ? (
                                                    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5">
                                                        <div className="flex justify-between items-center text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                                            <span>💡 KAMUOYU TERCİHİ ({game.stats.total} Tahmin)</span>
                                                            <span className="text-indigo-500 font-black">DAĞILIM</span>
                                                        </div>
                                                        
                                                        {/* Multi-Colored Horizontal Progress Bar */}
                                                        <div className="h-2.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden flex">
                                                            {game.stats.distribution.home > 0 && (
                                                                <div 
                                                                    style={{ width: `${game.stats.distribution.home}%` }} 
                                                                    className="bg-blue-600 h-full flex items-center justify-center transition-all"
                                                                    title={`Ev Sahibi: %${game.stats.distribution.home}`}
                                                                />
                                                            )}
                                                            {game.stats.distribution.draw > 0 && (
                                                                <div 
                                                                    style={{ width: `${game.stats.distribution.draw}%` }} 
                                                                    className="bg-slate-400 dark:bg-white/20 h-full flex items-center justify-center transition-all"
                                                                    title={`Beraberlik: %${game.stats.distribution.draw}`}
                                                                />
                                                            )}
                                                            {game.stats.distribution.away > 0 && (
                                                                <div 
                                                                    style={{ width: `${game.stats.distribution.away}%` }} 
                                                                    className="bg-rose-600 h-full flex items-center justify-center transition-all"
                                                                    title={`Deplasman: %${game.stats.distribution.away}`}
                                                                />
                                                            )}
                                                        </div>

                                                        {/* Percentage Labels */}
                                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                                                            <span className="text-blue-500">MS 1 (%{game.stats.distribution.home})</span>
                                                            <span className="text-slate-400">MS X (%{game.stats.distribution.draw})</span>
                                                            <span className="text-rose-500">MS 2 (%{game.stats.distribution.away})</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="pt-3 border-t border-slate-100 dark:border-white/5 text-center">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Henüz bu maça tahmin yapılmadı. İlk siz olun!</span>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>

                    {/* Tab 3: Prediction History */}
                    <TabsContent value="history" className="space-y-6">
                        {my_predictions.length === 0 ? (
                            <Card className="border-none shadow-xl bg-white dark:bg-neutral-900 rounded-[2.5rem] p-12 text-center flex flex-col items-center justify-center gap-4">
                                <div className="h-16 w-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center opacity-40">
                                    <Clock className="h-8 w-8 text-indigo-500" />
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-tight">HENÜZ TAHMİNİNİZ YOK</h3>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest max-w-sm">
                                    Daha önce hiçbir maç için tahmin yapmamışsınız. Hemen üstteki "Maç Tahmin Et" sekmesinden ilk tahmininizi oluşturun!
                                </p>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {my_predictions.map((pred) => {
                                    const game = pred.game;
                                    const isCompleted = game.status === 'completed';
                                    const isExactHit = pred.status === 'calculated' && pred.points === 10;
                                    const isDiffHit = pred.status === 'calculated' && pred.points === 5;
                                    const isOutcomeHit = pred.status === 'calculated' && pred.points === 3;
                                    const isMiss = pred.status === 'calculated' && pred.points === 0;

                                    return (
                                        <Card key={pred.id} className="border-none shadow-xl bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-l-4 border-l-indigo-500">
                                            {/* Left Block: Match info */}
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                                                        {game.tournament?.name || 'TURNUVA BELİRSİZ'} {game.group ? `• ${game.group.name}` : ''}
                                                    </span>
                                                    <span className="text-muted-foreground/30 font-bold">•</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                                                        {format(new Date(game.scheduled_at), 'd MMMM HH:mm', { locale: tr })}
                                                    </span>
                                                </div>
                                                <h4 className="font-black text-md uppercase tracking-tight flex items-center gap-3">
                                                    {game.home_team?.name || 'BELİRLENMEDİ'}
                                                    <span className="text-slate-300 dark:text-white/20 font-black">vs</span>
                                                    {game.away_team?.name || 'BELİRLENMEDİ'}
                                                </h4>
                                            </div>

                                            {/* Middle Block: Predictions vs Actual Score */}
                                            <div className="flex items-center gap-6 bg-slate-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                                                <div className="text-center min-w-[70px]">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">TAHMİNİNİZ</p>
                                                    <p className="font-black text-lg tabular-nums text-slate-700 dark:text-white">
                                                        {pred.home_score} - {pred.away_score}
                                                    </p>
                                                </div>
                                                
                                                <div className="w-px h-8 bg-slate-200 dark:bg-white/10" />

                                                <div className="text-center min-w-[70px]">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">GERÇEK SKOR</p>
                                                    <p className="font-black text-lg tabular-nums">
                                                        {isCompleted ? `${game.home_score} - ${game.away_score}` : '—'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Right Block: Points / Status */}
                                            <div className="flex items-center gap-4 self-end md:self-auto min-w-[150px] justify-end">
                                                <div className="text-right">
                                                    {isCompleted ? (
                                                        <div className="space-y-1">
                                                            <Badge className={`border-none font-black text-[9px] px-3 py-1 rounded-xl uppercase tracking-widest ${isExactHit ? 'bg-emerald-500/10 text-emerald-500' : isDiffHit ? 'bg-emerald-400/10 text-emerald-400' : isOutcomeHit ? 'bg-blue-500/10 text-blue-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                                {isExactHit ? '🎯 TAM İSABET' : isDiffHit ? '⚖️ DOĞRU FARK' : isOutcomeHit ? '🔮 DOĞRU SONUÇ' : '❌ BAŞARISIZ'}
                                                            </Badge>
                                                            <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                                                                +{pred.points} Puan
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            <Badge className="bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-white/40 border-none font-black text-[9px] px-3 py-1 rounded-xl uppercase tracking-widest">
                                                                ⏳ BEKLENİYOR
                                                            </Badge>
                                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Maç Henüz Başlamadı</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <Link href={route('games.show', game.id)}>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                                                        <ChevronRight className="h-5 w-5" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
