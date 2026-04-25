<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Game;
use Carbon\Carbon;

$games = Game::where('status', 'playing')->get();
echo "Now: " . now() . " (" . now()->timezoneName . ")\n";
foreach($games as $g) {
    echo "ID: " . $g->id . " | Started At: " . ($g->started_at ?? 'NULL') . " | Diff: " . ($g->started_at ? now()->diffInMinutes($g->started_at, false) : 'N/A') . "\n";
}
