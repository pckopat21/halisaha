import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    Check,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { useReducedMotion } from '@/lib/motion-presets';

// Welcome Components
import Navbar from '@/components/welcome/Navbar';
import KarayollariTvHero, { type FeaturedBroadcast } from '@/components/welcome/KarayollariTvHero';
import LiveMatchCenter from '@/components/welcome/LiveMatchCenter';
import Announcements from '@/components/welcome/Announcements';
import GroupStandings from '@/components/welcome/GroupStandings';
import MatchList from '@/components/welcome/MatchList';
import TournamentStats from '@/components/welcome/TournamentStats';
import PlayerOfTheWeek from '@/components/welcome/PlayerOfTheWeek';
import PredictionLeaderboard from '@/components/welcome/PredictionLeaderboard';
import GallerySection from '@/components/welcome/GallerySection';
import OverallStats from '@/components/welcome/OverallStats';
import Footer from '@/components/welcome/Footer';

// Modals
import PredictionModal from '@/components/welcome/PredictionModal';
import LiveStreamModal from '@/components/welcome/LiveStreamModal';
import LeaderPredictionsModal from '@/components/welcome/LeaderPredictionsModal';
import AnnouncementModal, { type LatestAnnouncement } from '@/components/welcome/AnnouncementModal';
import { shouldShowAnnouncement } from '@/lib/announcement-dismissal';
import { releaseBodyScrollLock } from '@/hooks/use-body-scroll-lock';

interface Player {
    id: number;
    first_name: string;
    last_name: string;
    is_captain?: boolean;
}

interface Team {
    id: number;
    name: string;
    unit?: { name: string };
    players?: Player[];
    captain?: Player;
}

interface Tournament {
    id: number;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
    champion?: {
        id: number;
        name: string;
        unit?: {
            name: string;
        };
    };
}

interface PageProps {
    activeTournament: Tournament | null;
    approvedTeams: Team[];
    groupStandings: Array<{
        name: string;
        advance_count: number;
        rows: Array<{
            team: { name: string; unit?: string | null };
            played: number;
            won: number;
            drawn: number;
            lost: number;
            goals_for: number;
            goals_against: number;
            goal_difference: number;
            points: number;
        }>;
    }>;
    featuredBroadcast: FeaturedBroadcast | null;
    liveMatches: Array<{
        id: number;
        group: any;
        home_team: any;
        away_team: any;
        home_score: number;
        away_score: number;
        minute: number;
        current_minute?: number;
        field?: any;
        live_stream_url?: string | null;
        homeTeam?: any;
        awayTeam?: any;
    }>;
    lastResults: Array<{
        id: number;
        group: any;
        home_team: any;
        away_team: any;
        home_score: number;
        away_score: number;
        scheduled_at: string | null;
        field?: any;
        live_stream_url?: string | null;
        homeTeam?: any;
        awayTeam?: any;
    }>;
    upcomingFixtures: Array<{
        id: number;
        group: any;
        home_team: any;
        away_team: any;
        scheduled_at: string | null;
        field?: any;
        homeTeam?: any;
        awayTeam?: any;
    }>;
    homepageStats: {
        summary: {
            total_goals: number;
            avg_goals: number;
            played_matches: number;
            total_matches: number;
            total_cards: number;
        };
        topScorers: Array<{ name: string; goals: number; team_name?: string }>;
        topAssists: Array<{ name: string; assists: number; team_name?: string }>;
    } | null;
    totalStats: {
        approvedTeams: number;
        activePlayers: number;
        totalMatches: number;
    };
    announcements?: any[];
    latestAnnouncement?: LatestAnnouncement | null;
    galleries?: any[];
    predictionLeaderboard?: any[];
    userPredictions?: any[];
    playerOfTheWeek?: any;
    nextMatch: {
        id?: number;
        home_team: any;
        away_team: any;
        scheduled_at: string;
        field?: string;
    } | null;
    allUpcomingGames?: any[];
    flash: { success: string | null; error: string | null };
    auth: { user: any };
}

export default function Welcome({
    activeTournament,
    approvedTeams = [],
    groupStandings = [],
    featuredBroadcast = null,
    liveMatches = [],
    lastResults = [],
    upcomingFixtures = [],
    homepageStats = null,
    totalStats,
    announcements = [],
    latestAnnouncement = null,
    galleries = [],
    predictionLeaderboard = [],
    nextMatch = null,
    userPredictions = [],
    playerOfTheWeek,
    allUpcomingGames = [],
    flash,
    auth
}: PageProps) {
    const [scrolled, setScrolled] = useState(false);
    const [predictingGame, setPredictingGame] = useState<any | null>(null);
    const [liveStreamMatch, setLiveStreamMatch] = useState<any | null>(null);
    const [isMounted, setIsMounted] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [predictionError, setPredictionError] = useState<string | null>(null);
    const [viewingLeader, setViewingLeader] = useState<any | null>(null);
    const [leaderPredictions, setLeaderPredictions] = useState<any[]>([]);
    const [loadingLeaderPredictions, setLoadingLeaderPredictions] = useState(false);
    const [gameStats, setGameStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
    const reducedMotion = useReducedMotion();

    const predictionForm = useForm({
        game_id: '',
        home_score: '',
        away_score: '',
    });

    const predictionsMap = useMemo(() => {
        const map: Record<number, any> = {};
        (userPredictions || []).forEach((p: any) => { map[p.game_id] = p; });
        return map;
    }, [userPredictions]);

    const getExistingPrediction = (gameId: number | undefined) => gameId ? predictionsMap[gameId] : null;

    const openPredictionModal = (game: any) => {
        const existing = getExistingPrediction(game?.id);
        predictionForm.setData({
            game_id: String(game?.id || ''),
            home_score: String(existing?.home_score ?? ''),
            away_score: String(existing?.away_score ?? ''),
        });
        setPredictingGame(game);
        setPredictionError(null);
        setGameStats(null);

        if (game?.id) {
            setLoadingStats(true);
            fetch(`/predictions/${game.id}/analyze`)
                .then(res => res.json())
                .then(data => setGameStats(data))
                .finally(() => setLoadingStats(false));
        }
    };

    useEffect(() => {
        releaseBodyScrollLock();
        setIsMounted(true);

        const handleScroll = () => setScrolled(window.scrollY > 50);
        const handlePageShow = (e: PageTransitionEvent) => {
            if (e.persisted) releaseBodyScrollLock();
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('pageshow', handlePageShow);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('pageshow', handlePageShow);
            releaseBodyScrollLock();
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['featuredBroadcast', 'liveMatches'] });
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!isMounted || !latestAnnouncement?.id) return;
        if (!shouldShowAnnouncement(latestAnnouncement.id)) return;

        // İlk paint tamamlandıktan sonra modalı aç — beyaz/siyah flaş riskini azaltır
        const timer = window.setTimeout(() => {
            setAnnouncementModalOpen(true);
        }, 700);
        return () => window.clearTimeout(timer);
    }, [isMounted, latestAnnouncement?.id]);

    useEffect(() => {
        if (flash?.success) {
            setToast({ message: flash.success, type: 'success' });
            setTimeout(() => setToast(null), 3000);
        }
        if (flash?.error) {
            setToast({ message: flash.error, type: 'error' });
            setTimeout(() => setToast(null), 3000);
        }
    }, [flash]);

    const handlePredictionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!predictingGame?.id || !auth?.user || submitting) return;
        setPredictionError(null);
        setSubmitting(true);
        router.post('/predictions', {
            game_id: predictingGame.id,
            home_score: parseInt(predictionForm.data.home_score) || 0,
            away_score: parseInt(predictionForm.data.away_score) || 0,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setPredictingGame(null);
                predictionForm.reset();
                setSubmitting(false);
            },
            onError: (errors: any) => {
                setPredictionError(Object.values(errors).flat().join(', '));
                setSubmitting(false);
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const fetchLeaderPredictions = async (user: any) => {
        setViewingLeader(user);
        setLoadingLeaderPredictions(true);
        try {
            const response = await fetch(`/predictions/user/${user.id}`);
            const data = await response.json();
            setLeaderPredictions(Array.isArray(data.predictions) ? data.predictions : []);
        } catch (error) {
            console.error('Leader predictions fetch error:', error);
        } finally {
            setLoadingLeaderPredictions(false);
        }
    };

    const getTeamName = (team: any) => {
        if (!team) return '-';
        if (typeof team === 'string') return team;
        return team?.name || '-';
    };

    const getMatchDateMeta = (dateString: string | null) => {
        if (!dateString) return { dayLabel: 'Tarih Yok', fullDate: '-', time: '-' };
        const matchDate = new Date(dateString);
        if (isNaN(matchDate.getTime())) return { dayLabel: 'Geçersiz Tarih', fullDate: '-', time: '-' };
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
        let dayLabel = 'İleri Tarih';
        if (isSameDay(matchDate, today)) dayLabel = 'Bugün';
        else if (isSameDay(matchDate, tomorrow)) dayLabel = 'Yarın';
        return {
            dayLabel,
            time: matchDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            fullDate: matchDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })
        };
    };

    return (
        <div className="min-h-screen bg-[#fafafa] text-slate-900 selection:bg-orange-500 selection:text-white font-sans">
            <Head title={activeTournament?.name || "Birimler Arası Halı Saha Turnuvası - KGM Arena"} />

            {/* Global Background Elements — mobilde ilk paint maliyetini düşürmek için gizli */}
            <div className="fixed inset-0 pointer-events-none z-0 hidden md:block">
                <motion.div
                    className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-orange-200/10 blur-[120px] rounded-full"
                    animate={reducedMotion ? undefined : { opacity: [0.08, 0.14, 0.08] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-blue-100/10 blur-[120px] rounded-full"
                    animate={reducedMotion ? undefined : { opacity: [0.06, 0.12, 0.06] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                />
            </div>

            <Navbar scrolled={scrolled} auth={auth} />

            <main className="relative z-10">
                <KarayollariTvHero
                    activeTournament={activeTournament}
                    featuredBroadcast={featuredBroadcast}
                    getTeamName={getTeamName}
                />

                <LiveMatchCenter
                    liveMatches={liveMatches}
                    upcomingFixtures={upcomingFixtures}
                    onWatchLive={setLiveStreamMatch}
                    onPredict={openPredictionModal}
                    getTeamName={getTeamName}
                    getMatchDateMeta={getMatchDateMeta}
                    getExistingPrediction={getExistingPrediction}
                />

                <Announcements announcements={announcements} />

                <GroupStandings groupStandings={groupStandings} />

                <MatchList
                    lastResults={lastResults}
                    upcomingFixtures={upcomingFixtures}
                    onWatchLive={setLiveStreamMatch}
                    onPredict={openPredictionModal}
                    getTeamName={getTeamName}
                    getMatchDateMeta={getMatchDateMeta}
                    getExistingPrediction={getExistingPrediction}
                />

                <TournamentStats homepageStats={homepageStats} />

                <section className="py-24 px-4 sm:px-6 relative z-10">
                    <div className="container mx-auto max-w-7xl">
                        <PlayerOfTheWeek playerOfTheWeek={playerOfTheWeek} />
                    </div>
                </section>

                <section className="pb-24 px-4 sm:px-6 relative z-10">
                    <div className="container mx-auto max-w-7xl">
                        <PredictionLeaderboard
                            predictionLeaderboard={predictionLeaderboard}
                            onLeaderClick={fetchLeaderPredictions}
                        />
                    </div>
                </section>

                <GallerySection galleries={galleries} />

                <OverallStats totalStats={totalStats} />
            </main>

            <Footer />

            {/* Modals */}
            <AnnouncementModal
                announcement={latestAnnouncement}
                isOpen={announcementModalOpen}
                onClose={() => setAnnouncementModalOpen(false)}
            />

            <PredictionModal
                game={predictingGame}
                isOpen={!!predictingGame}
                onClose={() => setPredictingGame(null)}
                auth={auth}
                predictionForm={predictionForm}
                predictionError={predictionError}
                submitting={submitting}
                gameStats={gameStats}
                handlePredictionSubmit={handlePredictionSubmit}
                getExistingPrediction={getExistingPrediction}
                getTeamName={getTeamName}
            />

            <LiveStreamModal
                match={liveStreamMatch}
                isOpen={!!liveStreamMatch}
                onClose={() => setLiveStreamMatch(null)}
                getTeamName={getTeamName}
            />

            <LeaderPredictionsModal
                user={viewingLeader}
                isOpen={!!viewingLeader}
                onClose={() => setViewingLeader(null)}
                predictions={leaderPredictions}
                loading={loadingLeaderPredictions}
                allUpcomingGames={allUpcomingGames}
                auth={auth}
                getTeamName={getTeamName}
                fetchLeaderPredictions={fetchLeaderPredictions}
            />

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-6"
                    >
                        <div className={`${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 backdrop-blur-xl`}>
                            <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                {toast.type === 'success' ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest leading-relaxed flex-1">{toast.message}</p>
                            <button onClick={() => setToast(null)} className="h-8 w-8 hover:bg-white/10 rounded-lg transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
