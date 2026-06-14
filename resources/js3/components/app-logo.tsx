import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-black uppercase tracking-tighter">Halı Saha PRO</span>
                <span className="truncate text-[10px] font-medium opacity-50">Turnuva Yönetimi</span>
            </div>
        </>
    );
}
