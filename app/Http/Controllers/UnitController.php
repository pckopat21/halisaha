<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Illuminate\Support\Str;

class UnitController extends Controller
{
    public function index()
    {
        Gate::authorize('viewAny', Unit::class);

        return Inertia::render('units/index', [
            'units' => Unit::withCount(['teams', 'players'])
                ->with(['teams:id,name,unit_id', 'players:id,first_name,last_name,unit_id'])
                ->latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create', Unit::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:units,name',
        ]);

        Unit::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        return redirect()->back()->with('success', 'Birim başarıyla oluşturuldu.');
    }

    public function update(Request $request, Unit $unit)
    {
        Gate::authorize('update', $unit);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:units,name,' . $unit->id,
        ]);

        $unit->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        return redirect()->back()->with('success', 'Birim başarıyla güncellendi.');
    }

    public function destroy(Unit $unit)
    {
        Gate::authorize('delete', $unit);

        if ($unit->teams()->count() > 0 || $unit->players()->count() > 0) {
            return redirect()->back()->withErrors(['error' => 'Bu birime bağlı takımlar veya oyuncular olduğu için silinemez.']);
        }

        $unit->delete();

        return redirect()->back()->with('success', 'Birim başarıyla silindi.');
    }
}
