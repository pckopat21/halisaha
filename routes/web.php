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

use App\Http\Controllers\HomeController;
use App\Http\Controllers\PredictionController;
use App\Http\Controllers\GalleryController;

Route::get('/', [HomeController::class, 'index'])->name('home');




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

// Predictions (Accessible by guests for voting)
Route::post('predictions', [PredictionController::class, 'store'])->name('predictions.store');
Route::get('predictions/{game}/analyze', [PredictionController::class, 'analyze'])->name('predictions.analyze');
Route::get('predictions/user/{user}', [PredictionController::class, 'userPredictions'])->name('predictions.user');

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

    // Gallery Management
    Route::get('gallery', [GalleryController::class, 'index'])->name('gallery.index');
    Route::post('tournaments/{tournament}/gallery', [GalleryController::class, 'store'])->name('tournaments.gallery.store');
    Route::delete('gallery/{gallery}', [GalleryController::class, 'destroy'])->name('gallery.destroy');
    Route::patch('gallery/{gallery}/toggle', [GalleryController::class, 'toggle'])->name('gallery.toggle');

    // Announcement Management
    Route::get('announcements', [App\Http\Controllers\AnnouncementController::class, 'index'])->name('announcements.index');
    Route::post('announcements', [App\Http\Controllers\AnnouncementController::class, 'store'])->name('announcements.store');
    Route::patch('announcements/{announcement}', [App\Http\Controllers\AnnouncementController::class, 'update'])->name('announcements.update');
    Route::delete('announcements/{announcement}', [App\Http\Controllers\AnnouncementController::class, 'destroy'])->name('announcements.destroy');
    Route::patch('announcements/{announcement}/toggle', [App\Http\Controllers\AnnouncementController::class, 'toggle'])->name('announcements.toggle');

    // Storage Link Fix (Temporary Utility)
    Route::get('fix-storage', function() {
        if (file_exists(public_path('storage'))) {
            // Check if it's a link or a directory
            if (is_link(public_path('storage'))) {
                return "Storage link already exists and is a symlink.";
            }
            // If it's a directory, we need to remove it (BE CAREFUL - this is why we ask)
            return "A physical 'storage' folder exists in public/. Please delete it via FTP first, then visit this page again to create the symlink.";
        }
        
        try {
            \Illuminate\Support\Facades\Artisan::call('storage:link');
            return "Storage link created successfully!";
        } catch (\Exception $e) {
            return "Error creating storage link: " + $e->getMessage();
        }
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
