import { Card } from "@/components/ui/card";
import { TrendingUp, Trophy, ChevronRight } from "lucide-react";

interface PredictionLeaderboardProps {
    predictionLeaderboard: any[];
    onLeaderClick: (user: any) => void;
}

export default function PredictionLeaderboard({ predictionLeaderboard, onLeaderClick }: PredictionLeaderboardProps) {
    return (
        <div className="lg:col-span-3 space-y-8 flex flex-col">
            <div className="flex items-center gap-3 border-l-4 border-slate-900 pl-4">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">TAHMİNLER</h2>
            </div>
            <Card className="bg-slate-900 text-white rounded-[3rem] p-6 shadow-2xl relative overflow-hidden flex-grow flex flex-col group hover:bg-slate-950 transition-all duration-500">
                <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-110 transition-transform"><TrendingUp className="h-32 w-32" /></div>
                <div className="space-y-3 relative z-10 flex-grow">
                    {(predictionLeaderboard || []).slice(0, 5).map((user, i) => (
                        <div
                            key={i}
                            onClick={() => onLeaderClick(user)}
                            className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group/item"
                        >
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-black italic ${i < 3 ? 'text-orange-500' : 'text-white/20'}`}>#{i + 1}</span>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black uppercase tracking-tight truncate max-w-[120px]">{user?.name || 'Kullanıcı'}</span>
                                    <span className="text-[10px] font-bold text-white/40 tabular-nums">{user?.total_points ?? 0} Puan</span>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-white/10 group-hover/item:text-orange-500 transition-all" />
                        </div>
                    ))}
                    {(!predictionLeaderboard || predictionLeaderboard.length === 0) && (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-20 h-full">
                            <Trophy className="h-12 w-12 mb-3" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Tahmin yok</p>
                        </div>
                    )}
                </div>
                <div className="relative z-10 pt-4 border-t border-white/5 mt-4">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] text-center">TOPLAM {predictionLeaderboard?.length || 0} KATILIMCI</p>
                </div>
            </Card>
        </div>
    );
}
