import { motion } from "framer-motion";
import TournamentLogo from "@/components/tournament-logo";
import { useReducedMotion } from "@/lib/motion-presets";

export default function Footer() {
    const reduced = useReducedMotion();

    return (
        <motion.footer
            className="bg-slate-50 border-t border-slate-200 py-24 px-6 relative z-10"
            initial={reduced ? false : { y: 12 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
                <div className="flex flex-col items-center md:items-start gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0">
                            <TournamentLogo className="h-full w-full" />
                        </div>
                        <span className="text-xl font-black uppercase tracking-tighter text-slate-900">
                            KARAYOLLARI <span className="text-orange-600 italic">TURNUVA</span>
                        </span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                        © 2026 KGM 5.BÖLGE MÜDÜRLÜĞÜ. TÜM HAKLARI SAKLIDIR.
                    </p>
                </div>
                <div className="flex flex-wrap justify-center gap-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {["KURALLAR", "GİZLİLİK", "DESTEK", "KGM WEB"].map((l) => (
                        <a
                            key={l}
                            href="#"
                            className="hover:text-orange-600 transition-colors border-b-2 border-transparent hover:border-orange-600 pb-1"
                        >
                            {l}
                        </a>
                    ))}
                </div>
            </div>
        </motion.footer>
    );
}
