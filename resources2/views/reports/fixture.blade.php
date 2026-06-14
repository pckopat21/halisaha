<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #003366; padding-bottom: 10px; margin-bottom: 20px; }
        .logo-placeholder { font-size: 24px; font-weight: bold; color: #003366; text-transform: uppercase; }
        .title { font-size: 18px; font-weight: bold; margin: 10px 0; color: #003366; }
        .tournament-name { font-size: 14px; color: #FF8C00; margin-bottom: 5px; font-weight: bold; }
        .date { font-size: 10px; color: #666; text-align: right; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background-color: #003366; color: white; padding: 8px; text-align: center; text-transform: uppercase; font-size: 10px; }
        td { border: 1px solid #ddd; padding: 10px; text-align: center; }
        
        .date-header { background-color: #FF8C00; color: white; padding: 10px; font-weight: bold; text-transform: uppercase; margin-top: 30px; margin-bottom: 10px; border-radius: 5px; }
        
        .vs-cell { font-weight: bold; color: #666; font-size: 10px; }
        .team-box { width: 45%; display: inline-block; vertical-align: middle; }
        .team-name { font-size: 13px; font-weight: bold; color: #003366; }
        .unit-name { font-size: 9px; color: #666; font-weight: normal; }
        .time-badge { background-color: #f0f7ff; border: 1px solid #cce5ff; padding: 5px 10px; border-radius: 5px; font-weight: bold; font-size: 14px; color: #003366; }
        
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 9px; color: #999; border-top: 1px solid #eee; padding-top: 5px; }
        .watermark { position: fixed; top: 40%; left: 10%; font-size: 60px; color: rgba(0, 51, 102, 0.05); transform: rotate(-45deg); z-index: -1000; text-transform: uppercase; }
        
        .page-break { page-break-after: always; }
    </style>
</head>
<body>
    <div class="watermark">KARAYOLLARI GENEL MÜDÜRLÜĞÜ</div>
    
    <div class="date">Oluşturulma Tarihi: {{ $date }}</div>
    
    <div class="header">
        <div class="logo-placeholder">KARAYOLLARI GENEL MÜDÜRLÜĞÜ</div>
        <div class="tournament-name">{{ $tournament->name }} ({{ $tournament->year }})</div>
        <div class="title">{{ $title }}</div>
    </div>

    @foreach($games_by_date as $dateStr => $games)
        <div class="date-header">{{ $dateStr }} {{ \Carbon\Carbon::parse($dateStr)->locale('tr')->dayName }}</div>
        <table>
            <thead>
                <tr>
                    <th width="15%">SAAT</th>
                    <th width="35%">EV SAHİBİ</th>
                    <th width="15%">SKOR</th>
                    <th width="35%">MİSAFİR</th>
                </tr>
            </thead>
            <tbody>
                @foreach($games as $game)
                    <tr>
                        <td>
                            <div class="time-badge">{{ \Carbon\Carbon::parse($game->scheduled_at)->format('H:i') }}</div>
                        </td>
                        <td>
                            <div class="team-name">{{ $game->homeTeam->name }}</div>
                            <div class="unit-name">{{ $game->homeTeam->unit->name }}</div>
                        </td>
                        <td>
                            @if($game->status === 'completed')
                                <div style="font-size: 18px; font-weight: bold; color: #003366;">
                                    {{ $game->home_score }} - {{ $game->away_score }}
                                </div>
                            @else
                                <div style="font-size: 12px; font-weight: bold; color: #999;">VS</div>
                            @endif
                        </td>
                        <td>
                            <div class="team-name">{{ $game->awayTeam->name }}</div>
                            <div class="unit-name">{{ $game->awayTeam->unit->name }}</div>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endforeach

    <div class="footer">
        Bu belge sistem tarafından otomatik olarak oluşturulmuştur. &copy; {{ date('Y') }} KGM Halı Saha Turnuva Yönetimi
    </div>
</body>
</html>
