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
    public function validateTeamRoster(Team $team, Collection $players, bool $checkFullCompliance = true): array
    {
        $errors = [];
        $tournament = $team->tournament;

        $settings = $tournament->settings;

        // --- ALWAYS BLOCK RULES (Hard constraints for adding players) ---

        // Rule: Team maximum roster size
        $maxSize = $settings['max_roster_size'] ?? 12;
        $count = $players->count();
        if ($count > $maxSize) {
            $errors[] = "Takım kadrosu en fazla $maxSize kişi olmalıdır. Mevcut: $count";
        }

        // Rule: Company personnel limit
        $maxStaff = $settings['max_company_players'] ?? 5;
        $staffCount = $players->where('is_company_staff', true)->count();
        if ($staffCount > $maxStaff) {
            $errors[] = "Takım kadrosunda en fazla $maxStaff FİRMA personeli olabilir. (Mevcut: $staffCount)";
        }

        // Rule: Licensed players limit
        $maxLicensed = $settings['max_licensed_players'] ?? 2;
        $licensedCount = $players->where('is_licensed', true)->count();
        if ($licensedCount > $maxLicensed) {
            $errors[] = "En fazla $maxLicensed vizeli lisanslı oyuncu kadroda olabilir. Mevcut: $licensedCount";
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
        }

        // --- FINAL APPROVAL RULES (Only block if $checkFullCompliance is true) ---

        if ($checkFullCompliance) {
            // Rule 1: Minimum roster size
            $minSize = $settings['min_roster_size'] ?? 6;
            if ($count < $minSize) {
                $errors[] = "Takım kadrosu en az $minSize kişi olmalıdır. Mevcut: $count";
            }

            // Rule 9: Captain must be in the roster
            if (!$team->captain_id || !$players->pluck('id')->contains($team->captain_id)) {
                $errors[] = "Takım sorumlusu atanmalı ve takım oyuncularından biri olmalıdır.";
            }

            foreach ($players as $player) {
                // Rule 11 & 13: Unit adherence
                if ($player->unit_id !== $team->unit_id && !$team->has_exception) {
                    $errors[] = "{$player->first_name} {$player->last_name} farklı bir birimde görev yapıyor. İstisna tanımlanmadan onay verilemez.";
                }

                // Rule 14: Health certificate check
                if (!$player->health_certificate_at) {
                    $errors[] = "{$player->first_name} {$player->last_name} için sağlık belgesi tanımlanmamış.";
                }
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
    public function validatePitchLineup(Collection $onPitchPlayers, array $settings): array
    {
        $errors = [];

        // Rule: Max company staff on pitch
        $maxStaffOnPitch = $settings['max_company_on_pitch'] ?? 3;
        $staffOnPitch = $onPitchPlayers->where('is_company_staff', true)->count();
        if ($staffOnPitch > $maxStaffOnPitch) {
            $errors[] = "Aynı anda sahada en fazla $maxStaffOnPitch firma personeli olabilir.";
        }

        // Rule: Max licensed player on pitch
        $maxLicensedOnPitch = $settings['max_licensed_on_pitch'] ?? 1;
        $licensedOnPitch = $onPitchPlayers->where('is_licensed', true)->count();
        if ($licensedOnPitch > $maxLicensedOnPitch) {
            $errors[] = "Aynı anda sahada en fazla $maxLicensedOnPitch lisanslı oyuncu olabilir.";
        }

        return [
            'is_valid' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * Validates a game-specific lineup (GameRoster).
     */
    public function validateGameRoster(\App\Models\Game $game, Collection $startingPlayers, int $totalRosterCount): array
    {
        $errors = [];
        $settings = $game->tournament->settings;

        // Rule: Max starting players
        $maxOnPitch = $settings['total_players_on_pitch'] ?? 7;
        if ($startingPlayers->count() > $maxOnPitch) {
            $errors[] = "İlk kadro en fazla $maxOnPitch kişi olabilir.";
        }

        // Use validatePitchLineup for standard pitch limits (licensed/company)
        $pitchValidation = $this->validatePitchLineup($startingPlayers, $settings);
        if (!$pitchValidation['is_valid']) {
            $errors = array_merge($errors, $pitchValidation['errors']);
        }

        // Rule: Total roster size (starting + subs)
        $maxRoster = $settings['max_roster_size'] ?? 12;
        if ($totalRosterCount > $maxRoster) {
            $errors[] = "Maç kadrosu (as + yedek) en fazla $maxRoster kişi olabilir.";
        }

        return [
            'is_valid' => empty($errors),
            'errors' => $errors
        ];
    }
}
