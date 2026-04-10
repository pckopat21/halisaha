import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { Users, Shield, UserCircle, Search, Trash2, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

interface Unit {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    unit_id: number | null;
    unit: Unit | null;
}

interface Props {
    users: User[];
    roles: string[];
    units: Unit[];
    filters: { search?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Kullanıcı Yönetimi', href: '/users' },
];

export default function Index({ users, roles, units, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const { post, processing, delete: destroy } = useForm({});

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(route('users.index'), { search }, { preserveState: true, replace: true });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const updateValue = (userId: number, data: any) => {
        router.post(route('users.role', userId), data, {
            preserveScroll: true,
        });
    };

    const handleDelete = (user: User) => {
        if (confirm(`${user.name} kullanıcısını silmek istediğinize emin misiniz?`)) {
            destroy(route('users.destroy', user.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kullanıcı Yönetimi" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 uppercase">
                             <Users className="h-6 w-6 text-blue-600" /> Kullanıcı Yönetimi
                        </h1>
                        <p className="text-neutral-500 text-sm">Sistemdeki kullanıcıların rolleri, birimleri ve yetkileri.</p>
                    </div>
                    
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                        <Input
                            placeholder="İsim, e-posta veya birim ara..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <Card className="border-none shadow-xl overflow-hidden">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-neutral-50 dark:bg-neutral-900 border-b">
                                    <tr className="text-neutral-500 font-black uppercase text-[10px] tracking-widest">
                                        <th className="p-4">Kullanıcı Bilgileri</th>
                                        <th className="p-4">Birim / Departman</th>
                                        <th className="p-4">Mevcut Rol</th>
                                        <th className="p-4 text-right">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-black">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold uppercase leading-tight">{user.name}</p>
                                                        <p className="text-xs text-neutral-400">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Select
                                                    disabled={processing}
                                                    defaultValue={user.unit_id?.toString() || "none"}
                                                    onValueChange={(val) => updateValue(user.id, { unit_id: val === "none" ? null : val, role: user.role })}
                                                >
                                                    <SelectTrigger className="w-[200px] border-none bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 h-8 font-medium">
                                                        <SelectValue placeholder="Birim Seç" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">Birim Yok</SelectItem>
                                                        {units.map((unit) => (
                                                            <SelectItem key={unit.id} value={unit.id.toString()}>
                                                                {unit.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 uppercase text-[10px] font-black tracking-widest">
                                                    {user.role === 'super_admin' ? (
                                                        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none px-2 py-0.5">
                                                            <Shield className="h-3 w-3 mr-1" /> ADMİN
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-blue-600">
                                                            {user.role.replace('_', ' ')}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2 px-2">
                                                    <Select
                                                        disabled={processing}
                                                        defaultValue={user.role}
                                                        onValueChange={(val) => updateValue(user.id, { role: val, unit_id: user.unit_id })}
                                                    >
                                                        <SelectTrigger className="w-[140px] h-8 text-xs font-bold uppercase tracking-tighter">
                                                            <SelectValue placeholder="Rol" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {roles.map((role) => (
                                                                <SelectItem key={role} value={role} className="text-xs uppercase font-bold">
                                                                    {role.replace('_', ' ')}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon"
                                                        className="h-8 w-8 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => handleDelete(user)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {users.length === 0 && (
                            <div className="p-12 text-center text-neutral-500 uppercase font-black text-xs tracking-widest">
                                Kullanıcı bulunamadı.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${className}`}>
            {children}
        </span>
    );
}
