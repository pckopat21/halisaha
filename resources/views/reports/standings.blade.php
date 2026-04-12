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
        td { border: 1px solid #ddd; padding: 8px; text-align: center; }
        .team-name { text-align: left; font-weight: bold; }
        .group-header { background-color: #f8f9fa; border: 1px solid #ddd; padding: 10px; font-weight: bold; text-transform: uppercase; color: #003366; margin-top: 20px; }
        
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 9px; color: #999; border-top: 1px solid #eee; padding-top: 5px; }
        .watermark { position: fixed; top: 40%; left: 10%; font-size: 60px; color: rgba(0, 51, 102, 0.05); transform: rotate(-45deg); z-index: -1000; text-transform: uppercase; }
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

    @foreach($standings as $groupName => $groupStandings)
        <div class="group-header">{{ $groupName }} GRUBU</div>
        <table>
            <thead>
                <tr>
                    <th width="5%">SIRA</th>
                    <th width="35%">TAKIM / BİRİM</th>
                    <th width="8%">O</th>
                    <th width="8%">G</th>
                    <th width="8%">B</th>
                    <th width="8%">M</th>
                    <th width="8%">AV</th>
                    <th width="10%">PUAN</th>
                </tr>
            </thead>
            <tbody>
                @foreach($groupStandings as $index => $standing)
                    <tr>
                        <td font-weight="bold">{{ $index + 1 }}</td>
                        <td class="team-name">
                            {{ $standing->team->name }}<br>
                            <small style="color: #666; font-weight: normal;">{{ $standing->team->unit->name }}</small>
                        </td>
                        <td>{{ $standing->played }}</td>
                        <td>{{ $standing->won }}</td>
                        <td>{{ $standing->drawn }}</td>
                        <td>{{ $standing->lost }}</td>
                        <td>{{ $standing->goal_difference }}</td>
                        <td style="background-color: #f0f7ff; font-weight: bold;">{{ $standing->points }}</td>
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
