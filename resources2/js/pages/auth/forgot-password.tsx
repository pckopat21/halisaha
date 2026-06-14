// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <AuthLayout title="Şifremi Unuttum" description="Şifrenizi sıfırlamak için kayıtlı e-posta adresinizi girin">
            <Head title="Şifre Sıfırlama" />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-400 bg-green-950/30 py-2 rounded-md border border-green-500/20">
                    {status}
                </div>
            )}

            <div className="space-y-6">
                <form onSubmit={submit}>
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-white">E-posta Adresi</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="off"
                            value={data.email}
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="eposta@kgm.gov.tr"
                            className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:ring-[#FF8C00]"
                        />

                        <InputError message={errors.email} />
                    </div>

                    <div className="my-6 flex items-center justify-start">
                        <Button className="w-full bg-[#FF8C00] hover:bg-[#e67e00] text-white font-bold py-6 text-lg transition-all shadow-lg shadow-orange-500/20" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />}
                            SIFIRLAMA BAĞLANTISI GÖNDER
                        </Button>
                    </div>
                </form>

                <div className="text-slate-300 text-center text-sm">
                    <span>Veya giriş sayfasına</span>{' '}
                    <TextLink href={route('login')} className="text-[#FF8C00] font-semibold hover:underline">
                        Geri Dön
                    </TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}
