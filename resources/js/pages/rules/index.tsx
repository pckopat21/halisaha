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
    Save,
    BookOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Rule {
    id: number;
    title: string;
    content: string;
    sort_order: number;
    is_active: boolean;
    created_at: string;
}

interface Props {
    rules: Rule[];
}

export default function RulesManagement({ rules }: { rules: Rule[] }) {
    const [rulesList, setRulesList] = useState<Rule[]>(rules || []);
    const { auth } = usePage<SharedData>().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<Rule | null>(null);

    // Update rulesList when props change (e.g. after successful form submission)
    useEffect(() => {
        setRulesList(rules || []);
    }, [rules]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Kural Yönetimi',
            href: '/Rules',
        },
    ];

    const form = useForm({
        title: '',
        content: '',
        sort_order: 0,
        is_active: true as boolean,
    });

    const openCreateModal = () => {
        setEditingRule(null);
        form.reset();
        form.setData({
            title: '',
            content: '',
            sort_order: 0,
            is_active: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (Rule: Rule) => {
        setEditingRule(Rule);
        form.setData({
            title: Rule.title,
            content: Rule.content,
            sort_order: Rule.sort_order,
            is_active: Rule.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingRule) {
            form.patch(route('rules.update', editingRule.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                }
            });
        } else {
            form.post(route('rules.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                }
            });
        }
    };

    const deleteRule = (id: number) => {
        if (confirm('Bu kuralı silmek istediğinize emin misiniz?')) {
            router.delete(route('rules.destroy', id));
        }
    };

    const toggleStatus = (id: number) => {
        router.patch(route('rules.toggle', id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kural Yönetimi" />

            <div className="min-h-screen bg-background p-4 md:p-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter">Kural Yönetimi</h1>
                        <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">SİSTEM GENELİ KuralLARI OLUŞTURUN VE YAYINLAYIN</p>
                    </div>

                    <Button 
                        onClick={openCreateModal}
                        className="bg-blue-600 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] h-14 px-8 rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                    >
                        <Plus className="mr-2 h-4 w-4" /> YENİ KURAL OLUŞTUR
                    </Button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rulesList.map((rule) => (
                        <Card key={rule.id} className="border-none shadow-2xl bg-white dark:bg-black/20 rounded-[2.5rem] overflow-hidden flex flex-col group hover:shadow-blue-500/10 transition-all duration-500">
                            <CardHeader className="p-8 border-b border-border bg-slate-50/50 dark:bg-black/20">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg bg-blue-500 text-white shadow-blue-500/20">
                                            <BookOpen className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <Badge variant="secondary" className="mb-1 text-[8px] font-black uppercase tracking-widest">
                                                SIRA: {rule.sort_order}
                                            </Badge>
                                            <CardTitle className="text-xl font-black uppercase tracking-tighter line-clamp-1">{rule.title}</CardTitle>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button size="icon" variant="ghost" onClick={() => openEditModal(rule)} className="h-8 w-8 rounded-lg hover:bg-blue-50 hover:text-blue-600">
                                            <Edit3 className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => deleteRule(rule.id)} className="h-8 w-8 rounded-lg hover:bg-rose-50 hover:text-rose-600 text-rose-500">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 flex-1 flex flex-col">
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-6 flex-1 line-clamp-3 italic">
                                    "{rule.content}"
                                </p>
                                
                                <div className="flex items-center justify-between mt-auto pt-6 border-t border-border">
                                    <button 
                                        onClick={() => toggleStatus(rule.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-black text-[9px] uppercase tracking-widest transition-all ${
                                            rule.is_active 
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                                            : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                                        }`}
                                    >
                                        {rule.is_active ? (
                                            <><Eye className="h-3 w-3" /> YAYINDA</>
                                        ) : (
                                            <><EyeOff className="h-3 w-3" /> TASLAK</>
                                        )}
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {rulesList.length === 0 && (
                        <div className="col-span-full py-32 text-center opacity-30">
                            <BookOpen className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-xl font-black uppercase tracking-tighter">HENÜZ KURAL YOK</h3>
                            <p className="text-xs font-bold uppercase tracking-widest">İlk kuralı oluşturmak için yukarıdaki butonu kullanın.</p>
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
                                        <BookOpen className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-3xl font-black uppercase tracking-tighter">
                                            {editingRule ? 'KURALI DÜZENLE' : 'YENİ KURAL'}
                                        </DialogTitle>
                                        <DialogDescription className="text-white/40 font-bold uppercase text-[10px] tracking-widest mt-1">
                                            KULLANICILARA GÖRÜNECEK KURALLARI DÜZENLEYİN
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
                                        {form.errors.title && <p className="text-red-500 text-xs mt-1">{form.errors.title}</p>}
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">SIRALAMA</Label>
                                        <Input 
                                            type="number"
                                            value={form.data.sort_order}
                                            onChange={e => form.setData('sort_order', parseInt(e.target.value) || 0)}
                                            className="h-14 rounded-2xl font-bold bg-muted/30 border-transparent focus:bg-background transition-all"
                                            min="0"
                                        />
                                        {form.errors.sort_order && <p className="text-red-500 text-xs mt-1">{form.errors.sort_order}</p>}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">İÇERİK</Label>
                                    <Textarea 
                                        placeholder="Kural detaylarını buraya yazın..."
                                        value={form.data.content}
                                        onChange={e => form.setData('content', e.target.value)}
                                        className="min-h-[150px] rounded-3xl font-bold bg-muted/30 border-transparent focus:bg-background transition-all p-6 text-sm"
                                        required
                                    />
                                    {form.errors.content && <p className="text-red-500 text-xs mt-1">{form.errors.content}</p>}
                                </div>

                                <div className="grid grid-cols-1 gap-8">
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
                                    <Save className="h-5 w-5" /> {editingRule ? 'DEĞİŞİKLİKLERİ KAYDET' : 'KURALI YAYINLA'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
