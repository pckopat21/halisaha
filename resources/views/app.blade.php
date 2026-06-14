<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <meta name="theme-color" content="#fafafa" media="(prefers-color-scheme: light)">
        <meta name="theme-color" content="#0b0b0b" media="(prefers-color-scheme: dark)">
        <meta name="color-scheme" content="light dark">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
        <link rel="dns-prefetch" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600&display=swap" rel="stylesheet" />

        {{-- İlk paint için kritik stil: JS gelmeden önce sayfa boş beyaz/siyah kalmasın --}}
        <style>
            html, body {
                background-color: #fafafa;
                color: #0f172a;
                margin: 0;
                padding: 0;
                min-height: 100%;
                -webkit-text-size-adjust: 100%;
                -webkit-tap-highlight-color: transparent;
            }
            @media (prefers-color-scheme: dark) {
                html, body { background-color: #0b0b0b; color: #f1f5f9; }
                #app-preboot .preboot-dot { background: #f97316; }
            }
            #app-preboot {
                position: fixed;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                background: inherit;
                z-index: 2147483647;
                pointer-events: none;
                transition: opacity .35s ease;
            }
            #app-preboot.is-hidden { opacity: 0; }
            .preboot-dot {
                width: 10px; height: 10px; border-radius: 999px;
                background: #ea580c;
                animation: preboot-bounce 1s infinite ease-in-out;
            }
            .preboot-dot:nth-child(2) { animation-delay: .15s; }
            .preboot-dot:nth-child(3) { animation-delay: .3s; }
            @keyframes preboot-bounce {
                0%, 80%, 100% { transform: translateY(0); opacity: .35; }
                40% { transform: translateY(-10px); opacity: 1; }
            }
            @media (prefers-reduced-motion: reduce) {
                .preboot-dot { animation: none; opacity: .8; }
            }
        </style>

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        <div id="app-preboot" aria-hidden="true">
            <span class="preboot-dot"></span>
            <span class="preboot-dot"></span>
            <span class="preboot-dot"></span>
        </div>
        @inertia
        <script>
            (function () {
                var preboot = document.getElementById('app-preboot');
                if (!preboot) return;
                var hide = function () {
                    preboot.classList.add('is-hidden');
                    setTimeout(function () { preboot.parentNode && preboot.parentNode.removeChild(preboot); }, 400);
                };
                var safetyTimer = setTimeout(hide, 6000);
                var observer = new MutationObserver(function () {
                    var inertiaRoot = document.getElementById('app');
                    if (inertiaRoot && inertiaRoot.firstChild) {
                        clearTimeout(safetyTimer);
                        observer.disconnect();
                        requestAnimationFrame(hide);
                    }
                });
                observer.observe(document.body, { childList: true, subtree: true });
            })();
        </script>
    </body>
</html>
