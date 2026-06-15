import { motion } from "framer-motion";
import {
    inViewViewport,
    useReducedMotion,
    sectionTitleClass,
    defaultTransition
} from "@/lib/motion-presets";
import KnockoutBracket from "@/components/KnockoutBracket";
import { Trophy } from "lucide-react";

interface KnockoutSectionProps {
    knockoutGames: any[];
}

export default function KnockoutSection({ knockoutGames }: KnockoutSectionProps) {
    const reduced = useReducedMotion();

    if (!knockoutGames || knockoutGames.length === 0) {
        return null;
    }

    return (
        <section className="relative mb-32 w-full">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <motion.div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent blur-[80px] rounded-[100%]"
                    animate={reduced ? undefined : { opacity: [0.5, 0.8, 0.5], scale: [1, 1.05, 1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>

            <motion.div
                className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10 w-full"
                initial={reduced ? false : { y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={inViewViewport}
                transition={{ ...defaultTransition, duration: 0.8 }}
            >
                <div className="flex flex-col items-center justify-center text-center mb-8 md:mb-12">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="h-16 w-16 md:h-20 md:w-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.4)] mb-6 rotate-3 hover:rotate-6 transition-transform duration-300"
                    >
                        <Trophy className="h-8 w-8 md:h-10 md:w-10 text-white drop-shadow-md" />
                    </motion.div>
                    
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-4 bg-clip-text">
                        ELEME <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-700">TURLARI</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-lg tracking-[0.3em] uppercase max-w-2xl mx-auto">
                        ŞAMPİYONLUK YOLU
                    </p>
                    <div className="w-24 h-1.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full mt-8 opacity-80" />
                </div>
                
                <div className="relative w-full">
                    <KnockoutBracket games={knockoutGames} teams={[]} isCommittee={false} hideTitle={true} />
                </div>
            </motion.div>
        </section>
    );
}
