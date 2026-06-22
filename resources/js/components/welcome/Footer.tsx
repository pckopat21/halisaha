import { motion } from "framer-motion";
import TournamentLogo from "@/components/tournament-logo";
import { useReducedMotion } from "@/lib/motion-presets";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { usePage } from "@inertiajs/react";
import { SharedData } from "@/types";
import { BookOpen, ShieldCheck, Mail, Globe } from "lucide-react";

export default function Footer() {
    const reduced = useReducedMotion();
    const { public_rules } = usePage<SharedData>().props;

    const [rulesOpen, setRulesOpen] = useState(false);
    const [privacyOpen, setPrivacyOpen] = useState(false);
    const [supportOpen, setSupportOpen] = useState(false);

    return (
        <>
            <motion.footer
                className="bg-slate-50 border-t border-slate-200 py-24 px-6 relative z-10"
                initial={reduced ? false : { y: 12 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0">
                                <TournamentLogo className="h-full w-full" />
                            </div>
                            <span className="text-xl font-black uppercase tracking-tighter text-slate-900">
                                KARAYOLLARI <span className="text-orange-600 italic">TURNUVA</span>
                            </span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                            © 2026 KGM. TÜM HAKLARI SAKLIDIR.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <button onClick={() => setRulesOpen(true)} className="hover:text-orange-600 transition-colors border-b-2 border-transparent hover:border-orange-600 pb-1">
                            KURALLAR
                        </button>
                        <button onClick={() => setPrivacyOpen(true)} className="hover:text-orange-600 transition-colors border-b-2 border-transparent hover:border-orange-600 pb-1">
                            GİZLİLİK
                        </button>
                        <button onClick={() => setSupportOpen(true)} className="hover:text-orange-600 transition-colors border-b-2 border-transparent hover:border-orange-600 pb-1">
                            İLETİŞİM
                        </button>
                        <a href="https://www.kgm.gov.tr" target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 transition-colors border-b-2 border-transparent hover:border-orange-600 pb-1 flex items-center gap-1">
                            KGM WEB
                        </a>
                    </div>
                </div>
            </motion.footer>

            {/* Rules Modal */}
            <Dialog open={rulesOpen} onOpenChange={setRulesOpen}>
                <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-border bg-background max-h-[85vh] flex flex-col">
                    <DialogHeader className="p-10 bg-slate-900 text-white shrink-0">
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                                <BookOpen className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Turnuva Kuralları</DialogTitle>
                                <DialogDescription className="text-white/40 font-bold uppercase text-[10px] tracking-widest mt-1">
                                    KARAYOLLARI HALI SAHA TURNUVASI GENEL KURALLARI
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="p-10 overflow-y-auto flex-1 space-y-8">
                        {public_rules && public_rules.length > 0 ? (
                            public_rules.map((rule) => (
                                <div key={rule.id} className="space-y-3">
                                    <h4 className="text-lg font-black uppercase tracking-tighter text-blue-600 flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-lg bg-blue-100 flex items-center justify-center text-[10px] text-blue-600">
                                            {rule.sort_order}
                                        </div>
                                        {rule.title}
                                    </h4>
                                    <div className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap pl-8">
                                        {rule.content}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 opacity-50">
                                <BookOpen className="h-12 w-12 mx-auto mb-4" />
                                <p className="text-sm font-bold uppercase tracking-widest">Henüz kural eklenmemiş.</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Privacy Modal */}
            <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
                <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-border bg-background max-h-[85vh] flex flex-col">
                    <DialogHeader className="p-10 bg-slate-900 text-white shrink-0">
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 bg-orange-600 rounded-3xl flex items-center justify-center shadow-xl shadow-orange-500/20">
                                <ShieldCheck className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Gizlilik Politikası</DialogTitle>
                                <DialogDescription className="text-white/40 font-bold uppercase text-[10px] tracking-widest mt-1">
                                    VERİ GİZLİLİĞİ VE KULLANIM ŞARTLARI
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="p-10 overflow-y-auto flex-1 space-y-6 text-sm font-medium text-slate-600 leading-relaxed">
                        <h4 className="text-lg font-black uppercase tracking-tighter text-slate-900">1. Genel Bilgilendirme</h4>
                        <p>Karayolları Halı Saha Turnuvası platformu, yalnızca KGM personeli ve turnuvaya katılan misafir oyuncuların turnuva organizasyonlarını yönetmek amacıyla kullanılmaktadır. Sisteme girilen kişisel bilgiler, yalnızca turnuva kayıt ve yönetim süreçleri için işlenir.</p>

                        <h4 className="text-lg font-black uppercase tracking-tighter text-slate-900 mt-6">2. Veri Kullanımı</h4>
                        <p>Platform üzerinden toplanan isim, takım, fotoğraf ve iletişim bilgileri organizasyon komitesi tarafından onay süreçlerinde ve maç fikstürlerinde görüntülenir. Bu veriler üçüncü şahıslarla paylaşılmaz ve ticari amaçlarla kullanılmaz.</p>

                        <h4 className="text-lg font-black uppercase tracking-tighter text-slate-900 mt-6">3. Sistem Güvenliği</h4>
                        <p>Şifreleriniz ve hesap bilgileriniz güncel güvenlik standartlarıyla korunmaktadır. Kendi hesap güvenliğinizden siz sorumlusunuz. Şüpheli bir durumda lütfen destek ile iletişime geçin.</p>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Support Modal */}
            <Dialog open={supportOpen} onOpenChange={setSupportOpen}>
                <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-border bg-background">
                    <DialogHeader className="p-10 bg-slate-900 text-white pb-16 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full translate-y-1/2"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/20 mb-6 border-4 border-slate-900">
                                <Mail className="h-10 w-10 text-white" />
                            </div>
                            <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Destek & İletişim</DialogTitle>
                            <DialogDescription className="text-white/60 font-bold uppercase text-[10px] tracking-widest mt-2">
                                SİSTEMLE İLGİLİ SORU VE SORUNLARINIZ İÇİN
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <div className="p-10 -mt-10 relative z-20">
                        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 text-center space-y-4">
                            <h3 className="font-black text-xl uppercase tracking-tighter">Servet AVCI</h3>
                            <p className="text-sm font-medium text-slate-500">Sistem Yöneticisi & Geliştirici</p>
                            <div className="pt-4 border-t border-slate-100">
                                <a href="mailto:servet.avci@kgm.gov.tr" className="inline-flex items-center gap-2 bg-slate-50 hover:bg-blue-50 text-blue-600 px-6 py-3 rounded-2xl transition-colors font-bold text-sm">
                                    <Mail className="h-4 w-4" /> servet.avci@kgm.gov.tr
                                </a>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
