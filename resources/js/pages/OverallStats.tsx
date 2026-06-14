import { motion } from "framer-motion";
import { Shield, Users, Zap } from "lucide-react";
import { staggerContainer, staggerItem, useReducedMotion } from "@/lib/motion-presets";

interface OverallStatsProps {
    totalStats: {
        approvedTeams: number;
        activePlayers: number;
        totalMatches: number;
    };
}

export default function OverallStats({ totalStats }: OverallStatsProps) {
    const reduced = useReducedMotion();

    return (
        <motion.section
            className="py-32 px-6 relative z-10 bg-white"
            initial={reduced ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={reduced ? undefined : staggerContainer}
        >
            <div className="container mx-auto max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    {[
                        { label: "ONAYLI TAKIM", value: totalStats?.approvedTeams || 0, icon: Shield },
                        { label: "AKTİF SPORCU", value: totalStats?.activePlayers || 0, icon: Users },
                        { label: "KRİTİK MAÇ", value: totalStats?.totalMatches || 0, icon: Zap },
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            variants={reduced ? undefined : staggerItem}
                            className="flex flex-col items-center gap-6 group"
                            whileHover={reduced ? undefined : { y: -6 }}
                        >
                            <div className="h-24 w-24 rounded-[2.5rem] bg-orange-50 border border-orange-100 flex items-center justify-center shadow-lg shadow-orange-600/5 group-hover:bg-orange-600 transition-all duration-300">
                                <stat.icon className="h-10 w-10 text-orange-600 group-hover:text-white transition-all" />
                            </div>
                            <div>
                                <h3 className="text-6xl font-black text-slate-900 mb-1 tabular-nums tracking-tighter">{stat.value}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{stat.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
}
