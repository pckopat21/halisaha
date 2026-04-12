import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router, Link } from '@inertiajs/react';
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
    MoreHorizontal,
    Shirt,
    Briefcase,
    Crown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { toast } from 'sonner';

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
    jersey_number: number | null;
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
        links: any[];
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

    const { data: addData, setData: setAddData, post: postAdd, put: putUpdate, processing: processing, reset: resetAdd, errors: addErrors } = useForm({
        first_name: '',
        last_name: '',
        tc_id: '',
        sicil_no: '',
        jersey_number: '' as string | number,
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
            putUpdate(route('players.update', editingPlayer.id), {
                onSuccess: () => {
                    setIsAddOpen(false);
                    setEditingPlayer(null);
                    resetAdd();
                    toast.success('Personel bilgileri güncellendi.');
                }
            });
        } else {
            postAdd(route('players.store'), {
                onSuccess: () => {
                    setIsAddOpen(false);
                    resetAdd();
                    toast.success('Yeni personel havuzuna başarıyla eklendi.');
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
                toast.success('Toplu personel aktarımı tamamlandı.');
            }
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Bu personeli havuzdan silmek istediğinize emin misiniz?')) {
            router.delete(route('players.destroy', id), {
                onSuccess: () => toast.success('Personel silindi.')
            });
        }
    };

    const openEdit = (player: Player) => {
        setEditingPlayer(player);
        setAddData({
            first_name: player.first_name,
            last_name: player.last_name,
            tc_id: player.tc_id,
            sicil_no: player.sicil_no,
            jersey_number: player.jersey_number || '',
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

            <div className="flex h-full flex-1 flex-col gap-8 p-4 md:p-8 font-sans">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-none">Personel Havuzu</h1>
                        <p className="text-neutral-500 mt-2 font-medium text-sm md:text-base">Turnuvaya katılabilecek tüm kurumsal personel veritabanı.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="h-14 px-6 rounded-2xl border-neutral-200 uppercase font-black text-[10px] tracking-widest hover:bg-neutral-900 hover:text-white transition-all">
                                    <FileUp className="mr-2 h-5 w-5" /> TOPLU AKTARIM
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                                <DialogHeader className="p-8 bg-neutral-950 text-white">
                                    <DialogTitle className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                                        <FileUp className="h-8 w-8 text-blue-500" /> PERSONEL AKTAR
                                    </DialogTitle>
                                    <DialogDescription className="text-neutral-400 font-bold uppercase text-[10px] tracking-widest mt-2">
                                        EXCEL (.XLSX) DOSYANIZI YÜKLEYEREK TOPLU KAYIT YAPIN.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleImportSubmit} className="p-8 space-y-6">
                                    <div className="p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-[2rem] text-center space-y-4 hover:border-blue-500/50 transition-colors bg-neutral-50 dark:bg-neutral-900/50">
                                        <div className="h-16 w-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mx-auto">
                                            <FileUp className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-tight text-neutral-900 dark:text-white">DOSYAYI BURAYA BIRAKIN</p>
                                            <p className="text-[10px] text-neutral-400 font-bold mt-1 uppercase">SADECE EXCEL (.XLSX) DOSYALARI</p>
                                        </div>
                                        <input type="file" className="hidden" id="csv-file" onChange={e => setImportData('file', e.target.files?.[0] || null)} />
                                        <Label htmlFor="csv-file" className="inline-block px-8 py-3 bg-neutral-900 text-white hover:scale-105 active:scale-95 rounded-xl text-[10px] font-black uppercase cursor-pointer transition-all tracking-widest">DOSYA SEÇ</Label>
                                        {importData.file && <p className="text-[10px] font-black text-blue-600 uppercase pt-2">SEÇİLDİ: {importData.file.name}</p>}
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <Button type="submit" disabled={importing || !importData.file} className="h-14 bg-blue-600 hover:bg-black font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-500/10 transition-all">İÇE AKTARIŞI BAŞLAT</Button>
                                        <a href={route('players.template')} className="text-center text-[10px] font-black uppercase text-neutral-400 hover:text-neutral-900 transition-colors flex items-center justify-center gap-2 tracking-widest">
                                            <Download className="h-4 w-4" /> TASLAK DOSYAYI İNDİR
                                        </a>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isAddOpen} onOpenChange={(val) => { setIsAddOpen(val); if (!val) { setEditingPlayer(null); resetAdd(); } }}>
                            <DialogTrigger asChild>
                                <Button className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95">
                                    <UserPlus className="mr-2 h-5 w-5" /> PERSONEL EKLE
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                                <DialogHeader className="p-8 bg-neutral-950 text-white">
                                    <DialogTitle className="text-3xl font-black uppercase tracking-tighter">
                                        {editingPlayer ? 'BİLGİLERİ GÜNCELLE' : 'YENİ PERSONEL KAYDI'}
                                    </DialogTitle>
                                    <DialogDescription className="text-neutral-400 font-bold uppercase text-[10px] tracking-widest mt-2 leading-relaxed">
                                        PERSONEL BİLGİLERİNİ EKSİKSİZ VE DOĞRU BİR ŞEKİLDE TANIMLAYIN.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleAddSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-neutral-400 ml-1">AD</Label>
                                            <Input required className="h-12 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-none font-black uppercase text-sm px-5 dark:text-white" value={addData.first_name} onChange={e => setAddData('first_name', e.target.value)} />
                                            {addErrors.first_name && <p className="text-[10px] text-rose-500 font-bold">{addErrors.first_name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-neutral-400 ml-1">SOYAD</Label>
                                            <Input required className="h-12 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-none font-black uppercase text-sm px-5 dark:text-white" value={addData.last_name} onChange={e => setAddData('last_name', e.target.value)} />
                                            {addErrors.last_name && <p className="text-[10px] text-rose-500 font-bold">{addErrors.last_name}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <div className="md:col-span-2 space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-neutral-400 ml-1">TC NO</Label>
                                            <Input required maxLength={11} className="h-12 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-none font-bold text-sm px-5 dark:text-white" value={addData.tc_id} onChange={e => setAddData('tc_id', e.target.value)} />
                                            {addErrors.tc_id && <p className="text-[10px] text-rose-500 font-bold">{addErrors.tc_id}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-neutral-400 ml-1">FORMA NO</Label>
                                            <div className="relative">
                                                <Shirt className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="99"
                                                    className="h-12 pl-12 rounded-2xl bg-neutral-900 text-white border-none font-black text-sm"
                                                    value={addData.jersey_number}
                                                    onChange={e => setAddData('jersey_number', e.target.value)}
                                                />
                                            </div>
                                            {addErrors.jersey_number && <p className="text-[10px] text-rose-500 font-bold">{addErrors.jersey_number}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-neutral-400 ml-1">SİCİL NO</Label>
                                            <Input required className="h-12 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-none font-black uppercase text-sm px-5 dark:text-white" value={addData.sicil_no} onChange={e => setAddData('sicil_no', e.target.value)} />
                                            {addErrors.sicil_no && <p className="text-[10px] text-rose-500 font-bold">{addErrors.sicil_no}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-neutral-400 ml-1">BİRİM</Label>
                                            <Select value={addData.unit_id} onValueChange={val => setAddData('unit_id', val)}>
                                                <SelectTrigger className="h-12 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-none font-black text-sm px-5 uppercase dark:text-white">
                                                    <SelectValue placeholder="BİRİM SEÇ" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-none shadow-2xl dark:bg-neutral-800">
                                                    {units.map(u => <SelectItem key={u.id} value={u.id.toString()} className="uppercase font-black text-[10px] py-3 dark:text-white">{u.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            {addErrors.unit_id && <p className="text-[10px] text-rose-500 font-bold">{addErrors.unit_id}</p>}
                                        </div>
                                    </div>

                                    <div className="p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-[2rem] border border-neutral-100 dark:border-neutral-800 space-y-4">
                                        <Label className="text-[10px] font-black uppercase text-neutral-400 ml-1">PERSONEL STATÜSÜ</Label>
                                        <RadioGroup className="flex flex-col sm:flex-row gap-6 sm:gap-12" value={addData.is_company_staff ? 'company' : 'permanent'} onValueChange={v => { setAddData({ ...addData, is_company_staff: v === 'company', is_permanent_staff: v === 'permanent' }) }}>
                                            <div className="flex items-center space-x-3 group cursor-pointer">
                                                <RadioGroupItem value="permanent" id="a1" className="h-5 w-5 border-neutral-300 text-blue-600" />
                                                <Label htmlFor="a1" className="text-xs font-black uppercase cursor-pointer group-hover:text-blue-600 transition-colors">KADROLU PERSONEL</Label>
                                            </div>
                                            <div className="flex items-center space-x-3 group cursor-pointer">
                                                <RadioGroupItem value="company" id="a2" className="h-5 w-5 border-neutral-300 text-blue-600" />
                                                <Label htmlFor="a2" className="text-xs font-black uppercase cursor-pointer group-hover:text-blue-600 transition-colors">FİRMA PERSONELİ</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 px-4 py-2">
                                        <div className="flex items-center space-x-3 cursor-pointer group">
                                            <Checkbox id="lic" checked={addData.is_licensed} onCheckedChange={v => setAddData('is_licensed', !!v)} className="h-5 w-5 rounded-lg border-neutral-300" />
                                            <Label htmlFor="lic" className="text-[10px] font-black uppercase cursor-pointer group-hover:text-blue-600">LİSANSLI SPORCU</Label>
                                        </div>
                                        <div className="flex items-center space-x-3 cursor-pointer group">
                                            <Checkbox id="hea" checked={addData.health_certificate} onCheckedChange={v => setAddData('health_certificate', !!v)} className="h-5 w-5 rounded-lg border-neutral-300" />
                                            <Label htmlFor="hea" className="text-[10px] font-black uppercase cursor-pointer group-hover:text-indigo-600 font-sans">SAĞLIK RAPORU MEVCUT</Label>
                                        </div>
                                    </div>

                                    <Button type="submit" disabled={processing} className="w-full h-16 bg-neutral-900 hover:bg-black text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-2xl transition-all active:scale-95 mt-4">
                                        {editingPlayer ? 'DEĞİŞİKLİKLERİ KAYDET' : 'PERSONELİ SİSTEME EKLE'}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Quick Filters Row */}
                <div className="flex flex-wrap items-center gap-3">
                    <Button 
                        variant={!filters.filter ? 'default' : 'outline'} 
                        onClick={() => router.get(route('players.index'), { ...filters, filter: '' })}
                        className={`h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!filters.filter ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-lg' : 'border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:border-neutral-900 dark:hover:border-white hover:text-neutral-900 dark:hover:text-white'}`}
                    >
                        TÜMÜ
                    </Button>
                    <Button 
                        variant={filters.filter === 'licensed' ? 'default' : 'outline'} 
                        onClick={() => router.get(route('players.index'), { ...filters, filter: 'licensed' })}
                        className={`h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filters.filter === 'licensed' ? 'bg-blue-600 text-white shadow-lg' : 'border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:border-blue-600 hover:text-blue-600'}`}
                    >
                        <Shield className="mr-2 h-4 w-4" /> LİSANSLI
                    </Button>
                    <Button 
                        variant={filters.filter === 'permanent' ? 'default' : 'outline'} 
                        onClick={() => router.get(route('players.index'), { ...filters, filter: 'permanent' })}
                        className={`h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filters.filter === 'permanent' ? 'bg-emerald-600 text-white shadow-lg' : 'border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:border-emerald-600 hover:text-emerald-600'}`}
                    >
                        <Briefcase className="mr-2 h-4 w-4" /> KADROLU
                    </Button>
                    <Button 
                        variant={filters.filter === 'company' ? 'default' : 'outline'} 
                        onClick={() => router.get(route('players.index'), { ...filters, filter: 'company' })}
                        className={`h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filters.filter === 'company' ? 'bg-indigo-600 text-white shadow-lg' : 'border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:border-indigo-600 hover:text-indigo-600'}`}
                    >
                        <Building2 className="mr-2 h-4 w-4" /> FİRMA
                    </Button>
                    <Button 
                        variant={filters.filter === 'available' ? 'default' : 'outline'} 
                        onClick={() => router.get(route('players.index'), { ...filters, filter: 'available' })}
                        className={`h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filters.filter === 'available' ? 'bg-amber-500 text-white shadow-lg' : 'border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:border-amber-500 hover:text-amber-500'}`}
                    >
                        <CheckCircle className="mr-2 h-4 w-4" /> MÜSAİT (HAVUZ)
                    </Button>
                </div>

                {/* Table Section */}
                <Card className="border-none shadow-2xl bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 md:p-10 border-b border-neutral-50 dark:border-neutral-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
                        <div className="relative w-full md:max-w-lg group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 group-focus-within:text-blue-600 transition-colors" />
                            <Input
                                placeholder="İSİM, TC VEYA SİCİL İLE HIZLI ARA..."
                                className="h-14 pl-12 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-none uppercase font-black text-[11px] tracking-widest focus:ring-2 focus:ring-blue-600/10 dark:focus:ring-blue-600/30 placeholder:text-neutral-300 shadow-inner dark:text-white"
                                defaultValue={filters.search}
                                onChange={handleSearch}
                            />
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest bg-neutral-50 dark:bg-neutral-800/50 px-6 py-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                            <span className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-blue-600" /> {players.total} KAYITLI PERSONEL
                            </span>
                        </div>
                    </CardHeader>
                    <div className="overflow-x-auto min-h-[400px]">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-neutral-50/50 dark:bg-neutral-800/50 hover:bg-transparent border-none">
                                    <TableHead className="py-8 px-8 uppercase font-black text-[10px] text-neutral-400 tracking-widest w-[100px] text-center">FORMA</TableHead>
                                    <TableHead className="py-8 px-4 uppercase font-black text-[10px] text-neutral-400 tracking-widest min-w-[200px]">Personel Bilgileri</TableHead>
                                    <TableHead className="py-8 uppercase font-black text-[10px] text-neutral-400 tracking-widest min-w-[150px] hidden lg:table-cell">Birim / Statü</TableHead>
                                    <TableHead className="py-8 uppercase font-black text-[10px] text-neutral-400 tracking-widest text-center">Turnuva Durumu</TableHead>
                                    <TableHead className="py-8 px-8 text-right uppercase font-black text-[10px] text-neutral-400 tracking-widest">İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {players.data.map((player) => {
                                    const activeTeam = player.teams[0];
                                    return (
                                        <TableRow key={player.id} className="group transition-all hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 border-b border-neutral-50 dark:border-neutral-800 text-slate-900 dark:text-neutral-100">
                                            <TableCell className="px-8 py-6">
                                                <div className="flex flex-col items-center justify-center gap-1">
                                                    <div className={`h-12 w-12 rounded-full flex items-center justify-center font-black text-lg relative ${player.jersey_number ? 'bg-neutral-900 text-white shadow-lg' : 'bg-neutral-100 text-neutral-300'}`}>
                                                        {player.jersey_number || '??'}
                                                        {player.is_licensed && (
                                                            <div className="absolute -top-1 -right-1 bg-blue-600 text-white p-1 rounded-full shadow-lg border-2 border-white">
                                                                <Shield className="h-2 w-2" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-6">
                                                <Link href={route('players.show', player.id)} className="flex items-center gap-4 group/player">
                                                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-[1rem] md:rounded-[1.25rem] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black uppercase text-xs md:text-sm shrink-0 group-hover/player:bg-blue-600 group-hover/player:text-white transition-all">
                                                        {player.first_name.charAt(0)}{player.last_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-black uppercase text-xs md:text-sm tracking-tighter leading-none group-hover/player:text-blue-600 dark:group-hover/player:text-blue-400 transition-colors dark:text-white">
                                                                {player.first_name} {player.last_name}
                                                            </p>
                                                            {player.is_licensed && <Shield className="h-3 w-3 text-blue-600 lg:hidden" />}
                                                        </div>
                                                        <p className="text-[9px] md:text-[10px] text-neutral-400 font-bold mt-2 uppercase tracking-wide">
                                                            SİCİL: {player.sicil_no} <span className="mx-1 opacity-30">•</span> TC: {player.tc_id}
                                                        </p>
                                                    </div>
                                                </Link>
                                            </TableCell>
                                            <TableCell className="py-6 hidden lg:table-cell">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-3 w-3 text-neutral-300 dark:text-neutral-600" />
                                                        <span className="text-[11px] font-black uppercase text-neutral-900 dark:text-white tracking-tight">{player.unit?.name || 'BİRİM TANIMSIZ'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${player.is_company_staff ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500'}`}>
                                                            {player.is_company_staff ? 'FİRMA' : 'KADROLU'}
                                                        </span>
                                                        {player.is_licensed && (
                                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-warning-50 dark:bg-warning-900/20 text-yellow-600 dark:text-yellow-500 flex items-center gap-1">
                                                                <Shield className="h-2.5 w-2.5" /> LİSANSLI
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-6 text-center">
                                                {activeTeam ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none text-[9px] font-black px-3 md:px-4 py-1.5 rounded-lg uppercase flex items-center gap-2 shadow-lg shadow-blue-600/20">
                                                            <Trophy className="h-3 w-3" /> {activeTeam.name}
                                                        </Badge>
                                                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest hidden md:block">{activeTeam.tournament.name}</span>
                                                    </div>
                                                ) : (
                                                    <Badge className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-black px-3 md:px-4 py-1.5 rounded-lg uppercase flex items-center gap-2 mx-auto w-fit">
                                                        <CheckCircle className="h-3 w-3" /> HAVUZDA MÜSAİT
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-1 md:gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                                                        onClick={() => openEdit(player)}
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all text-neutral-300"
                                                        onClick={() => handleDelete(player.id)}
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {players.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-32 text-center">
                                            <div className="bg-neutral-50 h-20 w-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                                <Users className="h-10 w-10 text-neutral-200" />
                                            </div>
                                            <p className="text-sm font-black text-neutral-400 uppercase tracking-[0.2em] px-4">
                                                {filters.search ? 'ARAMA KRİTERİNE UYGUN PERSONEL BULUNAMADI' : 'HENÜZ PERSONEL HAVUZUNA KAYIT YAPILMAMIŞ'}
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4 py-6 bg-white dark:bg-neutral-900 rounded-[2rem] shadow-sm border border-neutral-100 dark:border-neutral-800 mb-12">
                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest order-2 sm:order-1">
                        SAYFA {players.current_page} / {players.last_page} <span className="mx-2 opacity-30">•</span> TOPLAM {players.total} KAYIT
                    </p>
                    <div className="flex items-center gap-2 order-1 sm:order-2">
                        <Button
                            disabled={players.current_page === 1}
                            variant="outline"
                            onClick={() => router.get(players.links[0].url)}
                            className="h-11 px-6 rounded-xl border-neutral-100 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-900 hover:text-white transition-all shadow-sm"
                        >
                            ÖNCEKİ
                        </Button>
                        <div className="hidden md:flex gap-1">
                            {players.links.filter((link, i) => i > 0 && i < players.links.length - 1).map((link, i) => (
                                <Button
                                    key={i}
                                    variant={link.active ? 'default' : 'ghost'}
                                    onClick={() => link.url && router.get(link.url)}
                                    className={`h-11 w-11 rounded-xl text-[10px] font-black ${link.active ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : ''}`}
                                    disabled={!link.url}
                                >
                                    {link.label}
                                </Button>
                            ))}
                        </div>
                        <Button
                            disabled={players.current_page === players.last_page}
                            variant="outline"
                            onClick={() => router.get(players.links[players.links.length - 1].url)}
                            className="h-11 px-6 rounded-xl border-neutral-100 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-900 hover:text-white transition-all shadow-sm"
                        >
                            SONRAKİ
                        </Button>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e5e5e5;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #d4d4d4;
                }
                input[type=number]::-webkit-inner-spin-button, 
                input[type=number]::-webkit-outer-spin-button { 
                  -webkit-appearance: none; 
                  margin: 0; 
                }
            `}} />
        </AppLayout>
    );
}
