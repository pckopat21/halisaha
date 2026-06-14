import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { TrendingUp, Trophy, ChevronRight } from "lucide-react";
import { staggerContainer, staggerItem, useReducedMotion, sectionTitleClass } from "@/lib/motion-presets";

interface PredictionLeaderboardProps {
    predictionLeaderboard: any[];
    onLeaderClick: (user: any) => void;
}

export default function PredictionLeaderboard({ predictionLeaderboard, onLeaderClick }: PredictionLeaderboardProps) {
    const reduced = useReducedMotion();

    return (
        <div className="lg:col-span-3 space-y-8 flex flex-col">
            <div className={`flex items-center gap-3 ${sectionTitleClass} border-slate-900`}>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">TAHMİNLER</h2>
            </div>
            <Card className="bg-slate-900 text-white rounded-[3rem] p-6 shadow-2xl relative overflow-hidden flex-grow flex flex-col group hover:bg-slate-950 transition-all duration-500">
                <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-110 transition-transform"><TrendingUp className="h-32 w-32" /></div>
                <motion.div
                    className="space-y-3 relative z-10 flex-grow"
                    variants={reduced ? undefined : staggerContainer}
                    initial={reduced ? false : 'hidden'}
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {(predictionLeaderboard || []).slice(0, 5).map((user, i) => (
                        <motion.div
                            key={user?.id ?? i}
                            variants={reduced ? undefined : staggerItem}
                            onClick={() => onLeaderClick(user)}
                            className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group/item"
                            whileHover={reduced ? undefined : { x: 6 }}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-black italic ${i < 3 ? 'text-orange-500' : 'text-white/20'}`}>#{i + 1}</span>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[11px] font-black uppercase tracking-tight truncate max-w-[120px]">{user?.name || 'Kullanıcı'}</span>
                                        {i === 0 && (
                                            <span title="Lider / Altın Madalya">
                                                <Trophy className="h-3.5 w-3.5 text-yellow-400 shrink-0 animate-bounce" />
                                            </span>
                                        )}
                                        {i === 1 && (
                                            <span title="İkinci / Gümüş Madalya">
                                                <Trophy className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                                            </span>
                                        )}
                                        {i === 2 && (
                                            <span title="Üçüncü / Bronz Madalya">
                                                <Trophy className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="text-[10px] font-bold text-white/40 tabular-nums">{user?.total_points ?? 0} Puan</span>
                                        {parseInt(user?.exact_hits) >= 1 && (
                                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 text-[6px] font-black uppercase rounded shrink-0 tracking-wide" title={`${user?.exact_hits} Skor İsabeti - Keskin Nişancı`}>
                                                🎯 KESKİN
                                            </span>
                                        )}
                                        {parseInt(user?.accuracy) >= 30 && parseInt(user?.total_predictions) >= 3 && (
                                            <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1 py-0.5 text-[6px] font-black uppercase rounded shrink-0 tracking-wide" title={`%${user?.accuracy} İsabet Oranı - Kahin`}>
                                                🔮 KAHİN
                                            </span>
                                        )}
                                        {parseInt(user?.total_predictions) >= 5 && (
                                            <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1 py-0.5 text-[6px] font-black uppercase rounded shrink-0 tracking-wide" title={`${user?.total_predictions} Tahmin - İstikrarlı`}>
                                                ⚡ AKTİF
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-white/10 group-hover/item:text-orange-500 transition-all" />
                        </motion.div>
                    ))}
                    {(!predictionLeaderboard || predictionLeaderboard.length === 0) && (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-20 h-full">
                            <Trophy className="h-12 w-12 mb-3" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Tahmin yok</p>
                        </div>
                    )}
                </motion.div>
                <div className="relative z-10 pt-4 border-t border-white/5 mt-4">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] text-center">TOPLAM {predictionLeaderboard?.length || 0} KATILIMCI</p>
                </div>
            </Card>
        </div>
    );
}
