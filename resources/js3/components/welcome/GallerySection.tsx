import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

interface GallerySectionProps {
    galleries: any[];
}

export default function GallerySection({ galleries }: GallerySectionProps) {
    return (
        <section className="py-24 px-6 relative z-10">
            <div className="container mx-auto max-w-7xl">
                <div className="flex items-center justify-between border-l-4 border-orange-600 pl-4 mb-12">
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900">ANLARI ÖLÜMSÜZLEŞTİR</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">TURNUVA GALERİSİNDEN SEÇMELER</p>
                    </div>
                    <Link href="/gallery">
                        <Button variant="ghost" className="text-orange-600 hover:text-orange-700 font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-6">
                            TÜMÜNÜ GÖR <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {(galleries || []).slice(0, 4).map((img, idx) => (
                        <motion.div
                            key={img?.id || idx}
                            whileHover={{ y: -10 }}
                            className="relative h-80 rounded-[2.5rem] overflow-hidden shadow-lg group border border-orange-100 bg-white"
                        >
                            <img src={img?.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent p-8 flex flex-col justify-end">
                                <p className="text-lg font-black uppercase tracking-tighter text-white translate-y-2 group-hover:translate-y-0 transition-transform">{img?.title || 'Fotoğraf'}</p>
                            </div>
                        </motion.div>
                    ))}
                    {(!galleries || galleries.length === 0) && (
                        <div className="col-span-4 py-24 text-center border-2 border-dashed border-orange-100 rounded-[3rem] bg-white shadow-sm opacity-40">
                            <ImageIcon className="h-16 w-16 mx-auto mb-4 text-orange-600" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Henüz fotoğraf eklenmedi</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
