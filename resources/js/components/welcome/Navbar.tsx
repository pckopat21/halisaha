import { Link, usePage, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, MapPin } from "lucide-react";
import TournamentLogo from "@/components/tournament-logo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NavbarProps {
    scrolled: boolean;
    auth: any;
}

export default function Navbar({ scrolled, auth }: NavbarProps) {
    const { regions, public_region_id } = usePage<any>().props;

    const handleRegionChange = (val: string) => {
        router.post('/region/public-switch', { region_id: val }, {
            preserveScroll: true,
            preserveState: false, // Forces a full refresh to reload scoped data
        });
    };

    return (
        <motion.nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                scrolled
                    ? "bg-white/90 backdrop-blur-md border-b border-orange-100 py-3 shadow-lg shadow-orange-600/5"
                    : "bg-transparent py-6"
            }`}
        >
            <div className="container mx-auto flex items-center justify-between gap-2 px-4 sm:px-6 lg:px-12">
                <Link href="/" className="flex items-center gap-2 md:gap-4 group min-w-0 flex-1">
                    <motion.div
                        className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl overflow-hidden shadow-lg shadow-orange-600/20 shrink-0"
                        whileHover={{ rotate: 3, scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                        <TournamentLogo className="h-full w-full" />
                    </motion.div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm sm:text-lg md:text-xl font-black uppercase tracking-tighter leading-none truncate">
                            KARAYOLLARI <span className="text-orange-600">TURNUVA</span>
                        </span>
                        <span className="hidden md:block text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">
                            BÖLGESEL TURNUVA YÖNETİMİ
                        </span>
                    </div>
                </Link>

                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    <div className="block">
                        <Select value={public_region_id?.toString() || "5"} onValueChange={handleRegionChange}>
                            <SelectTrigger className="h-8 sm:h-9 md:h-10 bg-white/80 backdrop-blur-md border-orange-100 shadow-sm rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-widest w-[110px] sm:w-[160px]">
                                <MapPin className="hidden sm:inline-block h-3 w-3 mr-2 text-orange-600" />
                                <SelectValue placeholder="Bölge Seç" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-xs font-bold uppercase">Tüm Bölgeler</SelectItem>
                                {regions?.map((r: any) => (
                                    <SelectItem key={r.id} value={r.id.toString()} className="text-xs font-bold uppercase">
                                        {r.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {auth?.user ? (
                        <Link href="/dashboard">
                            <Button className="bg-slate-900 text-white hover:bg-orange-600 font-bold uppercase tracking-widest text-[10px] rounded-xl h-9 md:h-10 px-3 md:px-6 transition-all shadow-md hover:shadow-orange-600/20">
                                <LayoutDashboard className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">PANEL</span>
                            </Button>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-1 sm:gap-2 bg-white/80 backdrop-blur-md p-1 rounded-2xl border border-orange-100 shadow-sm">
                            <Link href="/login">
                                <Button
                                    variant="ghost"
                                    className="text-slate-600 hover:text-orange-600 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] h-8 sm:h-9 px-3 sm:px-4 md:px-6 rounded-xl"
                                >
                                    GİRİŞ
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold uppercase tracking-widest text-[9px] sm:text-[10px] rounded-xl h-8 sm:h-9 px-3 sm:px-4 md:px-6 transition-all shadow-sm hover:shadow-orange-600/30">
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
