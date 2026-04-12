import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Building2, PlusCircle, Pencil, Trash2, Users, Trophy, AlertCircle, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Birim Tanımlama', href: '/units' },
];

interface Team {
    id: number;
    name: string;
}

interface Player {
    id: number;
    first_name: string;
    last_name: string;
}

interface Unit {
    id: number;
    name: string;
    slug: string;
    teams_count: number;
    players_count: number;
    teams?: Team[];
    players?: Player[];
}

interface Props {
    units: Unit[];
}

type SortField = 'name' | 'teams_count' | 'players_count';
type SortOrder = 'asc' | 'desc' | null;

export default function Index({ units }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [detailsType, setDetailsType] = useState<'teams' | 'players' | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    
    // Search and Sort State
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        name: '',
    });

    // Filtered and Sorted list
    const filteredAndSortedUnits = useMemo(() => {
        let result = units.filter(unit => 
            unit.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (sortField && sortOrder) {
            result.sort((a, b) => {
                const aValue = a[sortField];
                const bValue = b[sortField];
                
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortOrder === 'asc' 
                        ? aValue.localeCompare(bValue, 'tr') 
                        : bValue.localeCompare(aValue, 'tr');
                }
                
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
                }
                
                return 0;
            });
        }

        return result;
    }, [units, searchQuery, sortField, sortOrder]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />;
        return sortOrder === 'asc' 
            ? <ArrowUp className="ml-2 h-3 w-3 text-blue-600" /> 
            : <ArrowDown className="ml-2 h-3 w-3 text-blue-600" />;
    };

    const onCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('units.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
                toast.success('Birim başarıyla oluşturuldu.');
            },
        });
    };

    const onEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUnit) return;
        put(route('units.update', selectedUnit.id), {
            onSuccess: () => {
                setIsEditOpen(false);
                reset();
                toast.success('Birim başarıyla güncellendi.');
            },
        });
    };

    const onDeleteSubmit = () => {
        if (!selectedUnit) return;
        destroy(route('units.destroy', selectedUnit.id), {
            onSuccess: () => {
                setIsDeleteOpen(false);
                toast.success('Birim başarıyla silindi.');
            },
            onError: (err: any) => {
                toast.error(err.error || 'Birim silinirken bir hata oluştu.');
            }
        });
    };

    const openEdit = (unit: Unit) => {
        setSelectedUnit(unit);
        setData('name', unit.name);
        setIsEditOpen(true);
    };

    const openDelete = (unit: Unit) => {
        setSelectedUnit(unit);
        setIsDeleteOpen(true);
    };

    const openDetails = (unit: Unit, type: 'teams' | 'players') => {
        setSelectedUnit(unit);
        setDetailsType(type);
        setIsDetailsOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Birim Tanımlama" />
            
            <div className="flex h-full flex-1 flex-col gap-8 p-4 md:p-8 font-sans">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase leading-none">Birim Yönetimi</h1>
                        <p className="text-neutral-500 font-medium text-sm md:text-base">Sistemdeki tüm birimleri (departman/şube) buradan yönetebilirsiniz.</p>
                    </div>

                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                        <div className="relative w-full lg:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-blue-600 transition-colors" />
                            <Input 
                                placeholder="BİRİM ARA (ÖR: BİLGİ TEKNOLOJİLERİ)..." 
                                className="h-12 md:h-14 pl-12 rounded-2xl bg-white dark:bg-neutral-800 border-none shadow-sm font-black uppercase text-[10px] md:text-[11px] tracking-widest focus:ring-2 focus:ring-blue-600/20 dark:text-white dark:placeholder:text-neutral-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if(!open) reset(); }}>
                            <DialogTrigger asChild>
                                <Button className="h-12 md:h-14 w-full lg:w-auto px-8 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 shrink-0">
                                    <PlusCircle className="mr-2 h-5 w-5" /> YENİ BİRİM TANIMLA
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden text-slate-900">
                                <DialogHeader className="p-8 bg-slate-950 text-white">
                                    <DialogTitle className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                                        <Building2 className="h-8 w-8 text-blue-500" /> BİRİM EKLE
                                    </DialogTitle>
                                    <DialogDescription className="text-white/40 font-bold uppercase text-[10px] tracking-widest mt-2 leading-relaxed">
                                        TAKIMLARIN VE OYUNCULARIN BAĞLI OLACAĞI YENİ BİR KURUMSAL BİRİM TANIMLAYIN.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={onCreateSubmit} className="p-8 space-y-8">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">BİRİM ADI</Label>
                                            <Input 
                                                id="name" 
                                                placeholder="ÖRNEK: BİLGİ TEKNOLOJİLERİ" 
                                                className="h-14 rounded-2xl bg-neutral-50 border-none font-black uppercase text-sm px-6 focus:ring-2 focus:ring-blue-600/20 text-slate-900"
                                                value={data.name}
                                                onChange={e => setData('name', e.target.value)}
                                                required
                                            />
                                            {errors.name && <p className="text-rose-500 text-[10px] font-black uppercase ml-1">{errors.name}</p>}
                                        </div>
                                    </div>
                                    <Button 
                                        type="submit" 
                                        disabled={processing}
                                        className="w-full h-16 bg-blue-600 hover:bg-black text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-2xl shadow-blue-600/20 transition-all duration-300 transform active:scale-95"
                                    >
                                        BİRİMİ KAYDET
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Card className="border-none shadow-2xl bg-white dark:bg-neutral-900 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-neutral-50/50 dark:bg-neutral-800/50 hover:bg-transparent border-none">
                                    <TableHead className="py-6 px-4 md:px-8 uppercase font-black text-[10px] text-neutral-400 tracking-widest w-[60px] md:w-[80px] text-center">ID</TableHead>
                                    <TableHead 
                                        className="py-6 px-4 md:px-8 uppercase font-black text-[10px] text-neutral-400 tracking-widest min-w-[180px] cursor-pointer hover:text-blue-600 transition-colors"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center">Birim Adı {getSortIcon('name')}</div>
                                    </TableHead>
                                    <TableHead 
                                        className="py-6 uppercase font-black text-[10px] text-neutral-400 tracking-widest text-center min-w-[100px] cursor-pointer hover:text-blue-600 transition-colors"
                                        onClick={() => handleSort('teams_count')}
                                    >
                                        <div className="flex items-center justify-center">Takım {getSortIcon('teams_count')}</div>
                                    </TableHead>
                                    <TableHead 
                                        className="py-6 uppercase font-black text-[10px] text-neutral-400 tracking-widest text-center min-w-[100px] cursor-pointer hover:text-blue-600 transition-colors"
                                        onClick={() => handleSort('players_count')}
                                    >
                                        <div className="flex items-center justify-center">Oyuncu {getSortIcon('players_count')}</div>
                                    </TableHead>
                                    <TableHead className="py-6 px-4 md:px-8 text-right uppercase font-black text-[10px] text-neutral-400 tracking-widest min-w-[100px]">İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAndSortedUnits.map((unit, index) => (
                                    <TableRow key={unit.id} className="group transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800/50 border-b border-neutral-50 dark:border-neutral-800 text-slate-900 dark:text-neutral-100">
                                        <TableCell className="px-4 md:px-8 py-6 font-black text-neutral-300 text-[10px] md:text-xs text-center">{unit.id}</TableCell>
                                        <TableCell className="px-4 md:px-8 py-6">
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <div className="h-8 w-8 md:h-12 md:w-12 rounded-lg md:rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-[10px] md:text-sm shrink-0">
                                                    {unit.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-black uppercase text-xs md:text-sm tracking-tighter text-slate-900 dark:text-neutral-100 line-clamp-1">{unit.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6 text-center">
                                            <Badge 
                                                variant="outline" 
                                                onClick={() => unit.teams_count > 0 && openDetails(unit, 'teams')}
                                                className={`bg-emerald-50 text-emerald-600 border-none px-2 md:px-3 py-1 md:py-1.5 font-black text-[9px] md:text-[10px] rounded-lg transition-all ${unit.teams_count > 0 ? 'cursor-pointer hover:bg-emerald-100 hover:scale-110 active:scale-95' : 'opacity-50'}`}
                                            >
                                                <Trophy className="h-3 w-3 mr-1 md:mr-1.5" /> {unit.teams_count} <span className="hidden xs:inline ml-1">TAKIM</span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-6 text-center">
                                            <Badge 
                                                variant="outline" 
                                                onClick={() => unit.players_count > 0 && openDetails(unit, 'players')}
                                                className={`bg-indigo-50 text-indigo-600 border-none px-2 md:px-3 py-1 md:py-1.5 font-black text-[9px] md:text-[10px] rounded-lg transition-all ${unit.players_count > 0 ? 'cursor-pointer hover:bg-indigo-100 hover:scale-110 active:scale-95' : 'opacity-50'}`}
                                            >
                                                <Users className="h-3 w-3 mr-1 md:mr-1.5" /> {unit.players_count} <span className="hidden xs:inline ml-1">OYUNCU</span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-4 md:px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-1 md:gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => openEdit(unit)}
                                                    className="h-8 w-8 md:h-10 md:w-10 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg md:rounded-xl"
                                                >
                                                    <Pencil className="h-4 w-4 md:h-5 md:w-5" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => openDelete(unit)}
                                                    className="h-8 w-8 md:h-10 md:w-10 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg md:rounded-xl"
                                                    disabled={unit.teams_count > 0 || unit.players_count > 0}
                                                >
                                                    <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredAndSortedUnits.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-24 text-center">
                                            <Building2 className="h-12 w-12 text-neutral-100 mx-auto mb-4" />
                                            <p className="text-xs font-black text-neutral-300 uppercase tracking-widest">
                                                {searchQuery ? 'ARAMA KRİTERİNE UYGUN BİRİM BULUNAMADI' : 'HENÜZ BİR BİRİM TANIMLANMAMIŞ'}
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>

            {/* Details Modal */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-lg rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden text-slate-900 dark:text-white dark:bg-neutral-950 max-h-[85vh] flex flex-col">
                    <DialogHeader className={`p-8 ${detailsType === 'teams' ? 'bg-emerald-600' : 'bg-indigo-600'} text-white shrink-0`}>
                        <div className="flex items-center gap-3 mb-2">
                            {detailsType === 'teams' ? <Trophy className="h-8 w-8" /> : <Users className="h-8 w-8" />}
                            <DialogTitle className="text-3xl font-black uppercase tracking-tighter">
                                {selectedUnit?.name}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-white/60 font-black uppercase text-[10px] tracking-widest">
                            {detailsType === 'teams' ? 'BİRİME AİT KAYITLI TAKIMLAR' : 'BİRİME AİT KAYITLI PERSONELLER'}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="p-8 overflow-y-auto">
                        <div className="space-y-3">
                            {detailsType === 'teams' && selectedUnit?.teams?.map(team => (
                                <div key={team.id} className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 flex items-center justify-between group hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors">
                                    <span className="font-black uppercase text-sm tracking-tight text-slate-700 dark:text-neutral-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{team.name}</span>
                                    <Trophy className="h-4 w-4 text-neutral-300 dark:text-neutral-600 group-hover:text-emerald-500" />
                                </div>
                            ))}
                            {detailsType === 'players' && selectedUnit?.players?.map(player => (
                                <div key={player.id} className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 flex items-center justify-between group hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                                    <span className="font-black uppercase text-sm tracking-tight text-slate-700 dark:text-neutral-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-400">
                                        {player.first_name} {player.last_name}
                                    </span>
                                    <Users className="h-4 w-4 text-neutral-300 dark:text-neutral-600 group-hover:text-indigo-500" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`p-6 border-t border-neutral-100 dark:border-neutral-900 text-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest shrink-0`}>
                        TOPLAM {detailsType === 'teams' ? selectedUnit?.teams_count : selectedUnit?.players_count} KAYIT LİSTELENDİ
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if(!open) reset(); }}>
                <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden text-slate-900 dark:text-white dark:bg-neutral-950">
                    <DialogHeader className="p-8 bg-blue-600 text-white">
                        <DialogTitle className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <Pencil className="h-8 w-8" /> BİRİMİ DÜZENLE
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={onEditSubmit} className="p-8 space-y-8">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">BİRİM ADI</Label>
                            <Input 
                                id="edit-name" 
                                className="h-14 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border-none font-black uppercase text-sm px-6"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <p className="text-rose-500 text-[10px] font-black uppercase ml-1">{errors.name}</p>}
                        </div>
                        <Button 
                            type="submit" 
                            disabled={processing}
                            className="w-full h-16 bg-blue-600 hover:bg-black text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-2xl shadow-blue-600/20"
                        >
                            DEĞİŞİKLİKLERİ KAYDET
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden text-slate-900 dark:text-white dark:bg-neutral-950">
                    <DialogHeader className="p-8 bg-rose-600 text-white text-center">
                        <Trash2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <DialogTitle className="text-3xl font-black uppercase tracking-tighter">BİRİMİ SİL?</DialogTitle>
                        <DialogDescription className="text-white/60 font-medium text-sm mt-2">
                            <span className="font-black text-white">"{selectedUnit?.name}"</span> birimini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="p-8 bg-white dark:bg-neutral-900 flex sm:justify-center gap-4">
                        <Button 
                            variant="ghost" 
                            onClick={() => setIsDeleteOpen(false)}
                            className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs"
                        >
                            İPTAL
                        </Button>
                        <Button 
                            onClick={onDeleteSubmit}
                            disabled={processing}
                            className="h-14 px-8 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-rose-600/20"
                        >
                            EVET, SİL
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
