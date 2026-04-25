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
use App\Http\Controllers\StatisticsController;
use App\Http\Controllers\FieldController;

Route::get('/', function (\App\Services\StatsService $statsService) {
    $activeTournament = \App\Models\Tournament::whereIn('status', ['active', 'registration'])
        ->with(['champion.unit'])
        ->latest()
        ->first()
        ?? \App\Models\Tournament::with(['champion.unit'])->latest()->first();

    $approvedTeams = \App\Models\Team::where('status', 'approved')
        ->with(['unit', 'players', 'captain'])
        ->latest()
        ->get();

    $groupStandings = [];
    $groupFixtures = [];
    $homepageStats = null;

    if ($activeTournament) {
        $groupStandings = $activeTournament->groups()->with(['standings.team'])->get()->map(function($group) {
            return [
                'name' => $group->name,
                'advance_count' => $group->advance_count,
                'rows' => $group->standings->sortByDesc('points')->values()->map(function($standing) {
                    return [
                        'team' => ['name' => $standing->team->name],
                        'played' => $standing->played,
                        'won' => $standing->won,
                        'drawn' => $standing->drawn,
                        'lost' => $standing->lost,
                        'goals_for' => $standing->goals_for,
                        'goals_against' => $standing->goals_against,
                        'goal_difference' => $standing->goal_difference,
                        'points' => $standing->points,
                    ];
                })
            ];
        });

        $groupFixtures = \App\Models\Game::where('tournament_id', $activeTournament->id)
            ->with(['homeTeam', 'awayTeam', 'field', 'group'])
            ->orderBy('scheduled_at', 'desc')
            ->limit(12)
            ->get()
            ->map(function($game) {
                return [
                    'group' => $game->group?->name ?? 'Eleme',
                    'home_team' => $game->homeTeam->name,
                    'away_team' => $game->awayTeam->name,
                    'scheduled_at' => $game->scheduled_at ? $game->scheduled_at->toDateTimeString() : null,
                    'status' => $game->status,
                    'home_score' => $game->home_score,
                    'away_score' => $game->away_score,
                    'field' => $game->field?->name,
                ];
            });

        $nextMatch = \App\Models\Game::where('status', 'planned')
            ->where('scheduled_at', '>=', now())
            ->with(['homeTeam', 'awayTeam', 'field'])
            ->orderBy('scheduled_at', 'asc')
            ->first();

        $homepageStats = [
            'summary' => $statsService->getTournamentSummary($activeTournament),
            'topScorers' => $statsService->getTopScorers($activeTournament, 5)->map(function($p) {
                return ['name' => $p->first_name . ' ' . $p->last_name, 'goals' => $p->goals_count];
            }),
            'topAssists' => $statsService->getTopAssists($activeTournament, 5)->map(function($p) {
                return ['name' => $p->first_name . ' ' . $p->last_name, 'assists' => $p->assists_count];
            })
        ];
    }

    return Inertia::render('welcome', [
        'activeTournament' => $activeTournament,
        'approvedTeams' => $approvedTeams,
        'groupStandings' => $groupStandings,
        'groupFixtures' => $groupFixtures,
        'homepageStats' => $homepageStats,
        'totalStats' => [
            'approvedTeams' => \App\Models\Team::where('status', 'approved')->count(),
            'activePlayers' => \App\Models\Player::whereHas('teams', function($q) { $q->where('status', 'approved'); })->count(),
            'totalMatches' => $activeTournament ? \App\Models\Game::where('tournament_id', $activeTournament->id)->count() : 0,
        ],
        'nextMatch' => $nextMatch ? [
            'home_team' => $nextMatch->homeTeam->name,
            'away_team' => $nextMatch->awayTeam->name,
            'scheduled_at' => $nextMatch->scheduled_at->toDateTimeString(),
            'field' => $nextMatch->field?->name,
        ] : null,
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('home');

// web.php içindeki /install-db rotasının DÜZELTİLMİŞ hali
Route::get('/install-db', function () {
    try {
        // Tablo var mı yok mu diye Schema üzerinden güvenli kontrol (Hata vermez)
        $tableExists = \Illuminate\Support\Facades\Schema::hasTable('users');

        if ($tableExists) {
            // Eğer tablo Varsa ve içinde kullanıcı varsa yetki kontrolü yap
            if (\App\Models\User::count() > 0) {
                if (!auth()->check() || !auth()->user()->isSuperAdmin()) {
                    abort(403, 'Sadece sistem yöneticisi bu işlemi yapabilir.');
                }
            }
        }

        // Tablo yoksa veya yetki tamamsa kuruluma başla
        \Illuminate\Support\Facades\Artisan::call('migrate:fresh', ['--seed' => true, '--force' => true]);
        return "Veritabanı başarıyla kuruldu ve örnek veriler yüklendi! Lütfen şimdi ana sayfaya gidin.";
    } catch (\Exception $e) {
        return "Kurulum sırasında hata oluştu: " . $e->getMessage();
    }
});

// Public Routes (Visitors)
Route::get('tournaments', [TournamentController::class, 'index'])->name('tournaments.index');
Route::get('tournaments/{tournament}', [TournamentController::class, 'show'])->name('tournaments.show');
Route::get('teams', [TeamController::class, 'index'])->name('teams.index');
Route::get('teams/{team}', [TeamController::class, 'show'])->name('teams.show');
Route::get('games', [GameController::class, 'index'])->name('games.index');
Route::get('games/{game}', [GameController::class, 'show'])->name('games.show');
Route::get('api/players/search', [PlayerSearchController::class, 'search'])->name('api.players.search');
Route::get('statistics', [StatisticsController::class, 'index'])->name('statistics.index');

// Protected Routes
Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Tournament Management
    Route::post('tournaments', [TournamentController::class, 'store'])->name('tournaments.store');
    Route::post('tournaments/{tournament}/draw', [TournamentController::class, 'draw'])->name('tournaments.draw');
    Route::post('/tournaments/{tournament}/start-knockout', [TournamentController::class, 'startKnockout'])->name('tournaments.start-knockout');
    Route::post('/tournaments/{tournament}/advance-round', [TournamentController::class, 'advanceRound'])->name('tournaments.advance-round');
    Route::post('/tournaments/{tournament}/third-place', [TournamentController::class, 'createThirdPlaceMatch'])->name('tournaments.third-place');
    Route::post('/tournaments/{tournament}/complete', [TournamentController::class, 'complete'])->name('tournaments.complete');
    Route::post('/tournaments/{tournament}/reset', [TournamentController::class, 'reset'])->name('tournaments.reset');
    Route::post('/tournaments/{tournament}/settings', [TournamentController::class, 'updateSettings'])->name('tournaments.update-settings');

    // Team Management
    Route::post('teams', [TeamController::class, 'store'])->name('teams.store');
    Route::get('teams/{team}', [TeamController::class, 'show'])->name('teams.show');

    // Player Management
    Route::get('players/template', [PlayerController::class, 'downloadTemplate'])->name('players.template');
    Route::post('players/import', [PlayerController::class, 'import'])->name('players.import');
    Route::resource('players', PlayerController::class);
    
    Route::post('teams/{team}/approve', [TeamController::class, 'approve'])->name('teams.approve');
    Route::post('teams/{team}/reject', [TeamController::class, 'reject'])->name('teams.reject');
    Route::post('teams/{team}/captain/{player}', [TeamController::class, 'setCaptain'])->name('teams.set-captain');
    Route::post('teams/{team}/players', [TeamController::class, 'addPlayer'])->name('teams.players.add');
    Route::delete('teams/{team}/players/{player}', [TeamController::class, 'removePlayer'])->name('teams.players.remove');

    Route::post('players/{player}/toggle-health', [PlayerController::class, 'toggleHealth'])->name('players.toggle-health');

    // Game Management
    Route::post('games/{game}/event', [GameController::class, 'logEvent'])->name('games.event');
    Route::post('games/{game}/roster', [GameController::class, 'updateRoster'])->name('games.roster.update');
    Route::delete('games/{game}/events/{event}', [GameController::class, 'destroyEvent'])->name('games.events.destroy');
    Route::post('games/{game}/penalty', [GameController::class, 'logPenalty'])->name('games.penalty');
    Route::post('games/{game}/quick-result', [GameController::class, 'updateQuickResult'])->name('games.quick-result');
    Route::post('games/{game}/complete', [GameController::class, 'complete'])->name('games.complete');
    Route::post('games/{game}/reopen', [GameController::class, 'reopen'])->name('games.reopen');

    // User Management (Admin only)
    Route::get('users', [DashboardController::class, 'users'])->name('users.index');
    Route::post('users/{user}/role', [DashboardController::class, 'updateRole'])->name('users.role');

    Route::resource('units', UnitController::class);

    // Field Management
    Route::resource('fields', FieldController::class);
    Route::post('games/{game}/assign-field', [GameController::class, 'assignField'])->name('games.assign-field');

    // Tournament Reports (PDF)
    Route::get('/reports/standings/{tournament}', [App\Http\Controllers\ReportController::class, 'standings'])->name('reports.standings');
    Route::get('/reports/fixture/{tournament}', [App\Http\Controllers\ReportController::class, 'fixture'])->name('reports.fixture');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
