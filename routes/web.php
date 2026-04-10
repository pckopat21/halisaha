<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TournamentController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\PlayerSearchController;

Route::get('/', function () {
    $activeTournament = \App\Models\Tournament::where('status', 'registration')->first() 
                        ?? \App\Models\Tournament::latest()->first();
    
    $approvedTeams = \App\Models\Team::where('status', 'approved')
                        ->with(['unit', 'players', 'captain'])
                        ->latest()
                        ->get();

    return Inertia::render('welcome', [
        'activeTournament' => $activeTournament,
        'approvedTeams' => $approvedTeams,
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('home');

// Public Routes (Visitors)
Route::get('tournaments', [TournamentController::class, 'index'])->name('tournaments.index');
Route::get('tournaments/{tournament}', [TournamentController::class, 'show'])->name('tournaments.show');
Route::get('teams', [TeamController::class, 'index'])->name('teams.index');
Route::get('teams/{team}', [TeamController::class, 'show'])->name('teams.show');
Route::get('games', [GameController::class, 'index'])->name('games.index');
Route::get('games/{game}', [GameController::class, 'show'])->name('games.show');
Route::get('api/players/search', [PlayerSearchController::class, 'search'])->name('api.players.search');

// Protected Routes
Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Tournament Management
    Route::post('tournaments', [TournamentController::class, 'store'])->name('tournaments.store');
    Route::post('tournaments/{tournament}/draw', [TournamentController::class, 'draw'])->name('tournaments.draw');
    
    // Team Management
    Route::post('teams', [TeamController::class, 'store'])->name('teams.store');
    Route::post('teams/{team}/approve', [TeamController::class, 'approve'])->name('teams.approve');
    Route::post('teams/{team}/reject', [TeamController::class, 'reject'])->name('teams.reject');
    Route::post('teams/{team}/captain/{player}', [TeamController::class, 'setCaptain'])->name('teams.set-captain');
    Route::post('teams/{team}/players', [TeamController::class, 'addPlayer'])->name('teams.players.add');
    Route::delete('teams/{team}/players/{player}', [TeamController::class, 'removePlayer'])->name('teams.players.remove');

    Route::post('players/{player}/toggle-health', [PlayerController::class, 'toggleHealth'])->name('players.toggle-health');
    
    // Game Management
    Route::post('games/{game}/event', [GameController::class, 'logEvent'])->name('games.event');
    Route::delete('games/{game}/events/{event}', [GameController::class, 'destroyEvent'])->name('games.events.destroy');
    Route::post('games/{game}/penalty', [GameController::class, 'logPenalty'])->name('games.penalty');
    Route::post('games/{game}/quick-result', [GameController::class, 'updateQuickResult'])->name('games.quick-result');
    Route::post('games/{game}/complete', [GameController::class, 'complete'])->name('games.complete');

    // User Management (Admin only)
    Route::get('users', [DashboardController::class, 'users'])->name('users.index');
    Route::post('users/{user}/role', [DashboardController::class, 'updateRole'])->name('users.role');

    Route::get('players/template', [PlayerController::class, 'downloadTemplate'])->name('players.template');
    Route::post('players/import', [PlayerController::class, 'import'])->name('players.import');
    Route::resource('players', PlayerController::class);
    Route::resource('units', UnitController::class);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
