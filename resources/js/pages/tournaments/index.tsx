import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    Trophy, 
    Plus, 
    Settings, 
    Play, 
    Users, 
    Calendar, 
    ChevronRight, 
    Flame,
    Clock,
    Medal,
    Search,
    Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Turnuvalar', href: '/tournaments' },
];

interface Tournament {
    id: number;
    name: string;
    year: number;
    status: 'draft' | 'registration' | 'active' | 'completed';
    teams_count: number;
}

interface Props {
    tournaments: Tournament[];
}

export default function Index({ tournaments }: Props) {
    const { post, processing } = useForm({ group_count: 4 });

    const handleDraw = (id: number) => {
        if (confirm('Kura çekimi yapılarak fikstür oluşturulacaktır. Emin misiniz?')) {
            post(route('tournaments.draw', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Turnuvalar" />
            
            <div className="min-h-screen bg-background text-foreground p-6 md:p-12 font-sans overflow-x-hidden">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div>
                        <Badge variant="outline" className="mb-4 border-blue-100 text-blue-600 font-black uppercase tracking-[0.2em] py-1 px-4 rounded-full bg-blue-50 dark:bg-blue-500/10 dark:text-blue-500 dark:border-blue-500/30">
                            YÖNETİM PANELİ
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">Turnuva <span className="text-blue-500">Sezonları</span></h1>
                        <p className="text-muted-foreground mt-2 font-medium">Sistemdeki tüm aktif ve geçmiş halı saha organizasyonlarını buradan yönetin.</p>
                    </div>

                    <Button className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                        <Plus className="mr-2 h-4 w-4" /> YENİ TURNUVA BAŞLAT
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tournaments.map((tournament) => (
                        <Card key={tournament.id} className="bg-card border-border rounded-[2.5rem] group hover:border-blue-200 dark:hover:border-blue-500/20 transition-all duration-500 p-0 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
                            <div className="p-8">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="h-16 w-16 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center border border-border group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                        <Trophy className="h-8 w-8" />
                                    </div>
                                    <Badge 
                                        variant="outline"
                                        className={`uppercase tracking-widest text-[8px] font-black px-3 py-1.5 rounded-lg border-none ${
                                            tournament.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 
                                            tournament.status === 'completed' ? 'bg-muted text-muted-foreground' : 
                                            'bg-blue-500/10 text-blue-500'
                                        }`}
                                    >
                                        {tournament.status === 'draft' ? 'TASLAK' : 
                                         tournament.status === 'registration' ? 'KAYITLAR' :
                                         tournament.status === 'active' ? 'AKTİF' : 'BİTTİ'}
                                    </Badge>
                                </div>

                                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 group-hover:text-blue-500 transition-colors">{tournament.name}</h3>
                                <div className="flex items-center gap-4 text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-10">
                                    <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-blue-600" /> {tournament.year}</span>
                                    <span className="flex items-center gap-1.5"><Users className="h-3 w-3 text-blue-600" /> {tournament.teams_count} TAKIM</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Link href={route('tournaments.show', tournament.id)} className="flex-1">
                                        <Button variant="outline" className="w-full h-12 bg-muted/50 border-border hover:bg-muted text-foreground font-black uppercase tracking-widest text-[9px] rounded-xl group/btn transition-all">
                                            DETAYLAR <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                        </Button>
                                    </Link>
                                    
                                    {tournament.status === 'draft' && (
                                        <Button 
                                            onClick={() => handleDraw(tournament.id)}
                                            disabled={processing}
                                            className="h-12 w-12 bg-emerald-600 hover:bg-emerald-700 text-white p-0 rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                                            title="Kura Çek"
                                        >
                                            <Play className="h-5 w-5 fill-current" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                            
                            {/* Decorative line */}
                            <div className="h-1.5 w-full bg-border group-hover:bg-blue-600 transition-colors" />
                        </Card>
                    ))}

                    {tournaments.length === 0 && (
                        <div className="col-span-full py-40 text-center bg-card border border-dashed border-border rounded-[3rem]">
                            <Trophy className="h-20 w-20 text-muted-foreground/20 mx-auto mb-6" />
                            <h3 className="text-2xl font-black tracking-tighter text-muted-foreground/30">TURNUVA BULUNAMADI</h3>
                            <p className="text-xs font-bold text-muted-foreground/40 uppercase mt-2 tracking-widest">HENÜZ HİÇBİR TURNUVA SEZONU OLUŞTURULMAMIŞ.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
