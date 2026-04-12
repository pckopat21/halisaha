<?php

namespace App\Http\Controllers;

use App\Models\Player;
use App\Services\StatsService;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\PlayerTemplateExport;
use App\Imports\PlayerImport;

class PlayerController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $query = Player::with(['unit', 'teams.tournament'])->latest();

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('tc_id', 'like', "%{$search}%")
                  ->orWhere('sicil_no', 'like', "%{$search}%");
            });
        }

        if ($request->filled('filter')) {
            $filter = $request->get('filter');
            switch ($filter) {
                case 'licensed': $query->where('is_licensed', true); break;
                case 'company': $query->where('is_company_staff', true); break;
                case 'permanent': $query->where('is_permanent_staff', true); break;
                case 'available': $query->whereDoesntHave('teams'); break;
            }
        }

        return Inertia::render('players/index', [
            'players' => $query->paginate(15)->withQueryString(),
            'units' => \App\Models\Unit::all(),
            'filters' => $request->only(['search', 'filter'])
        ]);
    }

    public function store(\Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'tc_id' => 'required|string|size:11|unique:players,tc_id',
            'sicil_no' => 'required|string|max:20|unique:players,sicil_no',
            'unit_id' => 'required|exists:units,id',
            'is_company_staff' => 'boolean',
            'is_permanent_staff' => 'boolean',
            'is_licensed' => 'boolean',
            'health_certificate' => 'boolean',
            'jersey_number' => 'nullable|integer|between:1,99',
            'team_id' => 'nullable|exists:teams,id',
            'is_captain' => 'boolean'
        ]);

        if ($request->has('health_certificate') && $request->health_certificate) {
            $validated['health_certificate_at'] = now();
        }

        $player = Player::create($validated);

        // If team_id is provided, automatically add to that team
        if ($request->team_id) {
            $team = \App\Models\Team::findOrFail($request->team_id);
            
            // Add to roster
            $team->players()->syncWithoutDetaching([$player->id]);

            // If is_captain is marked, set as team captain
            if ($request->is_captain) {
                $team->update(['captain_id' => $player->id]);
            }
        }

        return redirect()->back()->with('success', 'Personel başarıyla kaydedildi' . ($request->team_id ? ' ve kadroya eklendi.' : '.'));
    }

    public function toggleHealth(Player $player)
    {
        $player->update([
            'health_certificate_at' => $player->health_certificate_at ? null : now()
        ]);

        return redirect()->back()->with('success', 'Sağlık raporu durumu güncellendi.');
    }

    public function update(Player $player, \Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'tc_id' => 'required|string|size:11|unique:players,tc_id,'.$player->id,
            'sicil_no' => 'required|string|max:20|unique:players,sicil_no,'.$player->id,
            'unit_id' => 'required|exists:units,id',
            'is_company_staff' => 'boolean',
            'is_permanent_staff' => 'boolean',
            'is_licensed' => 'boolean',
            'health_certificate' => 'boolean',
            'jersey_number' => 'nullable|integer|between:1,99',
        ]);

        if ($request->has('health_certificate')) {
            $validated['health_certificate_at'] = $request->health_certificate ? now() : null;
        }

        $player->update($validated);

        return redirect()->back()->with('success', 'Personel bilgileri güncellendi.');
    }

    public function show(Player $player, StatsService $statsService)
    {
        $stats = $statsService->getPlayerStats($player);

        return Inertia::render('players/show', [
            'stats' => $stats
        ]);
    }

    public function destroy(Player $player)
    {
        $player->delete();
        return redirect()->back()->with('success', 'Personel havuzdan silindi.');
    }

    public function downloadTemplate()
    {
        return Excel::download(new PlayerTemplateExport, 'personel_taslak.xlsx');
    }

    public function import(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv'
        ]);

        try {
            Excel::import(new PlayerImport, $request->file('file'));
            return redirect()->back()->with('success', 'Toplu personel aktarımı başarıyla tamamlandı. Mükerrer kayıtlar güncellendi.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Aktarım sırasında bir hata oluştu: ' . $e->getMessage());
        }
    }
}
