import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
    staggerContainer,
    staggerItem,
    staggerInView,
    defaultTransition,
    hoverLift,
    inViewViewport,
    useReducedMotion,
    sectionTitleClass,
} from "@/lib/motion-presets";

interface GroupStandingsProps {
    groupStandings: any[];
}

export default function GroupStandings({ groupStandings }: GroupStandingsProps) {
    const reduced = useReducedMotion();

    return (
        <motion.section
            className="container mx-auto px-4 sm:px-6 mb-32 max-w-7xl relative z-10"
            initial={reduced ? false : { y: 24 }}
            whileInView={{ y: 0 }}
            viewport={inViewViewport}
            transition={defaultTransition}
        >
            <div className={`flex items-center justify-between mb-12 ${sectionTitleClass}`}>
                <h2 className="text-3xl font-black uppercase tracking-tighter">GRUP PUAN DURUMLARI</h2>
            </div>
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={reduced ? undefined : staggerContainer}
                {...staggerInView(reduced)}
            >
                {(groupStandings || []).map((group) => (
                    <motion.div key={group?.name} variants={reduced ? undefined : staggerItem} whileHover={hoverLift(reduced)}>
                        <Card className="border-orange-100 bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-sm flex flex-col h-full hover:shadow-xl transition-all duration-500">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-8">
                                <h3 className="font-black text-orange-600 uppercase tracking-widest text-xs">{group?.name || 'Grup'}</h3>
                                <Badge variant="secondary" className="bg-orange-50 text-orange-700 font-bold text-[9px] border-none shrink-0">İLK {group?.advance_count ?? 0} TUR ATLAR</Badge>
                            </div>
                            <div className="flex-1 space-y-3 overflow-x-auto -mx-1 px-1">
                                <div className="min-w-[240px] grid grid-cols-[25px_1fr_30px_30px_30px] text-[9px] font-black text-slate-400 uppercase px-2 mb-2">
                                    <span>#</span><span>TAKIM</span><span className="text-center">O</span><span className="text-center">A</span><span className="text-center text-orange-600 font-black">P</span>
                                </div>
                                {(group?.rows || []).map((row: any, idx: number) => {
                                    const isAdvancing = idx < (group.advance_count || 0);
                                    return (
                                        <motion.div
                                            key={idx}
                                            className={`min-w-[240px] grid grid-cols-[25px_1fr_30px_30px_30px] items-center text-xs border rounded-xl px-2 py-2.5 transition-colors ${isAdvancing ? 'bg-orange-50/50 border-orange-100' : 'bg-slate-50/30 border-slate-50'}`}
                                            whileHover={reduced ? undefined : { scale: 1.01 }}
                                        >
                                            <span className={`h-5 w-5 flex items-center justify-center rounded-full text-[9px] font-black ${isAdvancing ? 'bg-orange-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500'}`}>{idx + 1}</span>
                                            <span className={`font-bold truncate pr-2 ${isAdvancing ? 'text-slate-900' : 'text-slate-700'}`}>{row?.team?.name || 'Takım'}</span>
                                            <span className="text-center text-slate-500 font-semibold">{row?.played ?? 0}</span>
                                            <span className="text-center text-slate-500 font-semibold">{row?.goal_difference ?? 0}</span>
                                            <span className="text-center font-black text-orange-600">{row?.points ?? 0}</span>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </motion.section>
    );
}
