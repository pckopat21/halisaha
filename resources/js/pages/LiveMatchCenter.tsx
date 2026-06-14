import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Play, Tv } from "lucide-react";
import MatchDateWithPrediction from "@/components/welcome/MatchDateWithPrediction";
import {
    fadeUp,
    staggerContainer,
    staggerItem,
    defaultTransition,
    hoverLift,
    useReducedMotion,
    sectionTitleClass,
} from "@/lib/motion-presets";

interface LiveMatchCenterProps {
    liveMatches: any[];
    upcomingFixtures: any[];
    onWatchLive: (match: any) => void;
    onPredict: (game: any) => void;
    getTeamName: (team: any) => string;
    getMatchDateMeta: (dateString: string | null) => any;
    getExistingPrediction: (gameId: number | undefined) => any;
}

export default function LiveMatchCenter({
    liveMatches,
    upcomingFixtures,
    onWatchLive,
    onPredict,
    getTeamName,
    getMatchDateMeta,
    getExistingPrediction
}: LiveMatchCenterProps) {
    const reduced = useReducedMotion();

    if ((liveMatches || []).length === 0 && (upcomingFixtures || []).length === 0) return null;

    return (
        <motion.section
            className="container mx-auto px-6 mb-32 max-w-7xl relative z-30"
            initial={reduced ? false : { opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={defaultTransition}
        >
            <div className={`flex items-center gap-3 mb-12 ${sectionTitleClass}`}>
                <h2 className="text-3xl font-black uppercase tracking-tighter">
                    {(liveMatches || []).length > 0 ? 'CANLI MAÇ MERKEZİ' : 'SIRADAKİ HEYECAN'}
                </h2>
            </div>

            {(liveMatches || []).length > 0 ? (
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
                    variants={reduced ? undefined : staggerContainer}
                    initial={reduced ? false : 'hidden'}
                    whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                >
                    {liveMatches.map((match) => (
                        <motion.div
                            key={match?.id}
                            variants={reduced ? undefined : staggerItem}
                            whileHover={hoverLift(reduced)}
                            className="group/card"
                        >
                            <Link href={`/games/${match?.id}`}>
                                <Card className="border-orange-200 bg-white/80 backdrop-blur-md rounded-2xl md:rounded-[2rem] px-3 py-5 md:p-6 shadow-xl shadow-orange-600/5 hover:border-orange-600 transition-all border-2 relative cursor-pointer hover:shadow-2xl">
                                    <div className="flex flex-col gap-3 md:gap-4">
                                        <div className="flex items-center justify-between pb-3 border-b border-orange-100">
                                            <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{typeof match?.group === 'object' ? match?.group?.name : match?.group || 'Grup'}</span>
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-orange-600 text-white px-3 py-0.5 rounded-full font-black tabular-nums text-[10px]">{match?.current_minute || match?.minute || '0'}'</Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 md:gap-4">
                                            <div className="flex-1 text-right min-w-0">
                                                <span className="text-[10px] md:text-sm font-black uppercase leading-tight block truncate text-slate-900">{getTeamName(match?.home_team || match?.homeTeam)}</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 shrink-0">
                                                <div className="bg-slate-900 text-white px-3 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-4 shadow-xl border border-white/10">
                                                    <span className="text-xl md:text-3xl font-black tabular-nums">{match?.home_score ?? 0}</span>
                                                    <span className="text-sm md:text-xl font-black text-orange-500">:</span>
                                                    <span className="text-xl md:text-3xl font-black tabular-nums">{match?.away_score ?? 0}</span>
                                                </div>
                                                <span className="text-[8px] font-black text-orange-600 animate-pulse uppercase tracking-widest">CANLI</span>
                                            </div>
                                            <div className="flex-1 text-left min-w-0">
                                                <span className="text-[10px] md:text-sm font-black uppercase leading-tight block truncate text-slate-900">{getTeamName(match?.away_team || match?.awayTeam)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                            {match?.live_stream_url && (
                                <Button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWatchLive(match); }}
                                    className="w-full mt-2 h-10 md:h-11 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-[9px] md:text-[10px] rounded-xl md:rounded-2xl shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                                >
                                    <Play className="h-3.5 w-3.5 fill-current" />
                                    <span>CANLI İZLE</span>
                                    <Tv className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
                    variants={reduced ? undefined : staggerContainer}
                    initial={reduced ? false : 'hidden'}
                    whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                >
                    {(upcomingFixtures || []).slice(0, 2).map((game, idx) => {
                        const dateMeta = getMatchDateMeta(game?.scheduled_at);
                        const existingPred = getExistingPrediction(game?.id);
                        return (
                            <motion.div key={game?.id ?? idx} variants={reduced ? undefined : staggerItem} whileHover={hoverLift(reduced)}>
                                <Card className="border-orange-100 bg-white/80 backdrop-blur-md rounded-2xl md:rounded-[2rem] px-3 py-5 md:p-6 shadow-sm hover:shadow-xl transition-all border">
                                    <div className="flex flex-col gap-3 md:gap-4">
                                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-orange-50">
                                            <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">{typeof game?.group === 'object' ? game?.group?.name : game?.group || 'Grup'}</span>
                                            <MatchDateWithPrediction
                                                dateMeta={dateMeta}
                                                existingPrediction={existingPred}
                                                onPredict={() => onPredict(game)}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 md:gap-4">
                                            <div className="flex-1 text-right min-w-0">
                                                <span className="text-[10px] md:text-sm font-black uppercase leading-tight block truncate text-slate-900">{getTeamName(game?.home_team || game?.homeTeam)}</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 shrink-0">
                                                <div className="bg-orange-50 text-orange-600 px-2.5 md:px-4 py-1.5 rounded-lg flex items-center gap-1.5 border border-orange-100 shadow-sm">
                                                    <span className="text-[10px] md:text-sm font-black tabular-nums">{dateMeta.time}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 text-left min-w-0">
                                                <span className="text-[10px] md:text-sm font-black uppercase leading-tight block truncate text-slate-900">{getTeamName(game?.away_team || game?.awayTeam)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </motion.section>
    );
}
