import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { 
    Users, 
    UserPlus, 
    FileUp, 
    Download, 
    Search, 
    Building2, 
    CheckCircle, 
    AlertCircle, 
    Trash2, 
    Edit, 
    Trophy,
    Shield,
    MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Personel Havuzu', href: '/players' },
];

interface Player {
    id: number;
    first_name: string;
    last_name: string;
    tc_id: string;
    sicil_no: string;
    is_company_staff: boolean;
    is_permanent_staff: boolean;
    is_licensed: boolean;
    health_certificate_at: string | null;
    unit: { id: number; name: string } | null;
    teams: Array<{ id: number; name: string; tournament: { name: string } }>;
}

interface PageProps {
    players: {
        data: Player[];
        links: any;
        current_page: number;
        last_page: number;
        total: number;
    };
    units: Array<{ id: number; name: string }>;
    filters: { search?: string };
}

export default function Index({ players, units, filters }: PageProps) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

    const { data: addData, setData: setAddData, post: postAdd, processing: adding, reset: resetAdd, errors: addErrors } = useForm({
        first_name: '',
        last_name: '',
        tc_id: '',
        sicil_no: '',
        unit_id: '',
        is_company_staff: false,
        is_permanent_staff: true,
        is_licensed: false,
        health_certificate: false,
    });

    const { data: importData, setData: setImportData, post: postImport, processing: importing } = useForm({
        file: null as File | null,
    });

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        router.get(route('players.index'), { search: val }, { preserveState: true, replace: true });
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPlayer) {
            router.put(route('players.update', editingPlayer.id), addData as any, {
                onSuccess: () => {
                    setIsAddOpen(false);
                    setEditingPlayer(null);
                    resetAdd();
                }
            });
        } else {
            postAdd(route('players.store'), {
                onSuccess: () => {
                    setIsAddOpen(false);
                    resetAdd();
                }
            });
        }
    };

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postImport(route('players.import'), {
            onSuccess: () => {
                setIsImportOpen(false);
                setImportData('file', null);
            }
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Bu personeli silmek istediğinize emin misiniz?')) {
            router.delete(route('players.destroy', id));
        }
    };

    const openEdit = (player: Player) => {
        setEditingPlayer(player);
        setAddData({
            first_name: player.first_name,
            last_name: player.last_name,
            tc_id: player.tc_id,
            sicil_no: player.sicil_no,
            unit_id: player.unit?.id.toString() || '',
            is_company_staff: player.is_company_staff,
            is_permanent_staff: player.is_permanent_staff,
            is_licensed: player.is_licensed,
            health_certificate: !!player.health_certificate_at,
        });
        setIsAddOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Personel Havuzu" />
            
            <div className="flex h-full flex-1 flex-col gap-8 p-8 font-sans">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight uppercase leading-none">Personel Havuzu</h1>
                        <p className="text-neutral-500 mt-2 font-medium">Turnuvaya katılabilecek tüm şirket personelini buradan yönetin.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="h-12 px-6 rounded-2xl border-neutral-200 uppercase font-black text-[10px] tracking-widest hover:bg-neutral-50">
                                    <FileUp className="mr-2 h-4 w-4" /> TOPLU AKTARIM
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                                <DialogHeader className="p-8 bg-neutral-900 text-white">
                                    <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                                        <FileUp className="h-6 w-6 text-blue-500" /> PERSONEL AKTAR
                                    </DialogTitle>
                                    <DialogDescription className="text-neutral-400 font-bold uppercase text-[10px] tracking-widest mt-1">
                                        Excel/CSV dosyanızı yükleyerek tüm personeli saniyeler içinde kaydedin.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleImportSubmit} className="p-8 space-y-6">
                                    <div className="p-6 border-2 border-dashed border-neutral-200 rounded-3xl text-center space-y-4 hover:border-blue-500/50 transition-colors">
                                        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
                                            <FileUp className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-tight">DOSYAYI BURAYA BIRAKIN</p>
                                            <p className="text-[10px] text-neutral-400 font-bold mt-1">Sadece CSV dosyaları desteklenir</p>
                                        </div>
                                        <input type="file" className="hidden" id="csv-file" onChange={e => setImportData('file', e.target.files?.[0] || null)} />
                                        <Label htmlFor="csv-file" className="inline-block px-6 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-[10px] font-black uppercase cursor-pointer transition-colors">DOSYA SEÇ</Label>
                                        {importData.file && <p className="text-[10px] font-black text-blue-600 uppercase">SEÇİLDİ: {importData.file.name}</p>}
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <Button type="submit" disabled={importing || !importData.file} className="h-12 bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest text-[10px] rounded-xl">İÇE AKTARIŞI BAŞLAT</Button>
                                        <a href={route('players.template')} className="text-center text-[10px] font-black uppercase text-neutral-400 hover:text-neutral-900 transition-colors flex items-center justify-center gap-2">
                                            <Download className="h-3 w-3" /> TASLAK DOSYAYI İNDİR
                                        </a>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isAddOpen} onOpenChange={(val) => { setIsAddOpen(val); if(!val) { setEditingPlayer(null); resetAdd(); } }}>
                            <DialogTrigger asChild>
                                <Button className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-blue-500/20">
                                    <UserPlus className="mr-2 h-4 w-4" /> YENİ PERSONEL
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                                <DialogHeader className="p-8 bg-neutral-900 text-white">
                                    <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
                                        {editingPlayer ? 'PERSONEL DÜZENLE' : 'YENİ PERSONEL KAYDI'}
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleAddSubmit} className="p-8 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-neutral-400">AD</Label>
                                            <Input required className="h-11 rounded-xl bg-neutral-50 border-neutral-100 uppercase font-bold" value={addData.first_name} onChange={e => setAddData('first_name', e.target.value)} />
                                            {addErrors.first_name && <p className="text-[10px] text-rose-500 font-bold">{addErrors.first_name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-neutral-400">SOYAD</Label>
                                            <Input required className="h-11 rounded-xl bg-neutral-50 border-neutral-100 uppercase font-bold" value={addData.last_name} onChange={e => setAddData('last_name', e.target.value)} />
                                            {addErrors.last_name && <p className="text-[10px] text-rose-500 font-bold">{addErrors.last_name}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-neutral-400">TC NO</Label>
                                            <Input required maxLength={11} className="h-11 rounded-xl bg-neutral-50 border-neutral-100 font-bold" value={addData.tc_id} onChange={e => setAddData('tc_id', e.target.value)} />
                                            {addErrors.tc_id && <p className="text-[10px] text-rose-500 font-bold">{addErrors.tc_id}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-neutral-400">SİCİL NO</Label>
                                            <Input required className="h-11 rounded-xl bg-neutral-50 border-neutral-100 uppercase font-bold" value={addData.sicil_no} onChange={e => setAddData('sicil_no', e.target.value)} />
                                            {addErrors.sicil_no && <p className="text-[10px] text-rose-500 font-bold">{addErrors.sicil_no}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-neutral-400">BİRİM</Label>
                                        <Select value={addData.unit_id} onValueChange={val => setAddData('unit_id', val)}>
                                            <SelectTrigger className="h-11 rounded-xl bg-neutral-50 border-neutral-100 font-bold">
                                                <SelectValue placeholder="BİRİM SEÇİN" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {units.map(u => <SelectItem key={u.id} value={u.id.toString()} className="uppercase font-bold text-xs">{u.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {addErrors.unit_id && <p className="text-[10px] text-rose-500 font-bold">{addErrors.unit_id}</p>}
                                    </div>

                                    <div className="space-y-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                        <RadioGroup className="flex gap-6" value={addData.is_company_staff ? 'company' : 'permanent'} onValueChange={v => { setAddData({ ...addData, is_company_staff: v === 'company', is_permanent_staff: v === 'permanent' }) }}>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="permanent" id="a1" />
                                                <Label htmlFor="a1" className="text-xs font-bold uppercase cursor-pointer">KADROLU</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="company" id="a2" />
                                                <Label htmlFor="a2" className="text-xs font-bold uppercase cursor-pointer">FİRMA</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    <div className="flex items-center gap-6 px-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="lic" checked={addData.is_licensed} onCheckedChange={v => setAddData('is_licensed', !!v)} />
                                            <Label htmlFor="lic" className="text-[10px] font-black uppercase cursor-pointer">LİSANSLI</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="hea" checked={addData.health_certificate} onCheckedChange={v => setAddData('health_certificate', !!v)} />
                                            <Label htmlFor="hea" className="text-[10px] font-black uppercase cursor-pointer">SAĞLIK RAPORU VAR</Label>
                                        </div>
                                    </div>

                                    <Button type="submit" disabled={adding} className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest text-[10px] rounded-xl">{editingPlayer ? 'GÜNCELLE' : 'PERSONELİ EKLE'}</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Card className="border-none shadow-2xl bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 border-b border-neutral-50 dark:border-neutral-800 flex flex-row items-center justify-between">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-4 top-3 h-4 w-4 text-neutral-400" />
                            <Input placeholder="İSİM, TC VEYA SİCİL İLE ARA..." className="h-10 pl-11 rounded-2xl bg-neutral-50 border-neutral-100 uppercase font-bold text-xs" defaultValue={filters.search} onChange={handleSearch} />
                        </div>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{players.total} KAYITLI PERSONEL</p>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-neutral-50/50 hover:bg-transparent border-none">
                                    <TableHead className="py-6 px-8 uppercase font-black text-[10px] text-neutral-400 tracking-widest">Personel Bilgileri</TableHead>
                                    <TableHead className="py-6 uppercase font-black text-[10px] text-neutral-400 tracking-widest">Birim / Tip</TableHead>
                                    <TableHead className="py-6 uppercase font-black text-[10px] text-neutral-400 tracking-widest">Durum</TableHead>
                                    <TableHead className="py-6 px-8 text-right uppercase font-black text-[10px] text-neutral-400 tracking-widest">İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {players.data.map((player) => {
                                    const activeTeam = player.teams[0];
                                    return (
                                        <TableRow key={player.id} className="group transition-all hover:bg-neutral-50/50 border-b border-neutral-50">
                                            <TableCell className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-neutral-100 flex items-center justify-center font-black uppercase text-sm text-neutral-500">
                                                        {player.first_name.charAt(0)}{player.last_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black uppercase text-sm tracking-tighter leading-none">{player.first_name} {player.last_name}</p>
                                                        <p className="text-[10px] text-neutral-400 font-bold mt-1 uppercase">SİCİL: {player.sicil_no} • TC: {player.tc_id}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-3 w-3 text-neutral-300" />
                                                        <span className="text-[10px] font-black uppercase text-neutral-500 tracking-tight">{player.unit?.name || 'BELİRSİZ'}</span>
                                                    </div>
                                                    <Badge className="w-fit bg-neutral-50 text-neutral-400 border-none text-[8px] font-black px-2 py-0.5 rounded-full">
                                                        {player.is_company_staff ? 'FİRMA PERSONELİ' : 'KADROLU PERSONEL'}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                {activeTeam ? (
                                                    <div className="flex flex-col gap-1.5">
                                                        <Badge className="w-fit bg-blue-50 text-blue-600 border-none text-[8px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1.5">
                                                            <Trophy className="h-2.5 w-2.5" /> {activeTeam.name}
                                                        </Badge>
                                                        <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest pl-1">{activeTeam.tournament.name}</span>
                                                    </div>
                                                ) : (
                                                    <Badge className="w-fit bg-emerald-50 text-emerald-600 border-none text-[8px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1.5">
                                                        <CheckCircle className="h-2.5 w-2.5" /> MÜSAİT (HAVUZDA)
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-neutral-100" onClick={() => openEdit(player)}>
                                                        <Edit className="h-4 w-4 text-neutral-400" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-rose-50 text-rose-600" onClick={() => handleDelete(player.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
                
                {/* Simple Pagination */}
                <div className="flex items-center justify-center gap-4 py-4">
                    <Button 
                        disabled={players.current_page === 1}
                        variant="ghost" 
                        onClick={() => router.get(players.links[0].url)}
                        className="text-[10px] font-black uppercase tracking-widest"
                    >
                        ÖNCEKİ
                    </Button>
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">SAYFA {players.current_page} / {players.last_page}</span>
                    <Button 
                        disabled={players.current_page === players.last_page}
                        variant="ghost" 
                        onClick={() => router.get(players.links[players.links.length - 1].url)}
                        className="text-[10px] font-black uppercase tracking-widest"
                    >
                        SONRAKİ
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
