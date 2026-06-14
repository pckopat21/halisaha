import { Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import TournamentLogo from "@/components/tournament-logo";

interface NavbarProps {
    scrolled: boolean;
    auth: any;
}

export default function Navbar({ scrolled, auth }: NavbarProps) {
    return (
        <motion.nav
            layout
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                scrolled
                    ? "bg-white/90 backdrop-blur-md border-b border-orange-100 py-3 shadow-lg shadow-orange-600/5"
                    : "bg-transparent py-6"
            }`}
        >
            <div className="container mx-auto flex items-center justify-between px-6 lg:px-12">
                <Link href="/" className="flex items-center gap-3 md:gap-4 group">
                    <motion.div
                        className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl overflow-hidden shadow-lg shadow-orange-600/20 shrink-0"
                        whileHover={{ rotate: 3, scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                        <TournamentLogo className="h-full w-full" />
                    </motion.div>
                    <div className="flex flex-col">
                        <span className="text-lg md:text-xl font-black uppercase tracking-tighter leading-none">
                            KARAYOLLARI <span className="text-orange-600">TURNUVA</span>
                        </span>
                        <span className="hidden md:block text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">
                            KGM 5.BÖLGE MÜDÜRLÜĞÜ
                        </span>
                    </div>
                </Link>

                <div className="flex items-center gap-2 md:gap-4">
                    {auth?.user ? (
                        <Link href="/dashboard">
                            <Button className="bg-slate-900 text-white hover:bg-orange-600 font-bold uppercase tracking-widest text-[10px] rounded-xl h-10 px-6 transition-all shadow-md hover:shadow-orange-600/20">
                                <LayoutDashboard className="h-4 w-4 mr-2" /> DASHBOARD
                            </Button>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md p-1 rounded-2xl border border-orange-100 shadow-sm">
                            <Link href="/login">
                                <Button
                                    variant="ghost"
                                    className="text-slate-600 hover:text-orange-600 font-bold uppercase tracking-widest text-[10px] h-9 px-4 md:px-6 rounded-xl"
                                >
                                    GİRİŞ
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl h-9 px-4 md:px-6 transition-all shadow-sm hover:shadow-orange-600/30">
                                    KAYIT OL
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </motion.nav>
    );
}
