import TournamentLogo from './tournament-logo';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md overflow-hidden shrink-0">
                <TournamentLogo className="size-8" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-black uppercase tracking-tighter">KGM 5 Turnuva</span>
                <span className="truncate text-[10px] font-medium opacity-50">Turnuva Yönetimi</span>
            </div>
        </>
    );
}
