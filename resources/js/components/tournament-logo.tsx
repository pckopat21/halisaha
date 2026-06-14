import { cn } from '@/lib/utils';

export const TOURNAMENT_LOGO_SRC = '/images/premium/kgm5turnuva.png';

interface TournamentLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export default function TournamentLogo({
    className,
    alt = 'KGM 5 Futbol Turnuvası',
    ...props
}: TournamentLogoProps) {
    return (
        <img
            src={TOURNAMENT_LOGO_SRC}
            alt={alt}
            className={cn('object-contain', className)}
            {...props}
        />
    );
}
