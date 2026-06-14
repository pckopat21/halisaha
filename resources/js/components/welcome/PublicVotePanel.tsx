import { CheckCircle2, XCircle, Users } from 'lucide-react';

export type PublicChoice = 'home' | 'draw' | 'away';

export interface PublicStats {
    total: number;
    distribution: {
        home: number;
        draw: number;
        away: number;
    };
    counts?: {
        home: number;
        draw: number;
        away: number;
    };
    top_choice?: PublicChoice | null;
    top_score?: string | null;
}

export interface PublicVerdict {
    actual: PublicChoice;
    public_choice: PublicChoice;
    correct: boolean;
}

interface PublicVotePanelProps {
    stats: PublicStats | null | undefined;
    verdict?: PublicVerdict | null;
    size?: 'sm' | 'md';
}

const labels: Record<PublicChoice, string> = {
    home: '1',
    draw: 'X',
    away: '2',
};

const segmentColors: Record<PublicChoice, string> = {
    home: 'bg-orange-500',
    draw: 'bg-slate-400',
    away: 'bg-blue-500',
};

const textColors: Record<PublicChoice, string> = {
    home: 'text-orange-600',
    draw: 'text-slate-600',
    away: 'text-blue-600',
};

export default function PublicVotePanel({ stats, verdict, size = 'md' }: PublicVotePanelProps) {
    const isSm = size === 'sm';
    const total = stats?.total ?? 0;

    if (!stats || total === 0) {
        return (
            <div
                className={`flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 ${
                    isSm ? 'px-2 py-1.5' : 'px-3 py-2'
                }`}
            >
                <Users className={`text-slate-400 ${isSm ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                <span
                    className={`font-black uppercase tracking-widest text-slate-400 ${
                        isSm ? 'text-[8px]' : 'text-[9px]'
                    }`}
                >
                    Henüz Kamuoyu Tahmini Yok
                </span>
            </div>
        );
    }

    const dist = stats.distribution;
    const choice = stats.top_choice ?? null;

    return (
        <div
            className={`rounded-xl border border-orange-100 bg-orange-50/40 ${
                isSm ? 'px-2.5 py-2' : 'px-3 py-2.5'
            }`}
        >
            <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                    <Users className={`text-slate-500 shrink-0 ${isSm ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                    <span
                        className={`font-black uppercase tracking-widest text-slate-500 truncate ${
                            isSm ? 'text-[8px]' : 'text-[9px]'
                        }`}
                    >
                        Kamuoyu Tercihi
                    </span>
                </div>
                <span
                    className={`font-black tabular-nums text-slate-400 shrink-0 ${
                        isSm ? 'text-[8px]' : 'text-[9px]'
                    }`}
                >
                    {total} TAHMİN
                </span>
            </div>

            <div
                className={`flex w-full overflow-hidden rounded-full bg-slate-100 ${
                    isSm ? 'h-1.5' : 'h-2'
                }`}
                role="img"
                aria-label={`Kamuoyu dağılımı: 1 yüzde ${dist.home}, X yüzde ${dist.draw}, 2 yüzde ${dist.away}`}
            >
                {(['home', 'draw', 'away'] as PublicChoice[]).map((key) => {
                    const pct = dist[key];
                    if (pct <= 0) return null;
                    return (
                        <div
                            key={key}
                            className={`${segmentColors[key]} transition-all`}
                            style={{ width: `${pct}%` }}
                        />
                    );
                })}
            </div>

            <div
                className={`mt-1.5 grid grid-cols-3 gap-1 ${
                    isSm ? 'text-[8px]' : 'text-[9px]'
                }`}
            >
                {(['home', 'draw', 'away'] as PublicChoice[]).map((key) => {
                    const pct = dist[key];
                    const isTop = choice === key;
                    return (
                        <div
                            key={key}
                            className={`flex items-center justify-center gap-1 font-black tabular-nums ${
                                isTop ? textColors[key] : 'text-slate-400'
                            }`}
                        >
                            <span className={isTop ? 'font-black' : 'font-bold'}>{labels[key]}</span>
                            <span>%{pct}</span>
                        </div>
                    );
                })}
            </div>

            {verdict && (
                <div
                    className={`mt-2 flex items-center justify-center gap-1 rounded-lg font-black uppercase tracking-widest ${
                        isSm ? 'px-1.5 py-1 text-[8px]' : 'px-2 py-1.5 text-[9px]'
                    } ${
                        verdict.correct
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                >
                    {verdict.correct ? (
                        <>
                            <CheckCircle2 className={isSm ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
                            <span>Kamuoyu Doğru Bildi</span>
                        </>
                    ) : (
                        <>
                            <XCircle className={isSm ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
                            <span>Kamuoyu Yanıldı</span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
