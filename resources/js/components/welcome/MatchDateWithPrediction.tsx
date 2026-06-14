import { motion } from 'framer-motion';
import { Calendar, Target } from 'lucide-react';
import { useReducedMotion } from '@/lib/motion-presets';

export interface MatchDateMeta {
    dayLabel: string;
    fullDate: string;
    time: string;
}

function predictionLabel(existing: any | null): string {
    if (!existing) return '';
    if (existing.prediction_type === 'outcome') {
        const map: Record<string, string> = { home: '1', draw: 'X', away: '2' };
        return map[existing.outcome] ?? '1';
    }
    return `${existing.home_score}-${existing.away_score}`;
}

export function MatchDateLabel({
    dateMeta,
    size = 'md',
}: {
    dateMeta: MatchDateMeta;
    size?: 'sm' | 'md';
}) {
    const isSm = size === 'sm';
    return (
        <div className="flex items-center gap-1 shrink-0">
            <Calendar className={`text-orange-500 ${isSm ? 'h-2.5 w-2.5' : 'h-3 w-3'}`} />
            <span
                className={`font-bold text-orange-600 uppercase whitespace-nowrap ${
                    isSm ? 'text-[8px]' : 'text-[8px] md:text-[9px]'
                }`}
            >
                {dateMeta.dayLabel === 'Bugün' ? 'BUGÜN' : dateMeta.fullDate}
            </span>
        </div>
    );
}

/** Maç kartının altında, tam genişlik renkli tahmin butonu */
export function PredictionActionButton({
    existingPrediction,
    onPredict,
    size = 'md',
}: {
    existingPrediction: any | null;
    onPredict: () => void;
    size?: 'sm' | 'md';
}) {
    const reduced = useReducedMotion();
    const hasPrediction = !!existingPrediction;
    const isSm = size === 'sm';

    return (
        <motion.button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPredict();
            }}
            whileHover={reduced ? undefined : { scale: 1.02 }}
            whileTap={reduced ? undefined : { scale: 0.98 }}
            className={`w-full flex items-center justify-center gap-2 rounded-xl font-black uppercase tracking-widest transition-all cursor-pointer ${
                isSm
                    ? 'h-9 text-[8px] md:text-[9px] shadow-md'
                    : 'h-10 md:h-11 text-[9px] md:text-[10px] shadow-lg rounded-2xl'
            } ${
                hasPrediction
                    ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-emerald-500/25 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600'
                    : 'bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white shadow-orange-500/30 hover:from-orange-600 hover:via-orange-700 hover:to-amber-600'
            }`}
            title={hasPrediction ? 'Tahmini görüntüle / güncelle' : 'Şimdi tahminde bulun'}
        >
            <Target className={isSm ? 'h-3.5 w-3.5 shrink-0' : 'h-4 w-4 shrink-0'} />
            <span className="truncate">
                {hasPrediction
                    ? `Tahminin: ${predictionLabel(existingPrediction)} · Güncelle`
                    : 'Şimdi Tahminde Bulun'}
            </span>
        </motion.button>
    );
}

interface MatchFixtureHeaderProps {
    groupName: string;
    dateMeta: MatchDateMeta;
    size?: 'sm' | 'md';
    variant?: 'card' | 'list';
}

/** Grup (sol) · Tarih (sağ) */
export default function MatchFixtureHeader({
    groupName,
    dateMeta,
    size = 'md',
    variant = 'card',
}: MatchFixtureHeaderProps) {
    const isSm = size === 'sm';

    return (
        <div
            className={`flex items-center justify-between gap-2 min-w-0 ${
                variant === 'card' ? 'pb-3 border-b border-orange-50' : 'mb-2'
            }`}
        >
            <span
                className={`font-black text-slate-400 uppercase tracking-widest truncate min-w-0 ${
                    isSm ? 'text-[9px]' : 'text-[9px] md:text-[10px]'
                }`}
            >
                {groupName}
            </span>
            <MatchDateLabel dateMeta={dateMeta} size={size} />
        </div>
    );
}
