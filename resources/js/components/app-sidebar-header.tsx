import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType, SharedData } from '@/types';
import { usePage, router } from '@inertiajs/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { auth, regions, current_region_id } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user.role === 'super_admin';

    const handleRegionChange = (value: string) => {
        router.post(route('region.switch'), { region_id: value }, { preserveScroll: true });
    };

    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center justify-between gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            
            {isSuperAdmin && regions && (
                <div className="flex items-center">
                    <Select value={current_region_id.toString()} onValueChange={handleRegionChange}>
                        <SelectTrigger className="w-[200px] h-8 text-xs">
                            <SelectValue placeholder="Bölge Seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tüm Bölgeler</SelectItem>
                            {regions.map((region) => (
                                <SelectItem key={region.id} value={region.id.toString()}>
                                    {region.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </header>
    );
}
