<?php

namespace App\Imports;

use App\Models\Player;
use App\Models\Unit;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\Importable;

class PlayerImport implements ToModel, WithHeadingRow
{
    use Importable;

    public function model(array $row)
    {
        // Skip if mandatory fields are missing
        if (empty($row['ad']) || empty($row['soyad']) || empty($row['tc_no'])) {
            return null;
        }

        $tc_id = trim($row['tc_no']);
        
        // Skip invalid TC
        if (strlen($tc_id) !== 11) {
            return null;
        }

        $unit_id = !empty($row['birim_id']) ? (int)$row['birim_id'] : null;

        // Duplicate Check: updateOrCreate uses tc_id to find existing record
        return Player::updateOrCreate(
            ['tc_id' => $tc_id],
            [
                'first_name' => trim($row['ad']),
                'last_name' => trim($row['soyad']),
                'jersey_number' => !empty($row['forma_no']) ? (int)$row['forma_no'] : null,
                'sicil_no' => isset($row['sicil_no']) ? trim($row['sicil_no']) : null,
                'unit_id' => $unit_id,
                'is_company_staff' => isset($row['firma_personeli1evet0hayir']) ? (bool)$row['firma_personeli1evet0hayir'] : false,
                'is_permanent_staff' => isset($row['firma_personeli1evet0hayir']) ? !(bool)$row['firma_personeli1evet0hayir'] : true,
                'is_licensed' => isset($row['lisansli1evet0hayir']) ? (bool)$row['lisansli1evet0hayir'] : false,
            ]
        );
    }
}
