import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface ResetPasswordProps {
    token: string;
    email: string;
}

interface ResetPasswordForm {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<ResetPasswordForm>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Şifreyi Sıfırla" description="Lütfen aşağıya yeni şifrenizi girin">
            <Head title="Şifre Sıfırlama" />

            <form onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-white">E-posta Adresi</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={data.email}
                            className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:ring-[#FF8C00]"
                            readOnly
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password" className="text-white">Yeni Şifre</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            autoComplete="new-password"
                            value={data.password}
                            className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:ring-[#FF8C00]"
                            autoFocus
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Yeni şifrenizi girin"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation" className="text-white">Şifre Tekrar</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:ring-[#FF8C00]"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Yeni şifrenizi doğrulayın"
                        />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>

                    <Button type="submit" className="mt-4 w-full bg-[#FF8C00] hover:bg-[#e67e00] text-white font-bold py-6 text-lg transition-all shadow-lg shadow-orange-500/20" disabled={processing}>
                        {processing && <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />}
                        ŞİFREYİ GÜNCELLE
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}
