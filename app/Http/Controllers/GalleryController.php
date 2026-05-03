<?php

namespace App\Http\Controllers;

use App\Models\Tournament;
use App\Models\Gallery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class GalleryController extends Controller
{
    public function index(Request $request)
    {
        $tournaments = Tournament::latest()->get();
        $selectedTournamentId = $request->query('tournament_id') ?? $tournaments->first()?->id;

        $selectedTournament = $selectedTournamentId 
            ? Tournament::with('galleries')->find($selectedTournamentId)
            : null;

        return Inertia::render('gallery/index', [
            'tournaments' => $tournaments,
            'selectedTournament' => $selectedTournament,
            'galleries' => $selectedTournament 
                ? $selectedTournament->galleries()
                    ->orderBy('sort_order', 'asc')
                    ->get()
                    ->map(fn($g) => [
                        'id' => $g->id,
                        'image_path' => $g->image_path,
                        'image_url' => asset('storage/' . $g->image_path),
                        'title' => $g->title,
                        'is_active' => $g->is_active,
                        'sort_order' => $g->sort_order
                    ]) 
                : []
        ]);
    }

    public function store(Request $request, Tournament $tournament)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
            'title' => 'nullable|string|max:255',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('tournaments/' . $tournament->id . '/gallery', 'public');

            Gallery::create([
                'tournament_id' => $tournament->id,
                'image_path' => $path,
                'title' => $request->title,
                'is_active' => true,
                'sort_order' => $tournament->galleries()->count() + 1,
            ]);

            return back()->with('success', 'Fotoğraf başarıyla yüklendi.');
        }

        return back()->with('error', 'Dosya yüklenirken bir hata oluştu.');
    }

    public function destroy(Gallery $gallery)
    {
        Storage::disk('public')->delete($gallery->image_path);
        $gallery->delete();

        return back()->with('success', 'Fotoğraf başarıyla silindi.');
    }

    public function toggle(Gallery $gallery)
    {
        $gallery->update([
            'is_active' => !$gallery->is_active
        ]);

        return back()->with('success', 'Görünürlük durumu güncellendi.');
    }
}
