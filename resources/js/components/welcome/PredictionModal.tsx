import { motion, AnimatePresence } from "framer-motion";
import { X, Activity } from "lucide-react";
import { Link, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { springTransition, staggerContainer, staggerItem, useReducedMotion } from "@/lib/motion-presets";

interface PredictionModalProps {
    game: any;
    isOpen: boolean;
    onClose: () => void;
    auth: any;
    predictionForm: any;
    predictionError: string | null;
    submitting: boolean;
    gameStats: any;
    handlePredictionSubmit: (e: React.FormEvent) => void;
    getExistingPrediction: (gameId: number | undefined) => any;
    getTeamName: (team: any) => string;
}

export default function PredictionModal({
    game,
    isOpen,
    onClose,
    auth,
    predictionForm,
    predictionError,
    submitting,
    gameStats,
    handlePredictionSubmit,
    getExistingPrediction,
    getTeamName
}: PredictionModalProps) {
    const reduced = useReducedMotion();

    if (!game) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-950/90 backdrop-blur-2xl"
                    onClick={onClose}
                >
                    <motion.div
                        initial={reduced ? { opacity: 1 } : { y: 100, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={reduced ? { opacity: 0 } : { y: 80, opacity: 0, scale: 0.95 }}
                        transition={springTransition}
                        className="bg-white rounded-t-3xl md:rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl text-slate-950 border border-slate-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg md:text-xl font-black uppercase tracking-tight">
                                SKOR <span className="text-orange-600">TAHMİNLERİ</span>
                            </h2>
                            <button onClick={onClose} className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {!auth?.user ? (
                            <motion.div
                                className="space-y-6"
                                variants={reduced ? undefined : staggerContainer}
                                initial={reduced ? false : 'hidden'}
                                animate="visible"
                            >
                                <motion.div variants={reduced ? undefined : staggerItem} className="bg-orange-50 rounded-[2rem] p-6 border border-orange-100 space-y-4">
                                    <div className="flex flex-col items-center text-center gap-2">
                                        <div className="h-10 w-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-600/20">!</div>
                                        <p className="text-xs font-black text-slate-900 uppercase">GİRİŞ YAPMALISINIZ</p>
                                        <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                                            Skor tahmini yapıp puan kazanmak ve liderlik tablosunda yarışmak için giriş yapmalısınız.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Link href="/login" className="w-full">
                                            <Button variant="outline" className="w-full h-10 rounded-xl font-black text-[9px] uppercase border-slate-200">GİRİŞ YAP</Button>
                                        </Link>
                                        <Link href="/register" className="w-full">
                                            <Button className="w-full h-10 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black text-[9px] uppercase border-none">KAYIT OL</Button>
                                        </Link>
                                    </div>
                                </motion.div>

                                <motion.div variants={reduced ? undefined : staggerItem} className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">VEYA MAÇ SONUCUNU OYLA</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: 'EV SAHİBİ', outcome: 'home', display: '1' },
                                            { label: 'BERABERLİK', outcome: 'draw', display: 'X' },
                                            { label: 'DEPLASMAN', outcome: 'away', display: '2' }
                                        ].map((item) => (
                                            <motion.button
                                                key={item.outcome}
                                                whileHover={reduced ? undefined : { scale: 1.05 }}
                                                whileTap={reduced ? undefined : { scale: 0.97 }}
                                                onClick={() => router.post('/predictions', { game_id: game.id, outcome: item.outcome }, { preserveScroll: true, onSuccess: onClose })}
                                                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-2xl transition-all group ${getExistingPrediction(game.id)?.outcome === item.outcome ? 'bg-orange-600 border-orange-600' : 'bg-slate-50 border-slate-100 hover:border-orange-600 hover:bg-white'}`}
                                            >
                                                <span className={`text-xl font-black ${getExistingPrediction(game.id)?.outcome === item.outcome ? 'text-white' : 'text-slate-400 group-hover:text-orange-600'}`}>{item.display}</span>
                                                <span className={`text-[8px] font-black uppercase ${getExistingPrediction(game.id)?.outcome === item.outcome ? 'text-white' : 'text-slate-900'}`}>{item.label}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            </motion.div>
                        ) : (
                            <motion.form
                                onSubmit={handlePredictionSubmit}
                                className="space-y-5"
                                variants={reduced ? undefined : staggerContainer}
                                initial={reduced ? false : 'hidden'}
                                animate="visible"
                            >
                                <motion.div variants={reduced ? undefined : staggerItem} className="flex items-center gap-3">
                                    <div className="flex-1 text-center">
                                        <p className="text-[10px] font-black uppercase text-slate-500 mb-3 truncate px-1">{getTeamName(game?.home_team || game?.homeTeam)}</p>
                                        <input
                                            type="number"
                                            min="0"
                                            max="99"
                                            required
                                            placeholder="0"
                                            className="w-full h-16 md:h-20 bg-slate-50 rounded-2xl text-center text-3xl md:text-4xl font-black border-none ring-2 ring-slate-100 focus:ring-orange-500 focus:bg-white transition-all"
                                            value={predictionForm.data.home_score}
                                            onChange={e => predictionForm.setData('home_score', e.target.value)}
                                        />
                                    </div>
                                    <div className="text-2xl font-black text-slate-300 pt-5">:</div>
                                    <div className="flex-1 text-center">
                                        <p className="text-[10px] font-black uppercase text-slate-500 mb-3 truncate px-1">{getTeamName(game?.away_team || game?.awayTeam)}</p>
                                        <input
                                            type="number"
                                            min="0"
                                            max="99"
                                            required
                                            placeholder="0"
                                            className="w-full h-16 md:h-20 bg-slate-50 rounded-2xl text-center text-3xl md:text-4xl font-black border-none ring-2 ring-slate-100 focus:ring-orange-500 focus:bg-white transition-all"
                                            value={predictionForm.data.away_score}
                                            onChange={e => predictionForm.setData('away_score', e.target.value)}
                                        />
                                    </div>
                                </motion.div>

                                {predictionError && (
                                    <motion.div variants={reduced ? undefined : staggerItem} className="text-red-500 text-xs text-center font-bold bg-red-50 rounded-xl py-2 px-3">
                                        {predictionError}
                                    </motion.div>
                                )}

                                <motion.div variants={reduced ? undefined : staggerItem}>
                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full h-12 md:h-14 bg-slate-900 text-white hover:bg-orange-600 font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-slate-900/20 hover:shadow-orange-600/30 transition-all hover:scale-[1.02] border-none text-[10px] md:text-xs"
                                    >
                                        {submitting
                                            ? 'GÖNDERİLİYOR...'
                                            : getExistingPrediction(game?.id)
                                                ? 'TAHMİNİ GÜNCELLE'
                                                : 'TAHMİNİ KAYDET'
                                        }
                                    </Button>
                                </motion.div>
                            </motion.form>
                        )}

                        {gameStats && (
                            <motion.div
                                className="mt-8 pt-6 border-t border-slate-100 space-y-5"
                                initial={reduced ? false : { opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                        <Activity className="h-3.5 w-3.5 text-orange-600" /> TOPLULUK ANALİZİ
                                    </h3>
                                    <span className="text-[9px] font-black text-slate-400 uppercase">{gameStats.total} TOPLAM OY</span>
                                </div>

                                <div className="space-y-3.5">
                                    {[
                                        { label: 'EV SAHİBİ', key: 'home', color: 'bg-orange-600' },
                                        { label: 'BERABERLİK', key: 'draw', color: 'bg-slate-300' },
                                        { label: 'DEPLASMAN', key: 'away', color: 'bg-slate-900' }
                                    ].map((item) => (
                                        <div key={item.key} className="space-y-1">
                                            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                                <span className="text-slate-500">{item.label}</span>
                                                <span className="text-slate-900">{gameStats.counts?.[item.key] ?? 0} OY (%{gameStats.distribution?.[item.key] ?? 0})</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${gameStats.distribution?.[item.key] ?? 0}%` }}
                                                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                                    className={`h-full ${item.color}`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {gameStats.common_scores?.length > 0 && (
                                    <div className="pt-2 space-y-2.5">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">POPÜLER SKORLAR</p>
                                        <div className="flex flex-wrap gap-2">
                                            {gameStats.common_scores.map((s: any, i: number) => (
                                                <div key={i} className="px-3 py-1.5 bg-slate-50 rounded-xl flex items-center gap-2 border border-slate-100">
                                                    <span className="text-[10px] font-black text-slate-900 tabular-nums">{s.score}</span>
                                                    <span className="text-[8px] font-black text-orange-600 bg-orange-50 px-1.5 rounded-md">{s.count} TAHMİN</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
