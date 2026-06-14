import { Link } from "@inertiajs/react";
import { Play, Target } from "lucide-react";

interface MatchListProps {
    lastResults: any[];
    upcomingFixtures: any[];
    onWatchLive: (match: any) => void;
    onPredict: (game: any) => void;
    getTeamName: (team: any) => string;
    getMatchDateMeta: (dateString: string | null) => any;
    getExistingPrediction: (gameId: number | undefined) => any;
}

export default function MatchList({
    lastResults,
    upcomingFixtures,
    onWatchLive,
    onPredict,
    getTeamName,
    getMatchDateMeta,
    getExistingPrediction
}: MatchListProps) {
    return (
        <section className="container mx-auto px-6 mb-32 max-w-7xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div className="flex items-center justify-between border-l-4 border-slate-900 pl-4">
                        <h2 className="text-2xl font-black uppercase tracking-tighter">SON SONUÇLAR</h2>
                        <Link href="/games" className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline">TÜMÜ</Link>
                    </div>
                    <div className="bg-white border border-orange-100 rounded-[2.5rem] p-8 shadow-sm space-y-4">
                        {(lastResults || []).length > 0 ? lastResults.map((game, idx) => {
                            const dateMeta = getMatchDateMeta(game?.scheduled_at);
                            return (
                                <div key={idx} className="border-b border-slate-50 last:border-none pb-4 last:pb-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{typeof game?.group === 'object' ? game?.group?.name : game?.group || 'Grup'}</span>
                                        <span className="text-[9px] font-bold text-orange-600 uppercase">{dateMeta.fullDate}</span>
                                    </div>
                                    <Link href={`/games/${game?.id}`}>
                                        <div className="flex items-center justify-between mb-2 hover:bg-slate-50 rounded-xl px-1 py-1 -mx-1 transition-colors cursor-pointer">
                                            <div className="grid grid-cols-[1fr_50px_1fr] items-center gap-4 flex-1">
                                                <span className="text-xs font-bold text-slate-800 text-right truncate">{getTeamName(game?.home_team || game?.homeTeam)}</span>
                                                <div className="bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-lg text-center">
                                                    {game?.home_score ?? 0}-{game?.away_score ?? 0}
                                                </div>
                                                <span className="text-xs font-bold text-slate-800 text-left truncate">{getTeamName(game?.away_team || game?.awayTeam)}</span>
                                            </div>
                                        </div>
                                    </Link>
                                    {game?.live_stream_url && (
                                        <button
                                            onClick={() => onWatchLive(game)}
                                            className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 transition-colors cursor-pointer"
                                        >
                                            <Play className="h-3 w-3 fill-current" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Maçı İzle</span>
                                        </button>
                                    )}
                                </div>
                            )
                        }) : (
                            <p className="text-center text-slate-400 py-12 text-sm font-medium italic text-[10px] uppercase">Henüz tamamlanan maç yok.</p>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="flex items-center justify-between border-l-4 border-orange-600 pl-4">
                        <h2 className="text-2xl font-black uppercase tracking-tighter">GELECEK MAÇLAR</h2>
                        <Link href="/games" className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline">FİKSTÜR</Link>
                    </div>
                    <div className="bg-white border border-orange-100 rounded-[2.5rem] p-8 shadow-sm space-y-4">
                        {(upcomingFixtures || []).length > 0 ? upcomingFixtures.map((game, idx) => {
                            const dateMeta = getMatchDateMeta(game?.scheduled_at);
                            return (
                                <div key={idx} className="border-b border-slate-50 last:border-none pb-4 last:pb-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{typeof game?.group === 'object' ? game?.group?.name : game?.group || 'Grup'}</span>
                                        <span className="text-[9px] font-bold text-orange-600 uppercase">{dateMeta.dayLabel === 'Bugün' ? 'BUGÜN' : dateMeta.fullDate}</span>
                                    </div>
                                    <div className="grid grid-cols-[1fr_60px_1fr] items-center gap-4 flex-1">
                                        <span className="text-xs md:text-sm font-black text-slate-900 text-right truncate">{getTeamName(game?.home_team || game?.homeTeam)}</span>
                                        <div className="bg-orange-50 text-orange-600 text-[10px] font-black px-2 py-1.5 rounded-lg text-center border border-orange-100">
                                            {dateMeta.time}
                                        </div>
                                        <span className="text-xs md:text-sm font-black text-slate-900 text-left truncate">{getTeamName(game?.away_team || game?.awayTeam)}</span>
                                    </div>
                                    <button
                                        onClick={() => onPredict(game)}
                                        className={`flex items-center justify-center gap-1.5 w-full mt-2 py-1.5 rounded-lg border transition-colors cursor-pointer ${getExistingPrediction(game?.id)
                                            ? 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700'
                                            : 'bg-orange-50 hover:bg-orange-100 border-orange-100 text-orange-600'
                                            }`}
                                    >
                                        <Target className="h-3 w-3" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">
                                            {getExistingPrediction(game?.id) ? 'Tahmini Görüntüle / Güncelle' : 'Tahmin Yap'}
                                        </span>
                                    </button>
                                </div>
                            )
                        }) : (
                            <p className="text-center text-slate-400 py-12 text-sm font-medium italic text-[10px] uppercase">Planlanmış maç bulunmuyor.</p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
