<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class PlayerTemplateExport implements FromCollection, WithHeadings, WithTitle, ShouldAutoSize
{
    public function collection()
    {
        // Return empty collection, we only need headings
        return collect([]);
    }

    public function headings(): array
    {
        return [
            'Ad',
            'Soyad',
            'TC_NO',
            'Sicil_No',
            'Birim_ID',
            'Forma_No',
            'Firma_Personeli(1=Evet/0=Hayir)',
            'Lisansli(1=Evet/0=Hayir)'
        ];
    }

    public function title(): string
    {
        return 'Personel Kayit Taslagi';
    }
}
