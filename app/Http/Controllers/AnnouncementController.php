<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index()
    {
        return Inertia::render('announcements/index', [
            'announcements' => Announcement::orderBy('sort_order', 'asc')->orderBy('created_at', 'desc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|string|in:info,success,warning,danger',
            'is_active' => 'required|boolean',
            'published_at' => 'nullable|date',
        ]);

        Announcement::create($validated);

        return redirect()->back()->with('success', 'Duyuru başarıyla oluşturuldu.');
    }

    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|string|in:info,success,warning,danger',
            'is_active' => 'required|boolean',
            'published_at' => 'nullable|date',
        ]);

        $announcement->update($validated);

        return redirect()->back()->with('success', 'Duyuru başarıyla güncellendi.');
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();
        return redirect()->back()->with('success', 'Duyuru silindi.');
    }

    public function toggle(Announcement $announcement)
    {
        $announcement->update(['is_active' => !$announcement->is_active]);
        return redirect()->back()->with('success', 'Duyuru durumu güncellendi.');
    }
}
