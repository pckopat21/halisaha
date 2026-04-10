<?php

namespace App\Http\Controllers;

use App\Models\Player;
use App\Models\Team;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PlayerController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $players = Player::query()
            ->with(['unit', 'teams.tournament'])
            ->when($search, function ($query, $search) {
                $query->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('tc_id', 'like', "%{$search}%")
                      ->orWhere('sicil_no', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('players/index', [
            'players' => $players,
            'filters' => $request->only(['search']),
            'units' => Unit::all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'tc_id' => 'required|string|size:11|unique:players,tc_id',
            'sicil_no' => 'required|string|max:255|unique:players,sicil_no',
            'unit_id' => 'required|exists:units,id',
            'is_company_staff' => 'required|boolean',
            'is_permanent_staff' => 'required|boolean',
            'is_licensed' => 'required|boolean',
            'health_certificate' => 'required|boolean',
            'team_id' => 'nullable|exists:teams,id',
            'is_captain' => 'nullable|boolean',
        ]);

        $unitId = $validated['unit_id'];
        
        if ($request->filled('team_id')) {
            $team = Team::findOrFail($request->team_id);
            $unitId = $team->unit_id;
        }

        $player = Player::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'tc_id' => $validated['tc_id'],
            'sicil_no' => $validated['sicil_no'],
            'unit_id' => $unitId,
            'is_company_staff' => $validated['is_company_staff'],
            'is_permanent_staff' => $validated['is_permanent_staff'],
            'is_licensed' => $validated['is_licensed'],
            'health_certificate_at' => $validated['health_certificate'] ? now() : null,
        ]);

        if ($request->filled('team_id')) {
            $team = Team::findOrFail($request->team_id);
            $team->players()->syncWithoutDetaching([$player->id]);
            
            if ($request->boolean('is_captain')) {
                $team->update(['captain_id' => $player->id]);
            }
        }

        return redirect()->back()->with('success', 'Personel başarıyla kaydedildi.');
    }

    public function update(Request $request, Player $player)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'tc_id' => ['required', 'string', 'size:11', Rule::unique('players', 'tc_id')->ignore($player->id)],
            'sicil_no' => ['required', 'string', 'max:255', Rule::unique('players', 'sicil_no')->ignore($player->id)],
            'unit_id' => 'required|exists:units,id',
            'is_company_staff' => 'required|boolean',
            'is_permanent_staff' => 'required|boolean',
            'is_licensed' => 'required|boolean',
            'health_certificate' => 'required|boolean',
        ]);

        $player->update([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'tc_id' => $validated['tc_id'],
            'sicil_no' => $validated['sicil_no'],
            'unit_id' => $validated['unit_id'],
            'is_company_staff' => $validated['is_company_staff'],
            'is_permanent_staff' => $validated['is_permanent_staff'],
            'is_licensed' => $validated['is_licensed'],
            'health_certificate_at' => $validated['health_certificate'] ? ($player->health_certificate_at ?: now()) : null,
        ]);

        return redirect()->back()->with('success', 'Personel bilgileri güncellendi.');
    }

    public function destroy(Player $player)
    {
        // Check if player is in a team
        if ($player->teams()->count() > 0) {
            return redirect()->back()->withErrors(['error' => 'Bu personel bir takıma kayıtlı olduğu için silinemez. Önce takımdan çıkarılmalıdır.']);
        }

        $player->delete();
        return redirect()->back()->with('success', 'Personel kaydı silindi.');
    }

    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="personel_taslak.csv"',
        ];

        $callback = function() {
            $file = fopen('php://output', 'w');
            // Adding UTF-8 BOM for Excel compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            fputcsv($file, ['first_name', 'last_name', 'tc_id', 'sicil_no', 'unit_name', 'is_company_staff', 'health_certificate']);
            fputcsv($file, ['Ahmet', 'Yılmaz', '12345678901', 'S12345', 'Muhasebe', '0', '1']);
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt'
        ]);

        $path = $request->file('file')->getRealPath();
        $data = array_map(function($v) { return str_getcsv($v, ';'); }, file($path)); // Try semicolon first (common in TR)
        
        // If semicolon didn't work, try comma
        if (count($data[0]) < 2) {
            $data = array_map('str_getcsv', file($path));
        }

        $header = array_shift($data);
        $count = 0;

        DB::transaction(function () use ($data, &$count) {
            foreach ($data as $row) {
                if (count($row) < 5) continue;

                // Simple mapping based on expected order
                // Ad, Soyad, TC, Sicil, Birim, Firma(1-0), Sağlık(1-0)
                $firstName = $row[0];
                $lastName = $row[1];
                $tcId = $row[2];
                $sicilNo = $row[3];
                $unitName = $row[4];
                $isCompany = $row[5] ?? '0';
                $health = $row[6] ?? '0';

                // Find or create Unit
                $unit = Unit::firstOrCreate(['name' => mb_strtoupper($unitName, 'UTF-8')]);

                Player::updateOrCreate(
                    ['tc_id' => $tcId],
                    [
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                        'sicil_no' => $sicilNo,
                        'unit_id' => $unit->id,
                        'is_company_staff' => (bool)$isCompany,
                        'is_permanent_staff' => !(bool)$isCompany,
                        'health_certificate_at' => (bool)$health ? now() : null,
                    ]
                );
                $count++;
            }
        });

        return redirect()->back()->with('success', "{$count} personel başarıyla aktarıldı.");
    }

    public function toggleHealth(\App\Models\Player $player)
    {
        $player->update([
            'health_certificate_at' => $player->health_certificate_at ? null : now()
        ]);

        return redirect()->back()->with('success', 'Sağlık raporu durumu güncellendi.');
    }
}
