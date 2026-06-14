import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Trophy, Star, Target, Activity, Shield, Zap, Calendar } from "lucide-react";
import {
    staggerContainer,
    staggerItem,
    defaultTransition,
    useReducedMotion,
} from "@/lib/motion-presets";

interface TournamentStatsProps {
    homepageStats: any;
}

export default function TournamentStats({ homepageStats }: TournamentStatsProps) {
    const reduced = useReducedMotion();

    return (
        <motion.section
            className="bg-orange-50/50 border-y border-orange-100 py-32 px-6 relative z-10"
            initial={reduced ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={defaultTransition}
        >
            <div className="container mx-auto max-w-7xl">
                <motion.div
                    className="text-center mb-20"
                    initial={reduced ? false : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={defaultTransition}
                >
                    <Badge className="bg-orange-600 text-white border-none mb-4 px-10 py-2.5 rounded-full uppercase font-black text-[10px] tracking-[0.4em]">ARENA ANALYTICS</Badge>
                    <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter text-slate-900">TURNUVA LİDERLERİ</h2>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    variants={reduced ? undefined : staggerContainer}
                    initial={reduced ? false : 'hidden'}
                    whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                >
                    <motion.div variants={reduced ? undefined : staggerItem}>
                        <Card className="bg-white/90 backdrop-blur-md border-none rounded-[2.5rem] p-10 shadow-xl shadow-orange-600/5 flex flex-col h-full border-t-4 border-slate-900 hover:shadow-2xl transition-shadow">
                            <h3 className="text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] mb-10 flex items-center">
                                <Zap className="mr-3 h-5 w-5 text-orange-600" /> GENEL ÖZET
                            </h3>
                            <div className="space-y-8 flex-1">
                                {[
                                    { label: 'Toplam Gol', value: homepageStats?.summary?.total_goals ?? 0, icon: Target },
                                    { label: 'Maç Başı Ort.', value: homepageStats?.summary?.avg_goals ?? 0, icon: Activity },
                                    { label: 'Kart Sayısı', value: homepageStats?.summary?.total_cards ?? 0, color: 'text-orange-600', icon: Shield },
                                    { label: 'Oynanan Maç', value: homepageStats?.summary?.played_matches ?? 0, icon: Calendar }
                                ].map((s, i) => (
                                    <motion.div
                                        key={i}
                                        className="flex items-center justify-between border-b border-slate-50 pb-6 last:border-none"
                                        initial={reduced ? false : { opacity: 0, x: -12 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.06, ...defaultTransition }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <s.icon className="h-4 w-4 text-slate-300" />
                                            <span className="text-slate-500 text-sm font-bold uppercase tracking-widest text-[10px]">{s.label}</span>
                                        </div>
                                        <span className={`text-3xl font-black tabular-nums ${s.color || 'text-slate-900'}`}>{s.value}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div variants={reduced ? undefined : staggerItem}>
                        <Card className="bg-white/90 backdrop-blur-md border-none rounded-[2.5rem] p-10 shadow-xl shadow-orange-600/5 flex flex-col h-full border-t-4 border-orange-600 hover:shadow-2xl transition-shadow">
                            <h3 className="text-orange-600 font-black uppercase tracking-[0.2em] text-[10px] mb-10 flex items-center">
                                <Trophy className="mr-3 h-5 w-5" /> GOL KRALLIĞI
                            </h3>
                            <div className="space-y-6 flex-1">
                                {(homepageStats?.topScorers || []).map((p: any, i: number) => (
                                    <motion.div
                                        key={i}
                                        className="flex items-center justify-between bg-slate-50/50 rounded-2xl p-4 border border-slate-100 hover:bg-orange-50/50 transition-all"
                                        whileHover={reduced ? undefined : { x: 4 }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="h-10 w-10 flex items-center justify-center bg-orange-600 text-white rounded-xl text-[14px] font-black shadow-lg shadow-orange-600/20">
                                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                                            </span>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black uppercase text-slate-900">{p?.name || 'Oyuncu'}</span>
                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{p?.team_name || 'KGM Birimi'}</span>
                                            </div>
                                        </div>
                                        <Badge className="bg-slate-900 text-white border-none font-black text-[10px] px-3 py-1 rounded-lg">{p?.goals ?? 0} GOL</Badge>
                                    </motion.div>
                                ))}
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div variants={reduced ? undefined : staggerItem}>
                        <Card className="bg-white/90 backdrop-blur-md border-none rounded-[2.5rem] p-10 shadow-xl shadow-orange-600/5 flex flex-col h-full border-t-4 border-blue-600 hover:shadow-2xl transition-shadow">
                            <h3 className="text-blue-600 font-black uppercase tracking-[0.2em] text-[10px] mb-10 flex items-center">
                                <Star className="mr-3 h-5 w-5" /> ASİST KRALLIĞI
                            </h3>
                            <div className="space-y-6 flex-1">
                                {(homepageStats?.topAssists || []).map((p: any, i: number) => (
                                    <motion.div
                                        key={i}
                                        className="flex items-center justify-between bg-slate-50/50 rounded-2xl p-4 border border-slate-100 hover:bg-blue-50/50 transition-all"
                                        whileHover={reduced ? undefined : { x: 4 }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="h-10 w-10 flex items-center justify-center bg-blue-600 text-white rounded-xl text-[14px] font-black shadow-lg shadow-blue-600/20">
                                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                                            </span>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black uppercase text-slate-900">{p?.name || 'Oyuncu'}</span>
                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{p?.team_name || 'KGM Birimi'}</span>
                                            </div>
                                        </div>
                                        <Badge className="bg-slate-900 text-white border-none font-black text-[10px] px-3 py-1 rounded-lg">{p?.assists ?? 0} ASİST</Badge>
                                    </motion.div>
                                ))}
                            </div>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>
        </motion.section>
    );
}
