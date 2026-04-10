import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    Users, 
    Trophy, 
    Calendar, 
    ChevronRight, 
    PlusCircle, 
    Shield, 
    UserGroup, 
    Activity,
    Info,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Team {
    id: number;
    name: string;
    status: string;
    unit: { name: string };
    tournament: { name: string };
}

interface Props {
    team: Team | null;
    tournaments: any[];
    upcoming_games: any[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

export default function ManagerDashboard({ team, tournaments, upcoming_games }: Props) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Yönetici Paneli" />
            
            <div className="flex h-full flex-1 flex-col gap-8 p-8 font-sans">
                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight leading-none">Hoş Geldin, {auth.user.name.split(' ')[0]}!</h1>
                        <p className="text-neutral-500 mt-2 font-medium uppercase text-[10px] tracking-widest">{auth.user.unit?.name || 'Birim Tanımlanmamış'} - TAKIM SORUMLUSU</p>
                    </div>
                </div>

                {!team ? (
                    /* Call to Action: No Team */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="border-none shadow-2xl bg-neutral-900 text-white rounded-[2.5rem] overflow-hidden p-10 relative">
                            <div className="absolute top-0 right-0 p-10 opacity-10">
                                <Trophy className="h-40 w-40" />
                            </div>
                            <div className="relative z-10 space-y-6">
                                <h2 className="text-4xl font-black uppercase tracking-tighter leading-tight">Henüz Bir Takımın<br/>Bulunmuyor!</h2>
                                <p className="text-neutral-400 font-medium max-w-sm">Turnuvaya katılmak için hemen takım başvurunu yap ve oyuncularını eklemeye başla.</p>
                                <Link href="/teams">
                                    <Button className="h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-500/20 mt-4">
                                        TAKIMINI ŞİMDİ KUR
                                    </Button>
                                </Link>
                            </div>
                        </Card>

                        <div className="space-y-6">
                            <Card className="border-none shadow-xl bg-white rounded-[2rem] p-6">
                                <CardHeader className="p-2">
                                    <CardTitle className="text-sm font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                                        <Info className="h-4 w-4" /> Önemli Hatırlatma
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2 mt-4 space-y-4">
                                    <p className="text-sm font-bold text-neutral-600 leading-relaxed uppercase tracking-tight">
                                        Takım kurabilmek için hesabınıza bir birim (departman) tanımlanmış olmalıdır.
                                    </p>
                                    {!auth.user.unit_id && (
                                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                                            <AlertCircle className="h-5 w-5 shrink-0" />
                                            <p className="text-[10px] font-black uppercase">Henüz biriminiz tanımlanmamış. Lütfen yönetici ile iletişime geçin.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    /* Existing Team Dashboard */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* My Team Card */}
                        <Card className="lg:col-span-2 border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Shield className="h-32 w-32" />
                            </div>
                            <CardHeader className="p-10 pb-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="h-16 w-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-blue-600/20">
                                            {team.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black tracking-tighter uppercase">{team.name}</h2>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge className="bg-neutral-100 text-neutral-500 hover:bg-neutral-200 border-none uppercase text-[9px] font-black px-2">{team.unit.name}</Badge>
                                                <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-none uppercase text-[9px] font-black px-2">{team.tournament.name}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-1">DURUM</p>
                                        {team.status === 'approved' ? (
                                            <Badge className="bg-emerald-100 text-emerald-600 border-none uppercase text-[10px] font-black px-3 py-1 scale-110"><CheckCircle className="h-3 w-3 mr-1" /> ONAYLANDI</Badge>
                                        ) : (
                                            <Badge className="bg-amber-100 text-amber-600 border-none uppercase text-[10px] font-black px-3 py-1 scale-110"><Activity className="h-3 w-3 mr-1" /> BEKLEMEDE</Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-10 pt-0 flex flex-col sm:flex-row gap-4">
                                <Link href={route('teams.show', team.id)} className="flex-1">
                                    <Button className="w-full h-14 bg-neutral-900 hover:bg-neutral-800 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-neutral-900/10 flex items-center justify-center gap-2">
                                        <Users className="h-5 w-5" /> KADRO VE OYUNCU YÖNETİMİ
                                    </Button>
                                </Link>
                                <Link href="/teams" className="sm:w-auto">
                                    <Button variant="outline" className="w-full h-14 px-8 border-neutral-200 text-neutral-600 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-neutral-50">
                                        TÜM TAKIMLAR
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Stats / Upcoming Sidebar */}
                        <div className="space-y-8">
                            <Card className="border-none shadow-xl bg-slate-50 rounded-[2rem] p-8">
                                <CardHeader className="p-0 mb-6">
                                    <CardTitle className="text-xs font-black uppercase tracking-widest text-neutral-400">Yaklaşan Maçlar</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 space-y-4">
                                    {upcoming_games.length > 0 ? (
                                        upcoming_games.map((game: any) => (
                                            <div key={game.id} className="p-4 rounded-3xl bg-white shadow-sm border border-slate-100 flex items-center justify-between">
                                                <div className="text-xs font-black uppercase tracking-tighter">
                                                    {game.home_team.name} vs {game.away_team.name}
                                                </div>
                                                <Badge className="bg-blue-50 text-blue-600 text-[10px]">{game.match_date}</Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 opaity-50">
                                            <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Henüz Fikstür Çekilmedi</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
