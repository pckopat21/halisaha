<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class RegionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        if (!auth()->user()->isSuperAdmin()) abort(403);
        $regions = \App\Models\Region::all();
        return \Inertia\Inertia::render('regions/index', ['regions' => $regions]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (!auth()->user()->isSuperAdmin()) abort(403);
        $request->validate(['name' => 'required|string|max:255|unique:regions,name']);
        \App\Models\Region::create(['name' => $request->name]);
        return back()->with('success', 'Bölge başarıyla eklendi.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        if (!auth()->user()->isSuperAdmin()) abort(403);
        $region = \App\Models\Region::findOrFail($id);
        $request->validate(['name' => 'required|string|max:255|unique:regions,name,' . $region->id]);
        $region->update(['name' => $request->name]);
        return back()->with('success', 'Bölge başarıyla güncellendi.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        if (!auth()->user()->isSuperAdmin()) abort(403);
        $region = \App\Models\Region::findOrFail($id);
        $region->delete();
        return back()->with('success', 'Bölge başarıyla silindi.');
    }
}
