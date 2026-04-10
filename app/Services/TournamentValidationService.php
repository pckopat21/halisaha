<?php

namespace App\Services;

use App\Models\Team;
use App\Models\Player;
use App\Models\Tournament;
use Illuminate\Support\Collection;

class TournamentValidationService
{
    /**
     * Validates a team's roster against all tournament rules.
     * 
     * @param Team $team
     * @param Collection $players
     * @return array
     */
    public function validateTeamRoster(Team $team, Collection $players): array
    {
        $errors = [];
        $tournament = $team->tournament;

        // Rule 1: Team roster size (6-12)
        $count = $players->count();
        if ($count < 6 || $count > 12) {
            $errors[] = "Takım kadrosu en az 6, en fazla 12 kişi olmalıdır. Mevcut: $count";
        }

        // Rule 5: En fazla 5 firma personeli kadroda olabilir. (Kadrolu personel hariç)
        $staffCount = $players->where('is_company_staff', true)->count();
        if ($staffCount > 5) {
            $errors[] = "Takım kadrosunda en fazla 5 FİRMA personeli olabilir. (Mevcut: $staffCount)";
        }

        // Rule 7: Max 2 licensed players
        $licensedCount = $players->where('is_licensed', true)->count();
        if ($licensedCount > 2) {
            $errors[] = "En fazla 2 vizeli lisanslı oyuncu kadroda olabilir. Mevcut: $licensedCount";
        }

        // Rule 9: Captain must be a player in the roster
        if (!$players->pluck('id')->contains($team->captain_id)) {
            $errors[] = "Takım sorumlusu takım oyuncularından biri olmalıdır.";
        }

        foreach ($players as $player) {
            // Rule 10: Player can't be in multiple teams in same tournament
            $otherTeam = Player::find($player->id)->teams()
                ->where('tournament_id', $tournament->id)
                ->where('teams.id', '!=', $team->id)
                ->first();
            
            if ($otherTeam) {
                $errors[] = "{$player->first_name} {$player->last_name} zaten başka bir takımda ({$otherTeam->name}) yer alıyor.";
            }

            // Rule 11: If their own unit has a team, they must play for it
            $unitTeam = Team::where('tournament_id', $tournament->id)
                ->where('unit_id', $player->unit_id)
                ->first();
            
            if ($unitTeam && $team->unit_id !== $player->unit_id && !$team->has_exception) {
                $errors[] = "{$player->first_name} {$player->last_name} kendi birimi turnuvaya katıldığı için başka takımda oynayamaz (İstisna tanımlanmamış).";
            }

            // Rule 13: Different unit personnel check
            if ($player->unit_id !== $team->unit_id && !$team->has_exception) {
                // Technically Rule 13 is a "reason for disqualification", but we can block it at the roster level if no exception.
                $errors[] = "{$player->first_name} {$player->last_name} farklı bir birimde görev yapıyor. İstisna tanımlanmadan kadroya eklenemez.";
            }
            
            // Rule 14: Health certificate check
            if (!$player->health_certificate_at) {
                $errors[] = "{$player->first_name} {$player->last_name} için sağlık belgesi tanımlanmamış.";
            }
        }

        return [
            'is_valid' => empty($errors) || $team->has_exception,
            'errors' => $errors,
            'warnings' => $this->getWarnings($team, $players)
        ];
    }

    private function getWarnings(Team $team, Collection $players): array
    {
        $warnings = [];
        // Add rule 13 warning if needed
        foreach ($players as $player) {
            if ($player->unit_id !== $team->unit_id) {
                $warnings[] = "DİKKAT: {$player->first_name} {$player->last_name} farklı bir birimde görev yapıyor. İhraç sebebi olabilir.";
            }
        }
        return $warnings;
    }

    /**
     * Rule 6 & 8: Validates if a pitch line-up is valid.
     */
    public function validatePitchLineup(Collection $onPitchPlayers): array
    {
        $errors = [];

        // Rule 6: Max 3 company staff on pitch
        $staffOnPitch = $onPitchPlayers->where('is_company_staff', true)->count();
        if ($staffOnPitch > 3) {
            $errors[] = "Aynı anda sahada en fazla 3 firma personeli olabilir.";
        }

        // Rule 8: Max 1 licensed player on pitch
        $licensedOnPitch = $onPitchPlayers->where('is_licensed', true)->count();
        if ($licensedOnPitch > 1) {
            $errors[] = "Aynı anda sahada en fazla 1 lisanslı oyuncu olabilir.";
        }

        return [
            'is_valid' => empty($errors),
            'errors' => $errors
        ];
    }
}
