import { motion } from 'framer-motion';
import { Calendar, Target } from 'lucide-react';
import { useReducedMotion } from '@/lib/motion-presets';

export interface MatchDateMeta {
    dayLabel: string;
    fullDate: string;
    time: string;
}

interface MatchDateWithPredictionProps {
    dateMeta: MatchDateMeta;
    existingPrediction: any | null;
    onPredict: () => void;
    size?: 'sm' | 'md';
}

function predictionLabel(existing: any | null): string {
    if (!existing) return 'Tahmin';
    if (existing.prediction_type === 'outcome') {
        const map: Record<string, string> = { home: '1', draw: 'X', away: '2' };
        return map[existing.outcome] ?? '1';
    }
    return `${existing.home_score}-${existing.away_score}`;
}

export default function MatchDateWithPrediction({
    dateMeta,
    existingPrediction,
    onPredict,
    size = 'md',
}: MatchDateWithPredictionProps) {
    const reduced = useReducedMotion();
    const hasPrediction = !!existingPrediction;
    const isSm = size === 'sm';

    return (
        <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex items-center gap-1.5 shrink-0">
                <Calendar className={`text-orange-500 ${isSm ? 'h-3 w-3' : 'h-3 w-3 md:h-3.5 md:w-3.5'}`} />
                <span
                    className={`font-bold text-orange-600 uppercase ${
                        isSm ? 'text-[9px]' : 'text-[9px] md:text-[10px]'
                    }`}
                >
                    {dateMeta.dayLabel === 'Bugün' ? 'BUGÜN' : dateMeta.fullDate}
                </span>
            </div>

            <motion.button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onPredict();
                }}
                whileHover={reduced ? undefined : { scale: 1.04 }}
                whileTap={reduced ? undefined : { scale: 0.97 }}
                className={`inline-flex items-center justify-center gap-1 shrink-0 min-h-[44px] px-3 rounded-xl border font-black uppercase tracking-widest transition-colors cursor-pointer ring-1 ${
                    isSm ? 'text-[8px]' : 'text-[8px] md:text-[9px]'
                } ${
                    hasPrediction
                        ? 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700 ring-green-300'
                        : 'bg-slate-900 hover:bg-orange-600 border-transparent text-white shadow-md ring-orange-200/50'
                }`}
                title={hasPrediction ? 'Tahmini görüntüle / güncelle' : 'Tahmin yap'}
            >
                <Target className={isSm ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
                <span className="truncate max-w-[72px] sm:max-w-none">
                    {hasPrediction ? predictionLabel(existingPrediction) : (
                        <>
                            <span className="sm:hidden">Tahmin</span>
                            <span className="hidden sm:inline">Tahmin Yap</span>
                        </>
                    )}
                </span>
            </motion.button>
        </div>
    );
}
