import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { Users, CheckCircle, Clock, XCircle, ChevronRight, Search, PlusCircle, Building2, Trophy, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Takımlar', href: '/teams' },
];

interface Tournament {
    id: number;
    name: string;
}

interface Unit {
    id: number;
    name: string;
}

interface Team {
    id: number;
    name: string;
    status: 'pending' | 'approved' | 'rejected' | 'disqualified';
    unit: { name: string } | null;
    tournament: { 
        name: string;
        settings: {
            max_roster_size: number;
            min_roster_size: number;
        };
    } | null;
    user_id: number;
    players_count: number;
}

interface Props {
    teams: Team[];
    tournaments: Tournament[];
    units: Unit[];
}

export default function Index({ teams, tournaments, units }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    
    // Safety check for guest users
    const userUnitId = auth.user ? auth.user.unit_id?.toString() : '';

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        tournament_id: '',
        unit_id: userUnitId || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('teams.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Takımlar" />
            
            <div className="flex h-full flex-1 flex-col gap-8 p-8 font-sans">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight uppercase leading-none">Takım Katılımları</h1>
                        <p className="text-neutral-500 mt-2 font-medium">Turnuvadaki tüm takımları görüntüleyin ve başvurunuzu yapın.</p>
                    </div>

                    {auth.user ? (
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95">
                                    <PlusCircle className="mr-2 h-5 w-5" /> YENİ TAKIM BAŞVURUSU
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                                <DialogHeader className="p-8 bg-slate-950 text-white">
                                    <div className="flex items-center justify-between mb-4">
                                        <DialogTitle className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                                            <Trophy className="h-8 w-8 text-amber-500" /> TAKIM KUR
                                        </DialogTitle>
                                        <Badge className="bg-blue-600 text-white border-none font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest">BAŞVURU SÜRECİ</Badge>
                                    </div>
                                    <DialogDescription className="text-white/40 font-bold uppercase text-[10px] tracking-widest leading-relaxed">
                                        TURNUVAYA KATILMAK İÇİN TAKIM BİLGİLERİNİZİ GİRİN. FİKSTÜR ÇEKİLDİKTEN SONRA YENİ BAŞVURU KABUL EDİLMEMEKTEDİR.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={submit} className="p-8 space-y-8">
                                    {tournaments.length === 0 && (
                                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center gap-3">
                                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                                            <p className="text-[10px] font-black uppercase text-amber-900 tracking-tight">ŞU ANDA BAŞVURUYA AÇIK BİR TURNUVA BULUNMAMAKTADIR.</p>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">TAKIM ADI</Label>
                                            <Input 
                                                id="name" 
                                                placeholder="ÖRNEK: PERSONEL SPOR" 
                                                className="h-14 rounded-2xl bg-neutral-50 border-none font-black uppercase text-sm px-6 focus:ring-2 focus:ring-blue-600/20"
                                                value={data.name}
                                                onChange={e => setData('name', e.target.value)}
                                                required
                                            />
                                            {errors.name && <p className="text-rose-500 text-[10px] font-black uppercase ml-1">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">TURNUVA SEÇİMİ</Label>
                                            <Select onValueChange={val => setData('tournament_id', val)} defaultValue={data.tournament_id}>
                                                <SelectTrigger className="h-14 rounded-2xl bg-neutral-50 border-none font-black text-sm uppercase px-6">
                                                    <SelectValue placeholder="BİR TURNUVA SEÇİN" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-none shadow-3xl p-2">
                                                    {tournaments.map(t => (
                                                        <SelectItem key={t.id} value={t.id.toString()} className="uppercase font-black text-xs py-3 rounded-xl">
                                                            {t.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.tournament_id && <p className="text-rose-500 text-[10px] font-black uppercase ml-1">{errors.tournament_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">BİRİM (DEPARTMAN)</Label>
                                            <Select 
                                                onValueChange={val => setData('unit_id', val)} 
                                                defaultValue={data.unit_id}
                                                disabled={!!auth.user.unit_id}
                                            >
                                                <SelectTrigger className="h-14 rounded-2xl bg-neutral-50 border-none font-black text-sm uppercase px-6 opacity-80">
                                                    <SelectValue placeholder="BİRİM SEÇİN" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-none shadow-3xl p-2">
                                                    {units.map(u => (
                                                        <SelectItem key={u.id} value={u.id.toString()} className="uppercase font-black text-xs py-3 rounded-xl">{u.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.unit_id && <p className="text-rose-500 text-[10px] font-black uppercase ml-1">{errors.unit_id}</p>}
                                        </div>
                                    </div>

                                    <Button 
                                        type="submit" 
                                        disabled={processing || tournaments.length === 0}
                                        className="w-full h-16 bg-blue-600 hover:bg-black text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-2xl shadow-blue-600/20 transition-all duration-300 transform active:scale-95"
                                    >
                                        BAŞVURUYU GÖNDER
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <Link href="/login">
                            <Button className="h-14 px-8 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-black uppercase tracking-widest text-xs rounded-2xl transition-all">
                                BAŞVURU İÇİN GİRİŞ YAPIN
                            </Button>
                        </Link>
                    )}
                </div>

                <Card className="border-none shadow-2xl bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-neutral-50/50 dark:bg-neutral-900 hover:bg-transparent border-none">
                                    <TableHead className="py-6 px-8 uppercase font-black text-[10px] text-neutral-400 tracking-widest">Takım Bilgileri</TableHead>
                                    <TableHead className="py-6 uppercase font-black text-[10px] text-neutral-400 tracking-widest">Birim</TableHead>
                                    <TableHead className="py-6 uppercase font-black text-[10px] text-neutral-400 tracking-widest">Turnuva</TableHead>
                                    <TableHead className="py-6 uppercase font-black text-[10px] text-neutral-400 tracking-widest">Kadro</TableHead>
                                    <TableHead className="py-6 uppercase font-black text-[10px] text-neutral-400 tracking-widest">Durum</TableHead>
                                    <TableHead className="py-6 px-8 text-right uppercase font-black text-[10px] text-neutral-400 tracking-widest">Aksiyon</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teams.map((team) => (
                                    <TableRow key={team.id} className="group transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800/50 border-b border-neutral-50 dark:border-neutral-800">
                                        <TableCell className="px-8 py-6">
                                            <Link href={route('teams.show', team.id)} className="flex items-center gap-4 group/link">
                                                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm transition-transform group-hover/link:scale-110">
                                                    {team.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-black uppercase text-sm tracking-tighter leading-none group-hover/link:text-blue-600 transition-colors">
                                                        {team.name}
                                                    </p>
                                                    {auth.user && team.user_id === auth.user.id && (
                                                        <span className="text-[8px] font-black uppercase text-blue-500 tracking-widest mt-1 inline-block bg-blue-50 px-1.5 py-0.5 rounded-full">KENDİ TAKIMINIZ</span>
                                                    )}
                                                </div>
                                            </Link>
                                        </TableCell>
                                        <TableCell className="py-6">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-3 w-3 text-neutral-300" />
                                                <span className="text-xs font-bold uppercase text-neutral-500 tracking-tight">{team.unit?.name || 'BELİRSİZ'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6">
                                            <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest line-clamp-1">{team.tournament?.name || 'BELİRSİZ'}</span>
                                        </TableCell>
                                        <TableCell className="py-6">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={`border-none px-2 py-0.5 rounded-md text-[10px] font-black ${team.players_count < (team.tournament?.settings.min_roster_size ?? 6) ? 'bg-rose-50 text-rose-600' : team.players_count >= (team.tournament?.settings.max_roster_size ?? 12) ? 'bg-blue-50 text-blue-600' : 'bg-neutral-50 text-neutral-600'}`}>
                                                    <Users className="h-3 w-3 mr-1.5" /> {team.players_count} / {team.tournament?.settings.max_roster_size ?? 12}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6">
                                            {team.status === 'approved' ? (
                                                <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1 text-[9px] font-black tracking-widest rounded-full uppercase">
                                                    <CheckCircle className="h-3 w-3 mr-1" /> ONAYLANDI
                                                </Badge>
                                            ) : team.status === 'pending' ? (
                                                <Badge className="bg-amber-50 text-amber-600 border-none px-3 py-1 text-[9px] font-black tracking-widest rounded-full uppercase">
                                                    <Clock className="h-3 w-3 mr-1" /> BEKLEMEDE
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-rose-50 text-rose-600 border-none px-3 py-1 text-[9px] font-black tracking-widest rounded-full uppercase">
                                                    <XCircle className="h-3 w-3 mr-1" /> REDDEDİLDİ
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-8 py-6 text-right">
                                            <Link href={route('teams.show', team.id)}>
                                                <Button variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-neutral-100 transition-all opacity-0 group-hover:opacity-100">
                                                    <ChevronRight className="h-6 w-6 text-neutral-400" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {teams.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-24 text-center">
                                            <div className="h-20 w-20 rounded-full bg-neutral-50 flex items-center justify-center mx-auto mb-6">
                                                <Users className="h-10 w-10 text-neutral-200" />
                                            </div>
                                            <p className="text-xs font-black text-neutral-300 uppercase tracking-[0.3em]">HİÇ TAKIM BULUNAMADI</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
