import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface AnnouncementsProps {
    announcements: any[];
}

export default function Announcements({ announcements }: AnnouncementsProps) {
    if (!announcements || announcements.length === 0) return null;

    return (
        <section className="container mx-auto px-6 mb-12 max-w-7xl relative z-30">
            <div className="flex items-center gap-3 border-l-4 border-slate-950 pl-4 mb-12">
                <h2 className="text-3xl font-black uppercase tracking-tighter">DUYURULAR</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {announcements.slice(0, 6).map((ann, idx) => (
                    <Card key={idx} className="border-orange-100 bg-white/80 backdrop-blur-md rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 shadow-sm hover:shadow-xl transition-all border-l-4 border-l-orange-600 group">
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
                ))}
            </div>
        </section>
    );
}
