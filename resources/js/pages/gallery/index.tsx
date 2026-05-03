import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import {
    Image as ImageIcon,
    Plus,
    Trash2,
    Eye,
    EyeOff,
    Trophy,
    Info,
    CheckCircle2,
    Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface Gallery {
    id: number;
    image_path: string;
    image_url: string;
    title: string | null;
    description: string | null;
    is_active: boolean;
    sort_order: number;
}

interface Tournament {
    id: number;
    name: string;
    year: number;
}

interface Props {
    tournaments: Tournament[];
    selectedTournament: (Tournament & { galleries: Gallery[] }) | null;
    galleries: Gallery[];
}

export default function GalleryIndex({ tournaments, selectedTournament, galleries }: Props) {
    const { auth } = usePage<SharedData>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Turnuva Galerisi',
            href: '/gallery',
        },
    ];

    const galleryForm = useForm({
        image: null as File | null,
        title: '',
    });

    const handleTournamentChange = (id: string) => {
        router.get(route('gallery.index'), { tournament_id: id }, { preserveState: true });
    };

    const handleGallerySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTournament) return;

        galleryForm.post(route('tournaments.gallery.store', selectedTournament.id), {
            forceFormData: true,
            onSuccess: () => {
                galleryForm.reset();
            },
        });
    };

    const deleteGallery = (id: number) => {
        if (confirm('Bu fotoğrafı silmek istediğinize emin misiniz?')) {
            router.delete(route('gallery.destroy', id), {
                preserveScroll: true
            });
        }
    };

    const toggleGallery = (id: number) => {
        router.patch(route('gallery.toggle', id), {}, {
            preserveScroll: true
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Turnuva Galerisi Yönetimi" />

            <div className="min-h-screen bg-background p-4 md:p-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter">Galeri Yönetimi</h1>
                        <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">TURNUVA ANLARINI VE GÖRSELLERİNİ YÖNETİN</p>
                    </div>

                    <div className="flex items-center gap-4 bg-card border border-border p-2 rounded-2xl">
                        <Trophy className="h-5 w-5 text-blue-600 ml-2" />
                        <Select 
                            value={selectedTournament?.id.toString()} 
                            onValueChange={handleTournamentChange}
                        >
                            <SelectTrigger className="w-[250px] border-none bg-transparent font-bold focus:ring-0">
                                <SelectValue placeholder="Turnuva Seçin" />
                            </SelectTrigger>
                            <SelectContent>
                                {tournaments.map((t) => (
                                    <SelectItem key={t.id} value={t.id.toString()}>
                                        {t.name} ({t.year})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {!selectedTournament ? (
                    <Card className="border-dashed border-2 py-32 flex flex-col items-center justify-center text-center opacity-40">
                        <Trophy className="h-16 w-16 mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-black uppercase tracking-tighter">YÖNETİLECEK TURNUVA BULUNAMADI</h3>
                        <p className="text-xs font-bold uppercase tracking-widest">Önce bir turnuva oluşturmalısınız.</p>
                    </Card>
                ) : (
                    <Card className="border-none shadow-2xl bg-white dark:bg-black/20 rounded-[3rem] overflow-hidden">
                        <CardHeader className="p-10 border-b border-border bg-slate-50/50 dark:bg-black/20">
                            <div className="flex items-center gap-6">
                                <div className="h-16 w-16 bg-orange-600 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-orange-500/20">
                                    <ImageIcon className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-3xl font-black uppercase tracking-tighter text-foreground">{selectedTournament.name}</CardTitle>
                                    <CardDescription className="text-xs font-black uppercase tracking-widest text-orange-600 mt-1">GÖRSELLERİ YÜKLEYİN VE YÖNETİN</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10">
                            {/* Upload Form */}
                            <form onSubmit={handleGallerySubmit} className="mb-12 p-8 bg-muted/30 rounded-[2.5rem] border border-dashed border-border">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">FOTOĞRAF SEÇİN</Label>
                                        <Input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={e => galleryForm.setData('image', e.target.files?.[0] || null)}
                                            className="h-14 rounded-2xl font-bold bg-background border-border p-3 cursor-pointer"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">BAŞLIK (OPSİYONEL)</Label>
                                        <div className="flex gap-4">
                                            <Input 
                                                placeholder="Örn: Kupa Töreni"
                                                value={galleryForm.data.title}
                                                onChange={e => galleryForm.setData('title', e.target.value)}
                                                className="h-14 rounded-2xl font-bold bg-background border-border"
                                            />
                                            <Button 
                                                disabled={galleryForm.processing || !galleryForm.data.image}
                                                className="h-14 px-8 bg-blue-600 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl transition-all shrink-0"
                                            >
                                                {galleryForm.processing ? 'YÜKLENİYOR...' : 'YÜKLE'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                {galleryForm.errors.image && <p className="text-rose-500 text-[10px] font-bold mt-2 uppercase tracking-widest">{galleryForm.errors.image}</p>}
                            </form>

                            {/* Gallery Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {galleries.length > 0 ? galleries.map((item) => (
                                    <div key={item.id} className="relative group aspect-square rounded-[2rem] overflow-hidden border border-border bg-muted/20">
                                        <img 
                                            src={item.image_url} 
                                            alt={item.title || ''} 
                                            className={`w-full h-full object-cover transition-all duration-500 ${!item.is_active ? 'grayscale opacity-40' : 'group-hover:scale-110'}`}
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    size="icon" 
                                                    variant="secondary" 
                                                    onClick={() => toggleGallery(item.id)}
                                                    className="h-10 w-10 rounded-xl bg-white/20 hover:bg-white/40 text-white backdrop-blur-md border border-white/20"
                                                >
                                                    {item.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                </Button>
                                                <Button 
                                                    size="icon" 
                                                    variant="destructive" 
                                                    onClick={() => deleteGallery(item.id)}
                                                    className="h-10 w-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-lg"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            {item.title && (
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest px-3 py-1 bg-black/40 rounded-full backdrop-blur-md border border-white/10">
                                                    {item.title}
                                                </span>
                                            )}
                                        </div>
                                        {!item.is_active && (
                                            <div className="absolute top-4 right-4">
                                                <Badge variant="secondary" className="bg-slate-900/80 text-white border-none font-black text-[9px] px-2 py-0.5 rounded-full">PASİF</Badge>
                                            </div>
                                        )}
                                    </div>
                                )) : (
                                    <div className="col-span-full py-24 text-center space-y-4 opacity-30">
                                        <ImageIcon className="h-20 w-20 mx-auto text-muted-foreground" />
                                        <p className="text-xs font-black uppercase tracking-widest leading-relaxed">BU TURNUVA İÇİN HENÜZ<br/>GÖRSEL YÜKLENMEMİŞ</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
