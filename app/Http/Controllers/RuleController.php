<?php

namespace App\Http\Controllers;

use App\Models\Rule;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RuleController extends Controller
{
    public function index()
    {
        $rules = Rule::orderBy('sort_order')->get();
        return Inertia::render('rules/index', [
            'rules' => $rules
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'sort_order' => 'integer|min:0',
            'is_active' => 'boolean'
        ]);

        Rule::create($validated);
        return back()->with('success', 'Kural başarıyla eklendi.');
    }

    public function update(Request $request, Rule $rule)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'sort_order' => 'integer|min:0',
            'is_active' => 'boolean'
        ]);

        $rule->update($validated);
        return back()->with('success', 'Kural başarıyla güncellendi.');
    }

    public function destroy(Rule $rule)
    {
        $rule->delete();
        return back()->with('success', 'Kural silindi.');
    }

    public function toggle(Rule $rule)
    {
        $rule->update(['is_active' => !$rule->is_active]);
        return back()->with('success', 'Kural durumu değiştirildi.');
    }
}
