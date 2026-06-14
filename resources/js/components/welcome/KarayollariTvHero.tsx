import { Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Tv, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getYoutubeEmbedUrl } from "@/lib/youtube";
import Hero from "@/components/welcome/Hero";
import { defaultTransition, springTransition, useReducedMotion } from "@/lib/motion-presets";

export interface FeaturedBroadcast {
    mode: "live" | "replay";
    game: {
        id: number;
        home_score?: number;
        away_score?: number;
        current_minute?: number;
        minute?: number;
        home_team?: { name: string };
        away_team?: { name: string };
        homeTeam?: { name: string };
        awayTeam?: { name: string };
        group?: { name: string } | string;
        field?: { name: string };
    };
    stream_url: string | null;
}

interface KarayollariTvHeroProps {
    activeTournament: any;
    featuredBroadcast: FeaturedBroadcast | null;
    getTeamName: (team: any) => string;
}

export default function KarayollariTvHero({
    activeTournament,
    featuredBroadcast,
    getTeamName,
}: KarayollariTvHeroProps) {
    const reduced = useReducedMotion();

    if (!featuredBroadcast?.game) {
        return <Hero activeTournament={activeTournament} />;
    }

    const { mode, game, stream_url } = featuredBroadcast;
    const embedUrl = stream_url ? getYoutubeEmbedUrl(stream_url) : null;
    const homeName = getTeamName(game.home_team || game.homeTeam);
    const awayName = getTeamName(game.away_team || game.awayTeam);
    const groupName =
        typeof game.group === "object" ? game.group?.name : game.group || "Grup";
    const isLive = mode === "live";
    const iframeTitle = `${homeName} vs ${awayName} - KGM5 TV`;

    const reveal = (delay = 0) =>
        reduced
            ? {}
            : {
                  initial: { y: 16 },
                  animate: { y: 0 },
                  transition: { ...defaultTransition, delay },
              };

    return (
        <section className="relative pt-24 pb-12 px-4 md:px-6 overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[50%] bg-orange-200/20 blur-[100px] rounded-full" />
            </div>

            <div className="container mx-auto max-w-6xl relative z-10">
                <motion.header
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
                    {...reveal(0)}
                >
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 md:h-14 md:w-14 bg-red-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/30">
                            <Tv className="h-6 w-6 md:h-7 md:w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-slate-900">
                                KGM5 SPOR<span className="text-orange-600">TV</span>
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                {isLive ? (
                                    <Badge className="bg-red-600 text-white px-3 py-0.5 rounded-full font-black text-[9px] uppercase tracking-widest border-0">
                                        <span className="relative flex h-2 w-2 mr-1.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                                        </span>
                                        CANLI
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="outline"
                                        className="border-orange-200 text-orange-600 font-black text-[9px] uppercase tracking-widest"
                                    >
                                        SON MAÇ
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    {stream_url && (
                        <a
                            href={stream_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-orange-600 uppercase tracking-widest transition-colors"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            YouTube&apos;da Aç
                        </a>
                    )}
                </motion.header>

                <motion.div {...reveal(0.1)}>
                    {embedUrl ? (
                        <div className="relative w-full rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-900/10 border border-orange-100 bg-slate-900">
                            <VideoEmbed embedUrl={embedUrl} title={iframeTitle} />
                        </div>
                    ) : (
                        <NoStreamPlaceholder />
                    )}
                </motion.div>

                <motion.div {...reveal(0.2)}>
                    <MatchScoreBar
                        game={game}
                        homeName={homeName}
                        awayName={awayName}
                        groupName={groupName}
                        isLive={isLive}
                    />
                </motion.div>

                <motion.div
                    className="mt-8 flex flex-wrap justify-center gap-4"
                    {...reveal(0.3)}
                >
                    <Link href={`/games/${game.id}`}>
                        <Button
                            variant="outline"
                            className="h-12 px-8 font-black uppercase tracking-widest text-[10px] rounded-xl border-orange-200 hover:bg-orange-50 transition-all hover:scale-[1.02]"
                        >
                            Maç Detayı
                        </Button>
                    </Link>
                    <Link href="/games">
                        <Button className="h-12 px-8 bg-slate-900 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all hover:scale-[1.02] shadow-lg">
                            Tüm Maçlar
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

function VideoEmbed({ embedUrl, title }: { embedUrl: string; title: string }) {
    const reduced = useReducedMotion();
    return (
        <motion.div
            className="relative w-full"
            style={{ paddingBottom: "56.25%" }}
            initial={reduced ? false : { scale: 0.98 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
        >
            <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={title}
            />
        </motion.div>
    );
}

function NoStreamPlaceholder() {
    return (
        <div className="rounded-2xl md:rounded-[2rem] border-2 border-dashed border-orange-200 bg-white/80 backdrop-blur-md p-8 md:p-12 text-center shadow-lg">
            <Tv className="h-12 w-12 text-orange-400 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-600 mb-2">Yayın linki henüz eklenmedi</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Canlı skor aşağıda güncellenmektedir
            </p>
        </div>
    );
}

function MatchScoreBar({
    game,
    homeName,
    awayName,
    groupName,
    isLive,
}: {
    game: FeaturedBroadcast["game"];
    homeName: string;
    awayName: string;
    groupName: string;
    isLive: boolean;
}) {
    return (
        <div className="mt-4 md:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 md:p-6 rounded-2xl bg-white/90 backdrop-blur-md border border-orange-100 shadow-sm">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {groupName}
                {game.field?.name ? ` · ${game.field.name}` : ""}
            </span>
            <div className="flex items-center gap-3 md:gap-6 flex-1 justify-center">
                <span className="text-xs md:text-sm font-black uppercase text-slate-900 text-right flex-1 truncate">
                    {homeName}
                </span>
                <ScoreDisplay game={game} isLive={isLive} />
                <span className="text-xs md:text-sm font-black uppercase text-slate-900 text-left flex-1 truncate">
                    {awayName}
                </span>
            </div>
        </div>
    );
}

function ScoreDisplay({ game, isLive }: { game: FeaturedBroadcast["game"]; isLive: boolean }) {
    const reduced = useReducedMotion();
    return (
        <motion.div
            className="flex flex-col items-center gap-1 shrink-0"
            initial={reduced ? false : { scale: 0.92 }}
            animate={{ scale: 1 }}
            transition={springTransition}
        >
            <div className="bg-slate-900 text-white px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-4 shadow-xl">
                <span className="text-xl md:text-3xl font-black tabular-nums">{game.home_score ?? 0}</span>
                <span className="text-sm md:text-xl font-black text-orange-500">:</span>
                <span className="text-xl md:text-3xl font-black tabular-nums">{game.away_score ?? 0}</span>
            </div>
            {isLive && (
                <span className="text-[8px] font-black text-red-600 animate-pulse uppercase tracking-widest">
                    {game.current_minute ?? game.minute ?? "0"}&apos;
                </span>
            )}
        </motion.div>
    );
}
