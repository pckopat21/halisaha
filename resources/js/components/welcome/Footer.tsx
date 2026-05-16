import { Trophy } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-slate-50 border-t border-slate-200 py-24 px-6 relative z-10">
            <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
                <div className="flex flex-col items-center md:items-start gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-orange-600 rounded-xl flex items-center justify-center">
                            <Trophy className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-black uppercase tracking-tighter text-slate-900">KARAYOLLARI <span className="text-orange-600 italic">TURNUVA</span></span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">© 2026 KGM 5.BÖLGE MÜDÜRLÜĞÜ. TÜM HAKLARI SAKLIDIR.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {['KURALLAR', 'GİZLİLİK', 'DESTEK', 'KGM WEB'].map(l => (
                        <a key={l} href="#" className="hover:text-orange-600 transition-colors border-b-2 border-transparent hover:border-orange-600 pb-1">{l}</a>
                    ))}
                </div>
            </div>
        </footer>
    );
}
