import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Trophy, Users, CalendarDays, Briefcase, BookOpen, Folder, Building2, BarChart3, MapPin, Image as ImageIcon, Bell } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Panel',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Duyuru Yönetimi',
        url: '/announcements',
        icon: Bell,
    },
    {
        title: 'Turnuvalar',
        url: '/tournaments',
        icon: Trophy,
    },
    {
        title: 'Turnuva Galerisi',
        url: '/gallery',
        icon: ImageIcon,
    },
    {
        title: 'Takımlar',
        url: '/teams',
        icon: Users,
    },
    {
        title: 'Fikstür',
        url: '/games',
        icon: CalendarDays,
    },
    {
        title: 'Kullanıcı Yönetimi',
        url: '/users',
        icon: Briefcase,
    },
    {
        title: 'Personel Havuzu',
        url: '/players',
        icon: Building2,
    },
    {
        title: 'Saha Yönetimi',
        url: '/fields',
        icon: MapPin,
    },
    {
        title: 'İstatistikler',
        url: '/statistics',
        icon: BarChart3,
    },
    {
        title: 'Birim Tanımlama',
        url: '/units',
        icon: Building2,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const userRole = auth.user?.role;

    // Filter or define nav items based on user role
    const filteredNavItems = mainNavItems.filter((item) => {
        // Everyone can see these (Visitor list)
        if (['Turnuvalar', 'Takımlar', 'Fikstür'].includes(item.title)) {
            return true;
        }

        // Dashboard is only for logged-in users
        if (item.title === 'Panel') {
            return !!auth.user;
        }

        // Admin/Committee only items
        if (['Kullanıcı Yönetimi', 'Personel Havuzu', 'Saha Yönetimi', 'Turnuva Galerisi', 'Duyuru Yönetimi'].includes(item.title)) {
            return auth.user?.role === 'super_admin' || auth.user?.role === 'committee';
        }

        // Super Admin only items
        if (item.title === 'Birim Tanımlama') {
            return auth.user?.role === 'super_admin';
        }

        return true;
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {auth.user ? (
                    <>
                        <NavFooter items={footerNavItems} className="mt-auto" />
                        <NavUser />
                    </>
                ) : (
                    <div className="p-4">
                        <Link href={route('login')}>
                            <Button className="w-full bg-emerald-600 font-bold hover:bg-emerald-700">GİRİŞ YAP</Button>
                        </Link>
                    </div>
                )}
            </SidebarFooter>
        </Sidebar>
    );
}
