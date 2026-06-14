import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { staggerContainer, staggerItem, hoverLift, useReducedMotion, sectionTitleClass } from "@/lib/motion-presets";

interface AnnouncementsProps {
    announcements: any[];
}

export default function Announcements({ announcements }: AnnouncementsProps) {
    const reduced = useReducedMotion();

    if (!announcements || announcements.length === 0) return null;

    return (
        <motion.section
            className="container mx-auto px-6 mb-12 max-w-7xl relative z-30"
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
        >
            <div className={`flex items-center gap-3 mb-12 ${sectionTitleClass} border-slate-950`}>
                <h2 className="text-3xl font-black uppercase tracking-tighter">DUYURULAR</h2>
            </div>
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
                variants={reduced ? undefined : staggerContainer}
                initial={reduced ? false : 'hidden'}
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
            >
                {announcements.slice(0, 6).map((ann, idx) => (
                    <motion.div key={ann?.id ?? idx} variants={reduced ? undefined : staggerItem} whileHover={hoverLift(reduced)}>
                        <Card className="border-orange-100 bg-white/80 backdrop-blur-md rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 shadow-sm hover:shadow-xl hover:ring-2 hover:ring-orange-200/50 transition-all border-l-4 border-l-orange-600 group h-full">
                            <div className="flex justify-between items-center mb-4">
                                <Badge className="bg-orange-600/10 text-orange-600 border-none text-[9px] font-black px-4 py-1.5 rounded-full">DUYURU</Badge>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {ann?.published_at ? format(new Date(ann.published_at), 'd MMMM yyyy', { locale: tr }) : '-'}
                                </span>
                            </div>
                            <h3 className="text-lg font-black uppercase mb-3 leading-tight text-slate-900 group-hover:text-orange-600 transition-colors">{ann?.title || 'Duyuru'}</h3>
                            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {ann?.content || ''}
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </motion.section>
    );
}
