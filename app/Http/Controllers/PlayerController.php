<?php

namespace App\Http\Controllers;

use App\Models\Player;
use App\Services\StatsService;
use Inertia\Inertia;

class PlayerController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $query = Player::with(['unit', 'teams.tournament'])->latest();

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('tc_id', 'like', "%{$search}%")
                  ->orWhere('sicil_no', 'like', "%{$search}%");
            });
        }

        return Inertia::render('players/index', [
            'players' => $query->paginate(15)->withQueryString(),
            'units' => \App\Models\Unit::all(),
            'filters' => $request->only(['search'])
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
        ]);

        if ($request->has('health_certificate') && $request->health_certificate) {
            $validated['health_certificate_at'] = now();
        }

        Player::create($validated);

        return redirect()->back()->with('success', 'Personel başarıyla kaydedildi.');
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
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=personel_taslak.csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['Ad', 'Soyad', 'TC_NO', 'Sicil_NO', 'Birim_ID', 'Firma_Personeli(0/1)', 'Lisansli(0/1)'];

        $callback = function() use($columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function import(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt'
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), "r");
        
        // Skip header
        fgetcsv($handle);

        $count = 0;
        while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
            if (count($data) >= 5) {
                Player::updateOrCreate(
                    ['tc_id' => $data[2]],
                    [
                        'first_name' => $data[0],
                        'last_name' => $data[1],
                        'sicil_no' => $data[3],
                        'unit_id' => $data[4],
                        'is_company_staff' => isset($data[5]) ? (bool)$data[5] : false,
                        'is_permanent_staff' => isset($data[5]) ? !(bool)$data[5] : true,
                        'is_licensed' => isset($data[6]) ? (bool)$data[6] : false,
                    ]
                );
                $count++;
            }
        }
        fclose($handle);

        return redirect()->back()->with('success', "$count personel başarıyla aktarıldı.");
    }
}
