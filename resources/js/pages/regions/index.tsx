import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Region, SharedData } from '@/types';

interface PageProps extends SharedData {
    regions: Region[];
}

export default function RegionsIndex({ regions }: PageProps) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
    const [name, setName] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('regions.store'), { name }, {
            onSuccess: () => {
                setIsAddOpen(false);
                setName('');
            }
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentRegion) {
            router.put(route('regions.update', currentRegion.id), { name }, {
                onSuccess: () => {
                    setIsEditOpen(false);
                    setCurrentRegion(null);
                    setName('');
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Bu bölgeyi silmek istediğinize emin misiniz?')) {
            router.delete(route('regions.destroy', id));
        }
    };

    const openEdit = (region: Region) => {
        setCurrentRegion(region);
        setName(region.name);
        setIsEditOpen(true);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Bölgeler', href: '/regions' }]}>
            <Head title="Bölge Yönetimi" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Bölge Yönetimi</h1>
                    
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#FF8C00] hover:bg-[#e67e00]">
                                <Plus className="mr-2 h-4 w-4" /> Yeni Bölge
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Yeni Bölge Ekle</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAdd} className="space-y-4 pt-4">
                                <div>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Bölge Adı"
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-[#FF8C00] hover:bg-[#e67e00]">
                                    Ekle
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>Bölge Adı</TableHead>
                                <TableHead className="text-right">İşlemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {regions.map((region) => (
                                <TableRow key={region.id}>
                                    <TableCell className="font-medium">{region.id}</TableCell>
                                    <TableCell>{region.name}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(region)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(region.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {regions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                        Kayıtlı bölge bulunamadı.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Bölgeyi Düzenle</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEdit} className="space-y-4 pt-4">
                            <div>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Bölge Adı"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full bg-[#FF8C00] hover:bg-[#e67e00]">
                                Güncelle
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
