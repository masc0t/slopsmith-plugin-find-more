/* Find More Songs plugin */
(function () {
    let fmData = [];
    let fmCurrentFilter = 'all';
    let fmLastArtist = '';

    // Add [find more] links to artist names on library grid cards
    const _origRenderGrid = window.renderGridCards;
    window.renderGridCards = function () {
        _origRenderGrid.apply(this, arguments);
        const containerId = arguments[1] || 'lib-grid';
        const grid = document.getElementById(containerId);
        if (!grid) return;
        grid.querySelectorAll('.song-card .p-4 p.text-gray-500').forEach(p => {
            const artist = p.textContent.trim();
            if (!artist || p.dataset.fmLinked) return;
            p.dataset.fmLinked = '1';
            const link = document.createElement('a');
            link.textContent = ' [find more]';
            link.className = 'text-accent/60 hover:text-accent cursor-pointer';
            link.title = 'Find more songs by ' + artist;
            link.onclick = (e) => {
                e.stopPropagation();
                document.getElementById('fm-artist').value = artist;
                fmLastArtist = '';
                showScreen('plugin-find_more');
                fmSearch();
            };
            p.appendChild(link);
        });
    };

    // Add [find more] links to artist headers in tree view
    const _origRenderTree = window.renderTreeInto;
    window.renderTreeInto = async function () {
        await _origRenderTree.apply(this, arguments);
        const containerId = arguments[0] || 'lib-tree';
        const container = document.getElementById(containerId);
        if (!container) return;
        container.querySelectorAll('.artist-header').forEach(hdr => {
            const span = hdr.querySelector('span.text-white.font-semibold');
            if (!span || span.dataset.fmLinked) return;
            span.dataset.fmLinked = '1';
            const artist = span.textContent.trim();
            const link = document.createElement('a');
            link.textContent = '[find more]';
            link.className = 'ml-2 text-xs text-accent/60 hover:text-accent cursor-pointer';
            link.title = 'Find more songs by ' + artist;
            link.onclick = (e) => {
                e.stopPropagation();
                document.getElementById('fm-artist').value = artist;
                fmLastArtist = '';
                showScreen('plugin-find_more');
                fmSearch();
            };
            span.appendChild(document.createTextNode(' '));
            span.appendChild(link);
        });
    };

    // Auto-populate from current song when screen is opened
    const _origShowScreen = window.showScreen;
    window.showScreen = function (id) {
        _origShowScreen(id);
        if (id === 'plugin-find_more') fmOnShow();
    };

    async function fmOnShow() {
        if (!currentFilename) return;
        try {
            const resp = await fetch('/api/song/' + currentFilename);
            if (!resp.ok) return;
            const song = await resp.json();
            const artist = song.artist || '';
            if (!artist || artist === fmLastArtist) return;
            document.getElementById('fm-artist').value = artist;
            fmLastArtist = artist;
            fmSearch();
        } catch (e) { /* ignore */ }
    }

    window.fmSearch = async function () {
        const artist = document.getElementById('fm-artist').value.trim();
        if (!artist) return;

        const btn = document.getElementById('fm-search-btn');
        const loading = document.getElementById('fm-loading');
        const results = document.getElementById('fm-results');
        const stats = document.getElementById('fm-stats');
        const filterBar = document.getElementById('fm-filter-bar');

        btn.disabled = true;
        btn.textContent = 'Searching...';
        loading.classList.remove('hidden');
        results.innerHTML = '';
        stats.classList.add('hidden');
        filterBar.classList.add('hidden');
        fmLastArtist = artist;

        try {
            const resp = await fetch('/api/plugins/find_more/search?artist=' + encodeURIComponent(artist));
            if (!resp.ok) throw new Error('Search failed');
            const data = await resp.json();

            fmData = data.results;
            fmCurrentFilter = 'all';

            document.getElementById('fm-total').textContent = data.total;
            document.getElementById('fm-owned').textContent = data.owned;
            document.getElementById('fm-available').textContent = data.available;
            stats.classList.remove('hidden');
            filterBar.classList.remove('hidden');

            fmFilter('all');

            if (!data.results.length) {
                results.innerHTML = '<div class="text-gray-500 text-sm py-8 text-center">No songs found for this artist on CustomsForge.</div>';
            }
        } catch (e) {
            results.innerHTML = '<div class="text-red-400 text-sm py-4">Error: ' + esc(e.message) + '</div>';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Search';
            loading.classList.add('hidden');
        }
    };

    window.fmFilter = function (mode) {
        fmCurrentFilter = mode;
        const btns = { all: 'fm-f-all', available: 'fm-f-available', owned: 'fm-f-owned' };
        for (const [k, id] of Object.entries(btns)) {
            const el = document.getElementById(id);
            if (k === mode) {
                el.className = 'px-3 py-1 rounded-lg text-xs transition bg-accent text-white';
            } else {
                el.className = 'px-3 py-1 rounded-lg text-xs transition bg-dark-600 text-gray-400 hover:bg-dark-500';
            }
        }
        fmRender();
    };

    function fmRender() {
        const container = document.getElementById('fm-results');
        let filtered = fmData;
        if (fmCurrentFilter === 'available') filtered = fmData.filter(r => !r.owned);
        else if (fmCurrentFilter === 'owned') filtered = fmData.filter(r => r.owned);

        if (!filtered.length) {
            container.innerHTML = '<div class="text-gray-500 text-sm py-4 text-center">No songs match this filter.</div>';
            return;
        }

        let html = `<div class="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-x-4 text-xs text-gray-500 font-semibold uppercase tracking-wider px-3 py-2 border-b border-gray-800">
            <span>Title</span>
            <span class="w-28 text-center hidden sm:block">Tuning</span>
            <span class="w-16 text-center hidden md:block">Paths</span>
            <span class="w-20 text-center hidden md:block">Downloads</span>
            <span class="w-24 text-center hidden md:block">Updated</span>
            <span class="w-20 text-center">Status</span>
        </div>`;

        for (const r of filtered) {
            const status = r.owned
                ? '<span class="text-green-400 font-semibold">Owned</span>'
                : '<span class="text-amber-400 font-semibold">Available</span>';
            const rowBg = r.owned ? 'bg-dark-800/30' : 'bg-dark-700/40';
            const cfLink = r.cdlc_id
                ? ' cursor-pointer" onclick="window.open(\'https://ignition4.customsforge.com/cdlc/' + r.cdlc_id + '\',\'_blank\')" title="Open on CustomsForge'
                : '';
            const updated = r.updated ? new Date(r.updated * 1000).toLocaleDateString() : '';

            html += `<div class="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-x-4 items-center px-3 py-2.5 rounded-lg ${rowBg} hover:bg-dark-600/50 transition${cfLink}">
                <div>
                    <div class="text-sm text-white truncate">${esc(r.title)}</div>
                    <div class="text-xs text-gray-500 truncate">${esc(r.album)}${r.creator ? ' &middot; ' + esc(r.creator) : ''}</div>
                </div>
                <span class="w-28 text-center text-xs text-gray-400 hidden sm:block">${esc(r.tuning)}</span>
                <span class="w-16 text-center text-xs text-gray-400 hidden md:block">${esc(r.paths)}</span>
                <span class="w-20 text-center text-xs text-gray-400 hidden md:block">${(r.downloads || 0).toLocaleString()}</span>
                <span class="w-24 text-center text-xs text-gray-400 hidden md:block">${updated}</span>
                <span class="w-20 text-center text-xs">${status}</span>
            </div>`;
        }

        container.innerHTML = html;
    }
})();
