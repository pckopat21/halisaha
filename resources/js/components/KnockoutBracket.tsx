import React, { useState } from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import { Edit3, Trophy, ArrowRightLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Team {
    id: number;
    name: string;
    unit?: { name: string };
}

interface Game {
    id: number;
    home_team_id: number;
    away_team_id: number;
    home_team: Team;
    away_team: Team;
    home_score: number | null;
    away_score: number | null;
    status: 'scheduled' | 'playing' | 'completed';
    scheduled_at: string;
    started_at: string | null;
    round?: string;
    has_penalties?: boolean;
    home_penalty_score?: number;
    away_penalty_score?: number;
}

interface KnockoutBracketProps {
    games: Game[];
    teams: Team[];
    isCommittee: boolean;
    onEditResult?: (game: Game) => void;
    hideTitle?: boolean;
}

export default function KnockoutBracket({ games, teams, isCommittee, onEditResult, hideTitle }: KnockoutBracketProps) {
    const [hoveredTeamId, setHoveredTeamId] = useState<number | null>(null);
    const [selectedEditGame, setSelectedEditGame] = useState<Game | null>(null);

    const editForm = useForm({
        home_team_id: '',
        away_team_id: '',
    });

    const openEditMatchModal = (game: Game, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedEditGame(game);
        editForm.setData({
            home_team_id: game.home_team_id?.toString() || '',
            away_team_id: game.away_team_id?.toString() || '',
        });
    };

    const handleEditMatchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEditGame) return;

        router.put(route('games.update-teams', selectedEditGame.id), {
            home_team_id: editForm.data.home_team_id === 'null' || editForm.data.home_team_id === '' ? null : editForm.data.home_team_id,
            away_team_id: editForm.data.away_team_id === 'null' || editForm.data.away_team_id === '' ? null : editForm.data.away_team_id,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedEditGame(null);
                editForm.reset();
            },
            onError: (errors: any) => {
                editForm.setError(errors);
            }
        });
    };

    const roundsInOrder = ['round_16', 'quarter', 'semi', 'final', 'third_place'];
    const activeRounds = roundsInOrder.filter(round => games.some(g => g.round === round));

    if (games.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                <Trophy className="h-20 w-20 mb-6 text-slate-200" />
                <p className="text-sm font-bold uppercase tracking-widest">Eleme turları henüz başlatılmadı.</p>
            </div>
        );
    }

    return (
        <div className="w-full relative">
            <Card className="border border-white/10 shadow-2xl bg-white/40 dark:bg-neutral-900/40 backdrop-blur-3xl rounded-[2rem] md:rounded-[3rem] overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent pointer-events-none" />
                <div className="p-4 md:p-8 lg:p-12 relative z-10">
                    {!hideTitle && (
                        <div className="flex flex-col items-center justify-center mb-12 text-center px-4">
                            <Badge className="bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20 font-black mb-4 uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 rounded-full">GÖRSEL MAÇ AĞACI</Badge>
                            <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">ELEME TURLARI</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold text-xs md:text-sm tracking-widest px-6 uppercase">Şampiyonluğa giden yol</p>
                        </div>
                    )}

                    <div className="flex flex-nowrap overflow-x-auto pb-8 gap-4 md:gap-8 lg:gap-12 justify-start min-h-[400px] items-stretch -mx-4 px-4 md:-mx-8 md:px-8 snap-x snap-mandatory relative">
                        {activeRounds.map((round, roundIndex) => {
                            const roundGames = games.filter(g => g.round === round);
                            const isLastRound = roundIndex === activeRounds.length - 1;
                            
                            return (
                                <div key={round} className="flex flex-col relative min-w-[260px] md:min-w-[280px] snap-center shrink-0">
                                    <div className="text-center mb-10 shrink-0 sticky left-0 right-0">
                                        <div className={`inline-block border border-white/20 backdrop-blur-md px-6 py-2.5 rounded-2xl shadow-xl ${round === 'third_place' || round === 'final' ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' : 'bg-white/80 dark:bg-neutral-800/80 text-slate-800 dark:text-white'}`}>
                                            <span className="text-[11px] font-black uppercase tracking-[0.2em] drop-shadow-sm">
                                                {round === 'round_16' ? 'SON 16' : round === 'quarter' ? 'ÇEYREK FİNAL' : round === 'semi' ? 'YARI FİNAL' : round === 'third_place' ? '3.LÜK MAÇI' : 'FİNAL'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-around flex-1 gap-8 md:gap-12 relative z-10 w-full">
                                        {roundGames.map((m, gameIdx) => (
                                            <div key={m.id} className="relative group w-full flex items-center">
                                                {isCommittee && (
                                                    <div className="absolute -top-3 -right-3 flex gap-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {m.status !== 'completed' && (
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={(e) => openEditMatchModal(m, e)}
                                                                className="h-8 w-8 rounded-full bg-white dark:bg-neutral-800 shadow-xl border border-slate-200 dark:border-neutral-700 hover:bg-emerald-500 hover:text-white transition-all hover:scale-110"
                                                                title="Takımları Değiştir"
                                                            >
                                                                <ArrowRightLeft className="h-3.5 w-3.5" />
                                                            </Button>
                                                        )}
                                                        {onEditResult && (
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    onEditResult(m);
                                                                }}
                                                                className="h-8 w-8 rounded-full bg-white dark:bg-neutral-800 shadow-xl border border-slate-200 dark:border-neutral-700 hover:bg-blue-600 hover:text-white transition-all hover:scale-110"
                                                                title="Sonucu Düzenle"
                                                            >
                                                                <Edit3 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                                <Link href={route('games.show', m.id)} className="w-full relative z-20 block outline-none">
                                                    <div className={`w-full rounded-[1.5rem] shadow-lg transition-all duration-500 p-[2px] ${
                                                        (hoveredTeamId && (m.home_team?.id === hoveredTeamId || m.away_team?.id === hoveredTeamId))
                                                            ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 scale-[1.03] shadow-[0_10px_40px_-10px_rgba(245,158,11,0.5)]'
                                                            : 'bg-gradient-to-b from-white/40 to-white/10 dark:from-white/10 dark:to-transparent hover:from-amber-400/50 hover:to-orange-500/50'
                                                    }`}>
                                                        <div className="rounded-[1.4rem] p-3 backdrop-blur-2xl bg-white/90 dark:bg-neutral-900/90 text-slate-900 dark:text-white overflow-hidden relative">
                                                            
                                                            {/* Champion Glow for Final */}
                                                            {round === 'final' && m.status === 'completed' && (
                                                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
                                                            )}

                                                            <div className="flex flex-col relative z-10">
                                                                {/* Ev Sahibi */}
                                                                <div 
                                                                    onMouseEnter={() => m.home_team?.id && setHoveredTeamId(m.home_team.id)}
                                                                    onMouseLeave={() => setHoveredTeamId(null)}
                                                                    className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                                                                        hoveredTeamId === m.home_team?.id ? 'bg-amber-500/10 dark:bg-amber-500/20 translate-x-1' : 'hover:bg-slate-50 dark:hover:bg-white/5'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                                        <div className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-[11px] font-black transition-colors ${
                                                                            (hoveredTeamId && m.home_team?.id === hoveredTeamId) ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                                                                        }`}>
                                                                            {(m.home_team?.name || '??').substring(0, 2).toUpperCase()}
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-bold text-sm truncate max-w-[140px] md:max-w-[160px]">{m.home_team?.name || 'BELİRLENMEDİ'}</span>
                                                                            {round === 'final' && m.status === 'completed' && (m.home_score ?? 0) > (m.away_score ?? 0) && (
                                                                                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">ŞAMPİYON 🏆</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <span className={`text-2xl font-black tabular-nums shrink-0 ml-3 ${
                                                                        m.status === 'completed' 
                                                                            ? ((m.home_score ?? 0) > (m.away_score ?? 0) 
                                                                                ? 'text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]' 
                                                                                : 'opacity-40')
                                                                            : 'opacity-20'
                                                                    }`}>{m.home_score ?? '-'}</span>
                                                                </div>
                                                                
                                                                {/* Ayırıcı */}
                                                                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent my-1" />

                                                                {/* Deplasman */}
                                                                <div 
                                                                    onMouseEnter={() => m.away_team?.id && setHoveredTeamId(m.away_team.id)}
                                                                    onMouseLeave={() => setHoveredTeamId(null)}
                                                                    className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                                                                        hoveredTeamId === m.away_team?.id ? 'bg-amber-500/10 dark:bg-amber-500/20 translate-x-1' : 'hover:bg-slate-50 dark:hover:bg-white/5'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                                        <div className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-[11px] font-black transition-colors ${
                                                                            (hoveredTeamId && m.away_team?.id === hoveredTeamId) ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                                                                        }`}>
                                                                            {(m.away_team?.name || '??').substring(0, 2).toUpperCase()}
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-bold text-sm truncate max-w-[140px] md:max-w-[160px]">{m.away_team?.name || 'BELİRLENMEDİ'}</span>
                                                                            {round === 'final' && m.status === 'completed' && (m.away_score ?? 0) > (m.home_score ?? 0) && (
                                                                                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">ŞAMPİYON 🏆</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <span className={`text-2xl font-black tabular-nums shrink-0 ml-3 ${
                                                                        m.status === 'completed' 
                                                                            ? ((m.away_score ?? 0) > (m.home_score ?? 0) 
                                                                                ? 'text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]' 
                                                                                : 'opacity-40')
                                                                            : 'opacity-20'
                                                                    }`}>{m.away_score ?? '-'}</span>
                                                                </div>

                                                                {m.has_penalties && (
                                                                    <div className="pt-3 mt-2 border-t border-slate-100 dark:border-white/5 text-center bg-slate-50/50 dark:bg-black/20 rounded-b-xl -mx-3 -mb-3 pb-2">
                                                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                                                                            (hoveredTeamId && (m.home_team?.id === hoveredTeamId || m.away_team?.id === hoveredTeamId)) ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'
                                                                        }`}>PENALTILAR: {m.home_penalty_score} - {m.away_penalty_score}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                                {!isLastRound && (
                                                    <div className="hidden md:block absolute top-1/2 -right-8 lg:-right-12 w-8 lg:w-12 h-[2px] transition-all duration-500 z-0 overflow-hidden" 
                                                        style={{
                                                            opacity: hoveredTeamId && (m.home_team?.id === hoveredTeamId || m.away_team?.id === hoveredTeamId) ? 1 : 0.2
                                                        }}
                                                    >
                                                        <div className={`w-full h-full ${hoveredTeamId && (m.home_team?.id === hoveredTeamId || m.away_team?.id === hoveredTeamId) ? 'bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Card>

            <Dialog open={!!selectedEditGame} onOpenChange={(open) => !open && setSelectedEditGame(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-black uppercase tracking-widest text-lg">EŞLEŞMEYİ DÜZENLE</DialogTitle>
                        <DialogDescription>
                            Bu maçtaki takımları manuel olarak değiştirebilirsiniz.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditMatchSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Ev Sahibi Takım</Label>
                            <Select 
                                value={editForm.data.home_team_id} 
                                onValueChange={(val) => editForm.setData('home_team_id', val)}
                            >
                                <SelectTrigger className="h-12 rounded-xl font-bold bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white">
                                    <SelectValue placeholder="Ev sahibi seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="null" className="text-slate-500 dark:text-slate-400 italic">Boş Bırak (Bay)</SelectItem>
                                    {teams.map(team => (
                                        <SelectItem key={team.id} value={team.id.toString()}>{team.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {editForm.errors.home_team_id && <p className="text-rose-500 text-xs mt-1">{editForm.errors.home_team_id}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Deplasman Takım</Label>
                            <Select 
                                value={editForm.data.away_team_id} 
                                onValueChange={(val) => editForm.setData('away_team_id', val)}
                            >
                                <SelectTrigger className="h-12 rounded-xl font-bold bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white">
                                    <SelectValue placeholder="Deplasman seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="null" className="text-slate-500 dark:text-slate-400 italic">Boş Bırak (Bay)</SelectItem>
                                    {teams.map(team => (
                                        <SelectItem key={team.id} value={team.id.toString()}>{team.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {editForm.errors.away_team_id && <p className="text-rose-500 text-xs mt-1">{editForm.errors.away_team_id}</p>}
                        </div>
                        <DialogFooter className="mt-6 pt-4 border-t border-slate-100">
                            <Button type="button" variant="ghost" onClick={() => setSelectedEditGame(null)} className="h-12 rounded-xl font-bold">İptal</Button>
                            <Button type="submit" disabled={editForm.processing} className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-8">Kaydet</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
