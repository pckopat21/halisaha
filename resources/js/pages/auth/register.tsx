import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Yeni Takım Kaydı" description="Turnuvaya katılmak için kurumsal bilgilerinizi girerek kayıt olun">
            <Head title="Kayıt Ol" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-white">Ad Soyad</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Adınız ve Soyadınız"
                            className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:ring-[#FF8C00]"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-white">E-posta Adresi</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="eposta@kgm.gov.tr"
                            className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:ring-[#FF8C00]"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password" className="text-white">Şifre</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Güçlü bir şifre belirleyin"
                            className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:ring-[#FF8C00]"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation" className="text-white">Şifre Tekrar</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Şifrenizi doğrulayın"
                            className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:ring-[#FF8C00]"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="mt-2 w-full bg-[#FF8C00] hover:bg-[#e67e00] text-white font-bold py-6 text-lg transition-all shadow-lg shadow-orange-500/20" tabIndex={5} disabled={processing}>
                        {processing && <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />}
                        KAYIT OL
                    </Button>
                </div>

                <div className="text-slate-300 text-center text-sm">
                    Zaten bir hesabınız var mı?{' '}
                    <TextLink href={route('login')} className="text-[#FF8C00] font-semibold hover:underline" tabIndex={6}>
                        Giriş Yap
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
