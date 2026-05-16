import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GroupStandingsProps {
    groupStandings: any[];
}

export default function GroupStandings({ groupStandings }: GroupStandingsProps) {
    return (
        <section className="container mx-auto px-6 mb-32 max-w-7xl relative z-10">
            <div className="flex items-center justify-between border-l-4 border-orange-600 pl-4 mb-12">
                <h2 className="text-3xl font-black uppercase tracking-tighter">GRUP PUAN DURUMLARI</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(groupStandings || []).map((group) => (
                    <Card key={group?.name} className="border-orange-100 bg-white rounded-[2.5rem] p-8 shadow-sm flex flex-col h-full hover:shadow-xl transition-all duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-black text-orange-600 uppercase tracking-widest text-xs">{group?.name || 'Grup'}</h3>
                            <Badge variant="secondary" className="bg-orange-50 text-orange-700 font-bold text-[9px] border-none">İLK {group?.advance_count ?? 0} TUR ATLAR</Badge>
                        </div>
                        <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-[25px_1fr_30px_30px_30px] text-[9px] font-black text-slate-400 uppercase px-2 mb-2">
                                <span>#</span><span>TAKIM</span><span className="text-center">O</span><span className="text-center">A</span><span className="text-center text-orange-600 font-black">P</span>
                            </div>
                            {(group?.rows || []).map((row, idx) => {
                                const isAdvancing = idx < (group.advance_count || 0);
                                return (
                                    <div key={idx} className={`grid grid-cols-[25px_1fr_30px_30px_30px] items-center text-xs border rounded-xl px-2 py-2.5 transition-colors ${isAdvancing ? 'bg-orange-50/50 border-orange-100' : 'bg-slate-50/30 border-slate-50'}`}>
                                        <span className={`h-5 w-5 flex items-center justify-center rounded-full text-[9px] font-black ${isAdvancing ? 'bg-orange-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500'}`}>{idx + 1}</span>
                                        <span className={`font-bold truncate pr-2 ${isAdvancing ? 'text-slate-900' : 'text-slate-700'}`}>{row?.team?.name || 'Takım'}</span>
                                        <span className="text-center text-slate-500 font-semibold">{row?.played ?? 0}</span>
                                        <span className="text-center text-slate-500 font-semibold">{row?.goal_difference ?? 0}</span>
                                        <span className="text-center font-black text-orange-600">{row?.points ?? 0}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}
