import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Crown, Medal, Trophy, ChevronRight } from "lucide-react";
import {
    staggerContainer,
    staggerItem,
    staggerInView,
    useReducedMotion,
    sectionTitleClass,
} from "@/lib/motion-presets";

interface LeaderboardUser {
    id: number;
    name: string;
    total_points?: number;
    total_predictions?: number;
    exact_hits?: number;
    accuracy?: number;
}

interface PredictionLeaderboardProps {
    predictionLeaderboard: LeaderboardUser[];
    onLeaderClick: (user: LeaderboardUser) => void;
}

const numberOrZero = (value: unknown): number => {
    const parsed = typeof value === "number" ? value : parseInt(String(value ?? 0), 10);
    return Number.isFinite(parsed) ? parsed : 0;
};

function PodiumCard({
    user,
    rank,
    onClick,
}: {
    user: LeaderboardUser;
    rank: 1 | 2 | 3;
    onClick: () => void;
}) {
    const reduced = useReducedMotion();
    const palette = {
        1: {
            ring: "ring-amber-400/50",
            glow: "shadow-amber-500/30",
            badge: "bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-amber-950",
            icon: Crown,
            label: "ŞAMPİYON",
        },
        2: {
            ring: "ring-slate-300/40",
            glow: "shadow-slate-400/20",
            badge: "bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-slate-900",
            icon: Medal,
            label: "İKİNCİ",
        },
        3: {
            ring: "ring-orange-500/40",
            glow: "shadow-orange-600/25",
            badge: "bg-gradient-to-br from-amber-600 via-orange-600 to-orange-800 text-amber-50",
            icon: Medal,
            label: "ÜÇÜNCÜ",
        },
    }[rank];
    const Icon = palette.icon;

    return (
        <motion.button
            type="button"
            onClick={onClick}
            whileHover={reduced ? undefined : { y: -4, scale: 1.01 }}
            whileTap={reduced ? undefined : { scale: 0.99 }}
            className={`text-left w-full bg-slate-950/60 border border-white/10 rounded-[2rem] p-5 md:p-6 ring-2 ${palette.ring} shadow-2xl ${palette.glow} backdrop-blur-md transition-colors hover:bg-slate-900/70`}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`h-12 w-12 md:h-14 md:w-14 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${palette.badge}`}
                >
                    <Icon className="h-6 w-6 md:h-7 md:w-7" />
                </div>
                <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40 block">
                        {palette.label}
                    </span>
                    <span className="text-sm md:text-base font-black uppercase tracking-tight text-white block truncate">
                        {user.name || "Kullanıcı"}
                    </span>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 pt-4 border-t border-white/5">
                <div className="text-center">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Puan</p>
                    <p className="text-xl md:text-2xl font-black text-orange-400 tabular-nums">
                        {numberOrZero(user.total_points)}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Tahmin</p>
                    <p className="text-xl md:text-2xl font-black text-white tabular-nums">
                        {numberOrZero(user.total_predictions)}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/40">İsabet</p>
                    <p className="text-xl md:text-2xl font-black text-emerald-400 tabular-nums">
                        {numberOrZero(user.exact_hits)}
                    </p>
                </div>
            </div>
        </motion.button>
    );
}

function RankBadge({ rank }: { rank: number }) {
    if (rank === 1) {
        return (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 text-amber-950 font-black text-[11px] shadow-md shadow-amber-500/30">
                {rank}
            </span>
        );
    }
    if (rank === 2) {
        return (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900 font-black text-[11px] shadow-md shadow-slate-400/30">
                {rank}
            </span>
        );
    }
    if (rank === 3) {
        return (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-700 text-amber-50 font-black text-[11px] shadow-md shadow-orange-600/30">
                {rank}
            </span>
        );
    }
    return (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/50 font-black text-[11px]">
            {rank}
        </span>
    );
}

function Badges({ user }: { user: LeaderboardUser }) {
    const exactHits = numberOrZero(user.exact_hits);
    const accuracy = numberOrZero(user.accuracy);
    const totalPredictions = numberOrZero(user.total_predictions);
    const items: { label: string; title: string; cls: string }[] = [];

    if (exactHits >= 1) {
        items.push({
            label: "🎯 KESKİN",
            title: `${exactHits} skor isabeti`,
            cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        });
    }
    if (accuracy >= 30 && totalPredictions >= 3) {
        items.push({
            label: "🔮 KAHİN",
            title: `%${accuracy} isabet oranı`,
            cls: "bg-purple-500/15 text-purple-300 border-purple-500/30",
        });
    }
    if (totalPredictions >= 5) {
        items.push({
            label: "⚡ AKTİF",
            title: `${totalPredictions} tahmin`,
            cls: "bg-blue-500/15 text-blue-300 border-blue-500/30",
        });
    }

    if (items.length === 0) return <span className="text-white/20 text-[10px] font-bold">—</span>;

    return (
        <div className="flex flex-wrap items-center gap-1 justify-end md:justify-start">
            {items.map((b) => (
                <span
                    key={b.label}
                    title={b.title}
                    className={`${b.cls} border px-1.5 py-0.5 text-[8px] font-black uppercase rounded tracking-wide whitespace-nowrap`}
                >
                    {b.label}
                </span>
            ))}
        </div>
    );
}

export default function PredictionLeaderboard({
    predictionLeaderboard,
    onLeaderClick,
}: PredictionLeaderboardProps) {
    const reduced = useReducedMotion();
    const users = (predictionLeaderboard || []).filter(Boolean);
    const top3 = users.slice(0, 3);
    const rest = users.slice(3);
    const hasUsers = users.length > 0;

    return (
        <div className="space-y-8">
            <div className={`flex flex-col gap-1 ${sectionTitleClass} border-slate-900`}>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-slate-900">
                    TAHMİN LİGİ TABLOSU
                </h2>
                <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">
                    Tüm katılımcılar · {users.length} kişi
                </p>
            </div>

            <Card className="bg-slate-900 text-white rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

                {hasUsers ? (
                    <div className="relative z-10 space-y-8">
                        {top3.length > 0 && (
                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                variants={reduced ? undefined : staggerContainer}
                                {...staggerInView(reduced)}
                            >
                                {top3.map((user, i) => (
                                    <motion.div
                                        key={user.id ?? i}
                                        variants={reduced ? undefined : staggerItem}
                                    >
                                        <PodiumCard
                                            user={user}
                                            rank={(i + 1) as 1 | 2 | 3}
                                            onClick={() => onLeaderClick(user)}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {/* Desktop tablo */}
                        <div className="hidden md:block bg-slate-950/40 border border-white/5 rounded-[2rem] overflow-hidden">
                            <div className="max-h-[640px] overflow-y-auto overscroll-contain custom-scrollbar">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-950/80 sticky top-0 backdrop-blur-md z-10">
                                        <tr className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                                            <th className="text-left py-4 px-5 w-[60px]">#</th>
                                            <th className="text-left py-4 px-2">Kullanıcı</th>
                                            <th className="text-center py-4 px-3 w-[80px]">Puan</th>
                                            <th className="text-center py-4 px-3 w-[90px]">Tahmin</th>
                                            <th className="text-center py-4 px-3 w-[80px]">İsabet</th>
                                            <th className="text-center py-4 px-3 w-[110px]">Doğruluk</th>
                                            <th className="text-left py-4 px-3">Rozetler</th>
                                            <th className="w-[40px]" />
                                        </tr>
                                    </thead>
                                    <motion.tbody
                                        variants={reduced ? undefined : staggerContainer}
                                        {...staggerInView(reduced)}
                                    >
                                        {users.map((user, i) => {
                                            const rank = i + 1;
                                            const accuracy = numberOrZero(user.accuracy);
                                            return (
                                                <motion.tr
                                                    key={user.id ?? i}
                                                    variants={reduced ? undefined : staggerItem}
                                                    onClick={() => onLeaderClick(user)}
                                                    className={`group cursor-pointer border-t border-white/5 transition-colors hover:bg-white/5 ${
                                                        rank <= 3 ? "bg-white/[0.02]" : ""
                                                    }`}
                                                >
                                                    <td className="py-3 px-5">
                                                        <RankBadge rank={rank} />
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <span className="text-[12px] md:text-sm font-black uppercase tracking-tight text-white truncate block max-w-[220px]">
                                                            {user.name || "Kullanıcı"}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-3 text-center">
                                                        <span className="font-black text-orange-400 tabular-nums text-base">
                                                            {numberOrZero(user.total_points)}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-3 text-center text-white/70 font-bold tabular-nums">
                                                        {numberOrZero(user.total_predictions)}
                                                    </td>
                                                    <td className="py-3 px-3 text-center text-emerald-400 font-bold tabular-nums">
                                                        {numberOrZero(user.exact_hits)}
                                                    </td>
                                                    <td className="py-3 px-3 text-center">
                                                        <div className="flex items-center gap-2 justify-center">
                                                            <div className="h-1.5 w-12 rounded-full bg-white/10 overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-orange-500 to-amber-400"
                                                                    style={{ width: `${Math.min(100, accuracy)}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[11px] font-black text-white/80 tabular-nums">
                                                                %{accuracy}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <Badges user={user} />
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-orange-500 transition-colors ml-auto" />
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </motion.tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobil kart liste */}
                        <motion.div
                            className="md:hidden space-y-3 max-h-[640px] overflow-y-auto overscroll-contain pr-1 -mr-1"
                            variants={reduced ? undefined : staggerContainer}
                            {...staggerInView(reduced)}
                        >
                            {users.map((user, i) => {
                                const rank = i + 1;
                                const accuracy = numberOrZero(user.accuracy);
                                return (
                                    <motion.button
                                        type="button"
                                        key={user.id ?? i}
                                        variants={reduced ? undefined : staggerItem}
                                        onClick={() => onLeaderClick(user)}
                                        whileTap={reduced ? undefined : { scale: 0.99 }}
                                        className="w-full text-left bg-slate-950/40 hover:bg-white/5 border border-white/5 rounded-2xl p-4 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <RankBadge rank={rank} />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-sm font-black uppercase tracking-tight text-white block truncate">
                                                    {user.name || "Kullanıcı"}
                                                </span>
                                                <span className="text-[10px] font-bold text-white/40 tabular-nums">
                                                    {numberOrZero(user.total_predictions)} tahmin · %{accuracy} isabet
                                                </span>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-white/40">
                                                    Puan
                                                </p>
                                                <p className="text-lg font-black text-orange-400 tabular-nums">
                                                    {numberOrZero(user.total_points)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                                                    İsabet
                                                </span>
                                                <span className="text-sm font-black text-emerald-400 tabular-nums">
                                                    {numberOrZero(user.exact_hits)}
                                                </span>
                                            </div>
                                            <Badges user={user} />
                                        </div>
                                    </motion.button>
                                );
                            })}
                            {rest.length === 0 && top3.length > 0 && (
                                <div className="text-center text-[10px] font-black uppercase tracking-widest text-white/30 py-4">
                                    Liste bu kadar
                                </div>
                            )}
                        </motion.div>
                    </div>
                ) : (
                    <div className="relative z-10 flex flex-col items-center justify-center py-20 text-center">
                        <Trophy className="h-14 w-14 text-white/10 mb-4" />
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30">
                            Henüz tahmin yapan yok
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
}
