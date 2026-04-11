import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Kullanıcı Girişi" description="Lütfen e-posta adresiniz ve şifrenizle giriş yapın">
            <Head title="Giriş Yap" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-white">E-posta Adresi</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="eposta@kgm.gov.tr"
                            className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:ring-[#FF8C00]"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password" className="text-white">Şifre</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm text-slate-300 hover:text-[#FF8C00]" tabIndex={5}>
                                    Şifremi Unuttum?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:ring-[#FF8C00]"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox id="remember" name="remember" tabIndex={3} className="border-white/40 data-[state=checked]:bg-[#FF8C00]" />
                        <Label htmlFor="remember" className="text-slate-200 text-sm font-normal">Beni Hatırla</Label>
                    </div>

                    <Button type="submit" className="mt-4 w-full bg-[#FF8C00] hover:bg-[#e67e00] text-white font-bold py-6 text-lg transition-all shadow-lg shadow-orange-500/20" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />}
                        GİRİŞ YAP
                    </Button>
                </div>

                <div className="text-slate-300 text-center text-sm">
                    Henüz hesabınız yok mu?{' '}
                    <TextLink href={route('register')} className="text-[#FF8C00] font-semibold hover:underline" tabIndex={5}>
                        Takım Kaydı Oluştur
                    </TextLink>
                </div>
            </form>

            {status && <div className="mt-4 text-center text-sm font-medium text-green-400 bg-green-950/30 py-2 rounded-md border border-green-500/20">{status}</div>}
        </AuthLayout>
    );
}
