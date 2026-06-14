import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { staggerContainer, staggerItem, springTransition, useReducedMotion, sectionTitleClass } from "@/lib/motion-presets";

interface PlayerOfTheWeekProps {
    playerOfTheWeek: any;
}

export default function PlayerOfTheWeek({ playerOfTheWeek }: PlayerOfTheWeekProps) {
    const reduced = useReducedMotion();

    return (
        <div className="lg:col-span-9 space-y-8 flex flex-col">
            <div className={`flex items-center gap-3 ${sectionTitleClass}`}>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">HAFTANIN OYUNCUSU</h2>
            </div>
            <Card className="bg-white/90 backdrop-blur-md border border-orange-100 rounded-[3rem] p-6 md:p-12 shadow-2xl relative overflow-hidden group hover:border-orange-600 transition-all duration-700 flex-grow flex flex-col justify-center">
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[120px] group-hover:bg-orange-600/10 transition-colors" />

                {playerOfTheWeek ? (
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                        <div className="md:col-span-4 flex flex-col items-center text-center space-y-6">
                            <div className="relative">
                                <motion.div
                                    className="h-40 w-40 md:h-48 md:w-48 rounded-[3rem] bg-orange-600 flex items-center justify-center shadow-2xl shadow-orange-600/30 overflow-hidden relative"
                                    whileHover={reduced ? undefined : { scale: 1.05 }}
                                    transition={springTransition}
                                >
                                    <Users className="h-20 w-20 text-white opacity-20" />
                                    <div className="absolute inset-0 flex items-center justify-center text-6xl font-black text-white/20 uppercase italic select-none">
                                        {playerOfTheWeek.first_name?.[0]}{playerOfTheWeek.last_name?.[0]}
                                    </div>
                                </motion.div>
                                <div className="absolute -bottom-3 -right-3 bg-slate-900 text-white text-lg font-black px-6 py-2 rounded-full border-4 border-white shadow-2xl">
                                    {playerOfTheWeek.rating || '6.0'}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-slate-900 leading-tight">
                                    {playerOfTheWeek.first_name} {playerOfTheWeek.last_name}
                                </h3>
                                <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">
                                    {playerOfTheWeek.unit?.name || 'GENEL MÜDÜRLÜK'}
                                </p>
                                <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mt-2">
                                    {playerOfTheWeek.teams?.[0]?.name || 'TAKIMSIZ'}
                                </div>
                            </div>
                        </div>

                        <motion.div
                            className="md:col-span-8 grid grid-cols-2 gap-4 md:gap-6"
                            variants={reduced ? undefined : staggerContainer}
                            initial={reduced ? false : 'hidden'}
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {[
                                { label: 'TOPLAM GOL', value: playerOfTheWeek.goals_count || 0, color: 'text-slate-900' },
                                { label: 'ASİST', value: playerOfTheWeek.assists_count || 0, color: 'text-slate-900' },
                                { label: 'SKORA KATKI (G+A)', value: (playerOfTheWeek.goals_count || 0) + (playerOfTheWeek.assists_count || 0), color: 'text-orange-600' },
                                { label: 'MAÇ SAYISI', value: playerOfTheWeek.matches_count || 0, color: 'text-slate-900' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    variants={reduced ? undefined : staggerItem}
                                    className="bg-slate-50/50 backdrop-blur-sm rounded-[2rem] p-6 md:p-8 text-center border border-slate-100 group-hover:bg-white transition-all shadow-sm flex flex-col justify-center min-h-[140px] hover:shadow-md"
                                    whileHover={reduced ? undefined : { y: -4 }}
                                >
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                                    <p className={`text-5xl font-black tabular-nums ${stat.color}`}>{stat.value}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                ) : (
                    <div className="text-center py-20 opacity-20">
                        <Users className="h-20 w-20 mx-auto mb-4" />
                        <p className="font-black uppercase tracking-widest">Oyuncu verisi bekleniyor...</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
