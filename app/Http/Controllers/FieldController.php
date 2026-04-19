<?php

namespace App\Http\Controllers;
 
 use App\Models\Field;
 use Illuminate\Http\Request;
 use Inertia\Inertia;
 
 class FieldController extends Controller
 {
     public function index()
     {
         return Inertia::render('fields/index', [
             'fields' => Field::latest()->get()
         ]);
     }
 
     public function store(Request $request)
     {
         $validated = $request->validate([
             'name' => 'required|string|max:255',
             'location' => 'nullable|string|max:255',
             'description' => 'nullable|string',
         ]);
 
         Field::create($validated);
 
         return back()->with('success', 'Saha başarıyla oluşturuldu.');
     }
 
     public function update(Request $request, Field $field)
     {
         $validated = $request->validate([
             'name' => 'required|string|max:255',
             'location' => 'nullable|string|max:255',
             'description' => 'nullable|string',
             'is_active' => 'boolean'
         ]);
 
         $field->update($validated);
 
         return back()->with('success', 'Saha bilgileri güncellendi.');
     }
 
     public function destroy(Field $field)
     {
         // Check if games are assigned
         if ($field->games()->exists()) {
             return back()->with('error', 'Bu sahaya atanmış maçlar bulunduğu için silinemez. Önce maçları başka bir sahaya taşıyın.');
         }
 
         $field->delete();
 
         return back()->with('success', 'Saha başarıyla silindi.');
     }
 }
