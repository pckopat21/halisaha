import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import {
    Bell,
    Plus,
    Trash2,
    Eye,
    EyeOff,
    Edit3,
    CheckCircle2,
    AlertCircle,
    Info,
    X,
    Save
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Announcement {
    id: number;
    title: string;
    content: string;
    type: 'info' | 'success' | 'warning' | 'danger';
    is_active: boolean;
    published_at: string | null;
    created_at: string;
}

interface Props {
    announcements: Announcement[];
}

export default function AnnouncementIndex({ announcements }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Duyuru Yönetimi',
            href: '/announcements',
        },
    ];

    const form = useForm({
        title: '',
        content: '',
        type: 'info' as 'info' | 'success' | 'warning' | 'danger',
        is_active: true as boolean,
        published_at: format(new Date(), "yyyy-MM-dd'T'HH:mm") as string | null,
    });

    const openCreateModal = () => {
        setEditingAnnouncement(null);
        form.reset();
        form.setData({
            title: '',
            content: '',
            type: 'info',
            is_active: true,
            published_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        });
        setIsModalOpen(true);
    };

    const openEditModal = (announcement: Announcement) => {
        setEditingAnnouncement(announcement);
        form.setData({
            title: announcement.title,
            content: announcement.content,
            type: announcement.type,
            is_active: announcement.is_active,
            published_at: announcement.published_at ? format(new Date(announcement.published_at), "yyyy-MM-dd'T'HH:mm") : null as any,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAnnouncement) {
            form.patch(route('announcements.update', editingAnnouncement.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                }
            });
        } else {
            form.post(route('announcements.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                }
            });
        }
    };

    const deleteAnnouncement = (id: number) => {
        if (confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) {
            router.delete(route('announcements.destroy', id));
        }
    };

    const toggleStatus = (id: number) => {
        router.patch(route('announcements.toggle', id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Duyuru Yönetimi" />

            <div className="min-h-screen bg-background p-4 md:p-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter">Duyuru Yönetimi</h1>
                        <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">SİSTEM GENELİ DUYURULARI OLUŞTURUN VE YAYINLAYIN</p>
                    </div>

                    <Button 
                        onClick={openCreateModal}
                        className="bg-blue-600 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] h-14 px-8 rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                    >
                        <Plus className="mr-2 h-4 w-4" /> YENİ DUYURU OLUŞTUR
                    </Button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {announcements.map((announcement) => (
                        <Card key={announcement.id} className="border-none shadow-2xl bg-white dark:bg-black/20 rounded-[2.5rem] overflow-hidden flex flex-col group hover:shadow-blue-500/10 transition-all duration-500">
                            <CardHeader className="p-8 border-b border-border bg-slate-50/50 dark:bg-black/20">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg ${
                                            announcement.type === 'success' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                                            announcement.type === 'warning' ? 'bg-amber-500 text-white shadow-amber-500/20' :
                                            announcement.type === 'danger' ? 'bg-rose-500 text-white shadow-rose-500/20' :
                                            'bg-blue-500 text-white shadow-blue-500/20'
                                        }`}>
                                            <Bell className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <Badge variant="secondary" className="mb-1 text-[8px] font-black uppercase tracking-widest">
                                                {announcement.type === 'info' ? 'BİLGİ' : 
                                                 announcement.type === 'success' ? 'BAŞARI' : 
                                                 announcement.type === 'warning' ? 'UYARI' : 'KRİTİK'}
                                            </Badge>
                                            <CardTitle className="text-xl font-black uppercase tracking-tighter line-clamp-1">{announcement.title}</CardTitle>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button size="icon" variant="ghost" onClick={() => openEditModal(announcement)} className="h-8 w-8 rounded-lg hover:bg-blue-50 hover:text-blue-600">
                                            <Edit3 className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => deleteAnnouncement(announcement.id)} className="h-8 w-8 rounded-lg hover:bg-rose-50 hover:text-rose-600 text-rose-500">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 flex-1 flex flex-col">
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-6 flex-1 line-clamp-3 italic">
                                    "{announcement.content}"
                                </p>
                                
                                <div className="flex items-center justify-between mt-auto pt-6 border-t border-border">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">YAYIN TARİHİ</span>
                                        <span className="text-[11px] font-bold">
                                            {announcement.published_at ? format(new Date(announcement.published_at), 'd MMMM yyyy HH:mm', { locale: tr }) : 'Hemen'}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => toggleStatus(announcement.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-black text-[9px] uppercase tracking-widest transition-all ${
                                            announcement.is_active 
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                                            : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                                        }`}
                                    >
                                        {announcement.is_active ? (
                                            <><Eye className="h-3 w-3" /> YAYINDA</>
                                        ) : (
                                            <><EyeOff className="h-3 w-3" /> TASLAK</>
                                        )}
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {announcements.length === 0 && (
                        <div className="col-span-full py-32 text-center opacity-30">
                            <Bell className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-xl font-black uppercase tracking-tighter">HENÜZ DUYURU YOK</h3>
                            <p className="text-xs font-bold uppercase tracking-widest">İlk duyuruyu oluşturmak için yukarıdaki butonu kullanın.</p>
                        </div>
                    )}
                </div>

                {/* Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-border bg-background">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader className="p-10 bg-slate-900 text-white">
                                <div className="flex items-center gap-6">
                                    <div className="h-16 w-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                                        <Bell className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-3xl font-black uppercase tracking-tighter">
                                            {editingAnnouncement ? 'DUYURUYU DÜZENLE' : 'YENİ DUYURU'}
                                        </DialogTitle>
                                        <DialogDescription className="text-white/40 font-bold uppercase text-[10px] tracking-widest mt-1">
                                            TÜM KULLANICILARA GÖRÜNECEK MESAJI HAZIRLAYIN
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="p-10 space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">BAŞLIK</Label>
                                        <Input 
                                            placeholder="Örn: Turnuva Kuralları Hakkında"
                                            value={form.data.title}
                                            onChange={e => form.setData('title', e.target.value)}
                                            className="h-14 rounded-2xl font-bold bg-muted/30 border-transparent focus:bg-background transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">DUYURU TİPİ</Label>
                                        <Select value={form.data.type} onValueChange={(val: any) => form.setData('type', val)}>
                                            <SelectTrigger className="h-14 rounded-2xl font-bold bg-muted/30 border-transparent">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="info">Bilgilendirme (Mavi)</SelectItem>
                                                <SelectItem value="success">Başarı (Yeşil)</SelectItem>
                                                <SelectItem value="warning">Uyarı (Turuncu)</SelectItem>
                                                <SelectItem value="danger">Kritik (Kırmızı)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">İÇERİK</Label>
                                    <Textarea 
                                        placeholder="Duyuru detaylarını buraya yazın..."
                                        value={form.data.content}
                                        onChange={e => form.setData('content', e.target.value)}
                                        className="min-h-[150px] rounded-3xl font-bold bg-muted/30 border-transparent focus:bg-background transition-all p-6 text-sm"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">YAYIN TARİHİ</Label>
                                        <Input 
                                            type="datetime-local"
                                            value={form.data.published_at || ''}
                                            onChange={e => form.setData('published_at', e.target.value)}
                                            className="h-14 rounded-2xl font-bold bg-muted/30 border-transparent"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">YAYIN DURUMU</Label>
                                        <Select value={form.data.is_active ? '1' : '0'} onValueChange={val => form.setData('is_active', val === '1')}>
                                            <SelectTrigger className="h-14 rounded-2xl font-bold bg-muted/30 border-transparent">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Yayında (Aktif)</SelectItem>
                                                <SelectItem value="0">Taslak (Pasif)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="p-10 pt-0">
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full h-16 bg-blue-600 hover:bg-black text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl transition-all flex items-center justify-center gap-3"
                                >
                                    <Save className="h-5 w-5" /> {editingAnnouncement ? 'DEĞİŞİKLİKLERİ KAYDET' : 'DUYURUYU YAYINLA'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
