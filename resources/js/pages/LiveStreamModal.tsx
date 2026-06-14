import { motion, AnimatePresence } from "framer-motion";
import { X, Tv, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getYoutubeEmbedUrl } from "@/lib/youtube";
import { springTransition, useReducedMotion } from "@/lib/motion-presets";

interface LiveStreamModalProps {
    match: any;
    isOpen: boolean;
    onClose: () => void;
    getTeamName: (team: any) => string;
}

export default function LiveStreamModal({
    match,
    isOpen,
    onClose,
    getTeamName,
}: LiveStreamModalProps) {
    const reduced = useReducedMotion();

    if (!match) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 bg-slate-950/98 backdrop-blur-3xl"
                    onClick={onClose}
                >
                    <motion.div
                        initial={reduced ? { opacity: 1 } : { scale: 0.9, y: 30, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={reduced ? { opacity: 0 } : { scale: 0.92, y: 20, opacity: 0 }}
                        transition={springTransition}
                        className="bg-slate-900 rounded-[2.5rem] w-full max-w-5xl shadow-2xl border border-white/10 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30">
                                    <Tv className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter text-white">
                                        CANLI <span className="text-red-500">YAYIN</span>
                                    </h2>
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                                        {getTeamName(match?.home_team || match?.homeTeam)} vs {getTeamName(match?.away_team || match?.awayTeam)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <a
                                    href={match?.live_stream_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hidden md:flex items-center gap-2 text-[10px] font-black text-white/50 hover:text-white uppercase tracking-widest transition-colors"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    YouTube'da Aç
                                </a>
                                <Button
                                    onClick={onClose}
                                    variant="ghost"
                                    className="h-12 w-12 rounded-2xl text-white/50 hover:bg-white/10 hover:text-white transition-all"
                                >
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>
                        </div>
                        <motion.div
                            className="relative w-full"
                            style={{ paddingBottom: '56.25%' }}
                            initial={reduced ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.15, duration: 0.4 }}
                        >
                            <iframe
                                src={getYoutubeEmbedUrl(match?.live_stream_url) || ''}
                                className="absolute inset-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                title="Canlı Yayın"
                            />
                        </motion.div>
                        <div className="p-4 md:p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Canlı</span>
                            </div>
                            <div className="bg-white/10 text-white px-5 py-2 rounded-xl text-xs font-black">
                                {getTeamName(match?.home_team || match?.homeTeam)} {match?.home_score ?? 0} - {match?.away_score ?? 0} {getTeamName(match?.away_team || match?.awayTeam)}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
