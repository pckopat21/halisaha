import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { MapPin, PlusCircle, Pencil, Trash2, Shield, Info, Search, Power } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Saha Yönetimi', href: '/fields' },
];

interface Field {
    id: number;
    name: string;
    location: string | null;
    description: string | null;
    is_active: boolean;
}

interface Props {
    fields: Field[];
}

export default function Index({ fields }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedField, setSelectedField] = useState<Field | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        name: '',
        location: '',
        description: '',
        is_active: true
    });

    const onCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('fields.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
                toast.success('Saha başarıyla oluşturuldu.');
            },
        });
    };

    const onEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedField) return;
        put(route('fields.update', selectedField.id), {
            onSuccess: () => {
                setIsEditOpen(false);
                reset();
                toast.success('Saha başarıyla güncellendi.');
            },
        });
    };

    const onDeleteSubmit = () => {
        if (!selectedField) return;
        destroy(route('fields.destroy', selectedField.id), {
            onSuccess: () => {
                setIsDeleteOpen(false);
                toast.success('Saha başarıyla silindi.');
            },
            onError: (err: any) => {
                toast.error(err.error || 'Saha silinirken bir hata oluştu.');
            }
        });
    };

    const openEdit = (field: Field) => {
        setSelectedField(field);
        setData({
            name: field.name,
            location: field.location || '',
            description: field.description || '',
            is_active: field.is_active
        });
        setIsEditOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Saha Yönetimi" />
            
            <div className="flex h-full flex-1 flex-col gap-8 p-4 md:p-8 font-sans bg-slate-50/50 dark:bg-black">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tight uppercase leading-none">Saha Yönetimi</h1>
                        <p className="text-neutral-500 font-medium">Turnuva maçlarının oynanacağı fiziksel sahaları ve özelliklerini yönetin.</p>
                    </div>

                    <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if(!open) reset(); }}>
                        <DialogTrigger asChild>
                            <Button className="h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[11px] rounded-[1.5rem] shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95">
                                <PlusCircle className="mr-3 h-5 w-5" /> YENİ SAHA EKLE
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none shadow-3xl p-0 overflow-hidden">
                            <DialogHeader className="p-10 bg-slate-900 text-white">
                                <DialogTitle className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
                                    <MapPin className="h-8 w-8 text-blue-500" /> SAHA KAYDI
                                </DialogTitle>
                                <DialogDescription className="text-white/40 font-bold uppercase text-[10px] tracking-widest mt-2">
                                    TESİSE AİT YENİ BİR OYUN ALANI TANIMLAYIN.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={onCreateSubmit} className="p-10 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">SAHA ADI</Label>
                                        <Input 
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            placeholder="ÖR: MERKEZ SAHA, SAHA-1"
                                            className="h-14 rounded-2xl bg-slate-50 border-none font-black uppercase text-sm px-6"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">KONUM / ADRES</Label>
                                        <Input 
                                            value={data.location}
                                            onChange={e => setData('location', e.target.value)}
                                            placeholder="ÖR: KUZEY TESİSLERİ"
                                            className="h-14 rounded-2xl bg-slate-50 border-none font-black uppercase text-sm px-6"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">AÇIKLAMA</Label>
                                        <Textarea 
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            placeholder="SAHA ÖZELLİKLERİ..."
                                            className="min-h-[100px] rounded-2xl bg-slate-50 border-none p-6 text-sm font-medium"
                                        />
                                    </div>
                                </div>
                                <Button type="submit" disabled={processing} className="w-full h-16 bg-blue-600 hover:bg-black text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl transition-all">
                                    SAHAYI KAYDET
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {fields.map((field) => (
                        <Card key={field.id} className="border-none shadow-xl bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden group hover:shadow-2xl transition-all">
                            <div className="p-8 space-y-6">
                                <div className="flex items-start justify-between">
                                    <div className="h-16 w-16 rounded-3xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center font-black text-2xl group-hover:scale-110 transition-transform">
                                        {field.name.substring(0, 1).toUpperCase()}
                                    </div>
                                    <Badge className={`border-none px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${field.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                        {field.is_active ? 'AKTİF' : 'PASİF'}
                                    </Badge>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-2">{field.name}</h3>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <MapPin className="h-3 w-3" /> {field.location || 'KONUM BELİRTİLMEMİŞ'}
                                    </p>
                                </div>

                                {field.description && (
                                    <p className="text-sm text-neutral-500 line-clamp-2 leading-relaxed h-10">{field.description}</p>
                                )}

                                <div className="pt-6 border-t border-slate-50 dark:border-white/5 flex gap-3">
                                    <Button 
                                        onClick={() => openEdit(field)}
                                        variant="outline" 
                                        className="flex-1 h-12 rounded-xl border-slate-100 dark:border-white/10 font-black uppercase tracking-widest text-[10px] hover:bg-blue-50 hover:text-blue-600 transition-all"
                                    >
                                        DÜZENLE
                                    </Button>
                                    <Button 
                                        onClick={() => { setSelectedField(field); setIsDeleteOpen(true); }}
                                        variant="ghost" 
                                        className="h-12 w-12 rounded-xl text-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-all"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {fields.length === 0 && (
                        <div className="col-span-full py-24 text-center space-y-4">
                            <div className="h-24 w-24 bg-slate-100 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto">
                                <MapPin className="h-10 w-10 text-slate-300" />
                            </div>
                            <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Henüz bir saha tanımlanmamış.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none shadow-3xl p-0 overflow-hidden">
                    <DialogHeader className="p-10 bg-blue-600 text-white">
                        <DialogTitle className="text-3xl font-black uppercase tracking-tighter">SAHAYI DÜZENLE</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={onEditSubmit} className="p-10 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">SAHA ADI</Label>
                                <Input 
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="h-14 rounded-2xl bg-neutral-50 border-none font-black uppercase text-sm px-6"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">KONUM</Label>
                                <Input 
                                    value={data.location}
                                    onChange={e => setData('location', e.target.value)}
                                    className="h-14 rounded-2xl bg-neutral-50 border-none font-black uppercase text-sm px-6"
                                />
                            </div>
                            <div className="space-y-2 pt-4 flex items-center gap-3">
                                <input 
                                    type="checkbox" 
                                    id="is_active" 
                                    className="h-5 w-5 rounded-lg border-neutral-300"
                                    checked={data.is_active}
                                    onChange={e => setData('is_active', e.target.checked)}
                                />
                                <Label htmlFor="is_active" className="text-xs font-black uppercase tracking-widest cursor-pointer">SAHA AKTİF / KULLANILABİLİR</Label>
                            </div>
                        </div>
                        <Button type="submit" disabled={processing} className="w-full h-16 bg-blue-600 hover:bg-black text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl transition-all">
                            DEĞİŞİKLİKLERİ KAYDET
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none shadow-3xl p-0 overflow-hidden">
                    <div className="p-10 text-center space-y-6">
                        <div className="h-20 w-20 bg-rose-50 rounded-[1.5rem] flex items-center justify-center mx-auto">
                            <Trash2 className="h-10 w-10 text-rose-600" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter">SAHAYI SİL?</h3>
                            <p className="text-neutral-500 mt-2">Bu sahayı silmek istediğinize emin misiniz?</p>
                        </div>
                        <div className="flex gap-4">
                            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} className="flex-1 h-14 rounded-2xl font-black">İPTAL</Button>
                            <Button onClick={onDeleteSubmit} className="flex-1 h-14 bg-rose-600 text-white rounded-2xl font-black shadow-lg shadow-rose-600/20">SİL</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
