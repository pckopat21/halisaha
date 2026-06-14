import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { router } from "@inertiajs/react";

interface LeaderPredictionsModalProps {
    user: any;
    isOpen: boolean;
    onClose: () => void;
    predictions: any[];
    loading: boolean;
    allUpcomingGames: any[];
    auth: any;
    getTeamName: (team: any) => string;
    fetchLeaderPredictions: (user: any) => void;
}

export default function LeaderPredictionsModal({
    user,
    isOpen,
    onClose,
    predictions,
    loading,
    allUpcomingGames,
    auth,
    getTeamName,
    fetchLeaderPredictions
}: LeaderPredictionsModalProps) {
    if (!user) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6 bg-slate-950/95 backdrop-blur-md"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 30 }}
                        animate={{ scale: 1, y: 0 }}
                        className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 md:p-10 border-b border-slate-100 bg-slate-50">
                            <div className="flex items-center gap-4 md:gap-6">
                                <div className="h-12 w-12 md:h-16 md:w-16 bg-orange-600 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-600/20">
                                    <Trophy className="h-6 w-6 md:h-8 md:w-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-slate-900 leading-tight">
                                        {user.name} <span className="text-orange-600">TAHMİNLERİ</span>
                                    </h2>
                                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 md:mt-2">
                                        LİDER TABLOSUNDA {user.total_points} PUAN İLE YER ALIYOR
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={onClose}
                                variant="ghost"
                                className="h-12 w-12 md:h-14 md:w-14 rounded-2xl md:rounded-[2rem] text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all p-0"
                            >
                                <X className="h-6 w-6 md:h-8 md:w-8" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 md:p-10 space-y-6 md:space-y-8 custom-scrollbar bg-[#fafafa]">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-6">
                                    <div className="h-14 w-14 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin"></div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Tahminler Yükleniyor...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-2 w-2 bg-orange-600 rounded-full"></div>
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">YAPILAN TAHMİNLER</h3>
                                        </div>
                                        {predictions && predictions.length > 0 ? (
                                            predictions.map((pred, i) => {
                                                const isOwnPrediction = auth?.user?.id === pred.user_id;
                                                const isGameScheduled = pred.game?.status === 'scheduled';

                                                return (
                                                    <div key={i} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 hover:border-orange-200 transition-all duration-300">
                                                        <div className="flex items-center justify-between mb-5">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">{pred.game?.group?.name || 'GRUP MAÇI'}</span>
                                                            <Badge className={`${pred.status === 'calculated' ? (pred.points > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white') : 'bg-slate-200 text-slate-600'} border-none font-black text-[10px] px-4 py-1.5 rounded-xl`}>
                                                                {pred.status === 'calculated' ? `+${pred.points} PUAN` : 'SONUÇ BEKLENİYOR'}
                                                            </Badge>
                                                        </div>
                                                        <div className="grid grid-cols-3 items-center gap-4">
                                                            <div className="text-right">
                                                                <p className="text-xs md:text-sm font-black uppercase truncate text-slate-900">{getTeamName(pred.game?.homeTeam || pred.game?.home_team)}</p>
                                                            </div>
                                                            <div className="flex flex-col items-center gap-3">
                                                                {isOwnPrediction && isGameScheduled ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <input
                                                                            type="number"
                                                                            defaultValue={pred.home_score}
                                                                            onChange={(e) => {
                                                                                const val = parseInt(e.target.value);
                                                                                router.post('/predictions', {
                                                                                    game_id: pred.game_id,
                                                                                    home_score: val,
                                                                                    away_score: pred.away_score
                                                                                }, { preserveScroll: true });
                                                                            }}
                                                                            className="w-12 h-12 text-center bg-slate-900 text-white font-black rounded-xl border-none focus:ring-2 focus:ring-orange-500"
                                                                        />
                                                                        <span className="text-slate-400 font-bold">-</span>
                                                                        <input
                                                                            type="number"
                                                                            defaultValue={pred.away_score}
                                                                            onChange={(e) => {
                                                                                const val = parseInt(e.target.value);
                                                                                router.post('/predictions', {
                                                                                    game_id: pred.game_id,
                                                                                    home_score: pred.home_score,
                                                                                    away_score: val
                                                                                }, { preserveScroll: true });
                                                                            }}
                                                                            className="w-12 h-12 text-center bg-slate-900 text-white font-black rounded-xl border-none focus:ring-2 focus:ring-orange-500"
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-3 px-6 py-2.5 bg-slate-900 rounded-[1.25rem] shadow-2xl">
                                                                        <span className="text-xl md:text-2xl font-black text-white tabular-nums">{pred.home_score}</span>
                                                                        <span className="text-white/30 font-bold text-lg">-</span>
                                                                        <span className="text-xl md:text-2xl font-black text-white tabular-nums">{pred.away_score}</span>
                                                                    </div>
                                                                )}

                                                                {pred.game?.status === 'completed' && (
                                                                    <div className="flex flex-col items-center">
                                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">MAÇ SONUCU</p>
                                                                        <p className="text-xs font-black text-orange-600 italic">{pred.game?.home_score} - {pred.game?.away_score}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="text-xs md:text-sm font-black uppercase truncate text-slate-900">{getTeamName(pred.game?.awayTeam || pred.game?.away_team)}</p>
                                                            </div>
                                                        </div>
                                                        {isOwnPrediction && isGameScheduled && (
                                                            <p className="mt-4 text-center text-[8px] font-black text-orange-600 uppercase tracking-widest animate-pulse">Skoru değiştirebilirsin</p>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-center py-10 text-slate-300 font-black uppercase text-[10px] tracking-widest bg-white rounded-3xl border border-dashed">Tahmin bulunmuyor.</p>
                                        )}
                                    </div>

                                    {auth?.user?.id === user.id && (
                                        <div className="space-y-5 pt-8 border-t border-slate-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-2 w-2 bg-slate-400 rounded-full"></div>
                                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TAHMİN YAPILABİLECEK TÜM MAÇLAR</h3>
                                            </div>
                                            {allUpcomingGames.filter(game => !predictions.some(p => p.game_id === game.id)).length > 0 ? (
                                                allUpcomingGames.filter(game => !predictions.some(p => p.game_id === game.id)).map((game, i) => (
                                                    <div key={`new-${i}`} className="bg-slate-50 rounded-[2.5rem] p-6 border border-slate-200 hover:border-orange-200 transition-all">
                                                        <div className="flex items-center justify-between mb-5">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{game.group?.name || 'SIRADAKİ MAÇ'}</span>
                                                            <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest animate-bounce">Tahmin Yap!</span>
                                                        </div>
                                                        <div className="grid grid-cols-3 items-center gap-4">
                                                            <div className="text-right">
                                                                <p className="text-xs md:text-sm font-black uppercase truncate text-slate-900">{getTeamName(game.homeTeam || game.home_team)}</p>
                                                            </div>
                                                            <div className="flex items-center justify-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    placeholder="0"
                                                                    onChange={(e) => {
                                                                        const val = parseInt(e.target.value);
                                                                        if (!isNaN(val)) {
                                                                            router.post('/predictions', {
                                                                                game_id: game.id,
                                                                                home_score: val,
                                                                                away_score: 0 
                                                                            }, { preserveScroll: true, onSuccess: () => fetchLeaderPredictions(user) });
                                                                        }
                                                                    }}
                                                                    className="w-12 h-12 text-center bg-white text-slate-900 font-black rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500"
                                                                />
                                                                <span className="text-slate-300 font-bold">-</span>
                                                                <input
                                                                    type="number"
                                                                    placeholder="0"
                                                                    onChange={(e) => {
                                                                        const val = parseInt(e.target.value);
                                                                        if (!isNaN(val)) {
                                                                            router.post('/predictions', {
                                                                                game_id: game.id,
                                                                                home_score: 0, 
                                                                                away_score: val
                                                                            }, { preserveScroll: true, onSuccess: () => fetchLeaderPredictions(user) });
                                                                        }
                                                                    }}
                                                                    className="w-12 h-12 text-center bg-white text-slate-900 font-black rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500"
                                                                />
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="text-xs md:text-sm font-black uppercase truncate text-slate-900">{getTeamName(game.awayTeam || game.away_team)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-center py-10 text-slate-400 font-black uppercase text-[9px] tracking-widest italic">Tüm maçlar için tahmin yaptın! Tebrikler.</p>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
