// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. IMPORTS (must be at top in modules!)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import data from '../data/songs.json' assert { type: 'json' };
import { SongCard, PlaylistCard } from './components.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. GLOBAL DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const songsData = data.songs || [];
const artistsData = data.artists || [];
const albumsData = data.albums || [];
const playlistsData = data.playlists || [];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. DOM REFERENCES (will be assigned in init())
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let navItems, mainContent, themeBtn;
let playerCover, playerTitle, playerArtist, playBtn, prevBtn, nextBtn, progress, volume;
let audio, currentSongIndex = 0;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. PAGE RENDERING FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function renderDashboard() {
    let html = `<h2 style="margin-bottom:20px;">Featured Songs</h2>`;
    html += `<div class="dashboard">`;

    songsData.slice(0, 12).forEach(song => {
        const artist = artistsData.find(a => a.id === song.artistId)?.name || 'Unknown';
        html += `
            <div class="card">
                <img src="${song.cover || 'assets/placeholder-album.png'}" alt="${song.title}">
                <div class="card-info">
                    <h4>${song.title}</h4>
                    <p>${artist}</p>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    mainContent.innerHTML = html;
}

function renderPlaylists() {
    let html = `<h2 style="margin-bottom:20px;">Your Playlists</h2><div class="dashboard">`;

    playlistsData.forEach(pl => {
        html += `
            <div class="card" data-playlist-id="${pl.id}">
                <img src="${pl.cover}" alt="${pl.title}">
                <div class="card-info">
                    <h4>${pl.title}</h4>
                    <p>${pl.songIds?.length || 0} songs</p>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    mainContent.innerHTML = html;

    // Attach click handlers after render
    document.querySelectorAll('.card[data-playlist-id]').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.playlistId);
            renderPlaylist(id);
        });
    });
}

function renderPlaylist(playlistId) {
    const playlist = playlistsData.find(pl => pl.id === playlistId);
    if (!playlist) return;

    let savedSongs = JSON.parse(localStorage.getItem(`playlist-${playlistId}`)) || playlist.songIds;

    let html = `<h2>${playlist.title}</h2><div class="dashboard">`;

    savedSongs.forEach(songId => {
        const song = songsData.find(s => s.id === songId);
        if (!song) return;
        const artist = artistsData.find(a => a.id === song.artistId)?.name || 'Unknown';
        html += `
            <div class="card" data-song-id="${song.id}" data-playlist-id="${playlistId}">
                <img src="${song.cover}" alt="${song.title}">
                <div class="card-info">
                    <h4>${song.title}</h4>
                    <p>${artist}</p>
                    <button class="remove-btn">Remove</button>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    mainContent.innerHTML = html;

    // Attach remove handlers
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.card');
            const pid = parseInt(card.dataset.playlistId);
            const sid = parseInt(card.dataset.songId);
            removeSongFromPlaylist(pid, sid);
        });
    });
}

function removeSongFromPlaylist(playlistId, songId) {
    let saved = JSON.parse(localStorage.getItem(`playlist-${playlistId}`)) || 
                playlistsData.find(p => p.id === playlistId)?.songIds || [];
    saved = saved.filter(id => id !== songId);
    localStorage.setItem(`playlist-${playlistId}`, JSON.stringify(saved));
    renderPlaylist(playlistId);
}

function renderSearch() {
    let html = `
        <div class="search-container">
            <input type="text" class="search-input" id="search-input" placeholder="Search songs, artists...">
            <div class="search-results" id="search-results"></div>
        </div>
    `;
    mainContent.innerHTML = html;

    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');

    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        if (!q) {
            results.innerHTML = '';
            return;
        }

        const matches = songsData.filter(song => {
            const title = song.title.toLowerCase();
            const artist = (artistsData.find(a => a.id === song.artistId)?.name || '').toLowerCase();
            return title.includes(q) || artist.includes(q);
        });

        let out = '';
        matches.slice(0, 20).forEach(song => {
            const artist = artistsData.find(a => a.id === song.artistId)?.name || 'Unknown';
            out += `
                <div class="card">
                    <img src="${song.cover}" alt="${song.title}">
                    <div class="card-info">
                        <h4>${song.title}</h4>
                        <p>${artist}</p>
                    </div>
                </div>
            `;
        });
        results.innerHTML = out;
    });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. THEME HANDLING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function setTheme(theme) {
    const root = document.documentElement;
    if (theme === 'light') {
        root.style.setProperty('--bg-color', '#f5f5f5');
        root.style.setProperty('--sidebar-color', '#fff');
        root.style.setProperty('--text-color', '#121212');
        root.style.setProperty('--card-bg', '#fff');
        root.style.setProperty('--hover-bg', '#e0e0e0');
        themeBtn.textContent = '☀️';
    } else {
        root.style.setProperty('--bg-color', '#121212');
        root.style.setProperty('--sidebar-color', '#1e1e1e');
        root.style.setProperty('--text-color', '#fff');
        root.style.setProperty('--card-bg', '#1e1e1e');
        root.style.setProperty('--hover-bg', '#333');
        themeBtn.textContent = '🌙';
    }
    localStorage.setItem('theme', theme);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. MUSIC PLAYER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function loadSong(index) {
    if (index < 0 || index >= songsData.length) return;
    currentSongIndex = index;
    const song = songsData[index];
    const artist = artistsData.find(a => a.id === song.artistId)?.name || 'Unknown';

    playerCover.src = song.cover || 'assets/placeholder-album.png';
    playerTitle.textContent = song.title;
    playerArtist.textContent = artist;
    audio.src = song.audio;
    audio.play();
    playBtn.textContent = '⏸️';
}

function initPlayer() {
    audio = new Audio();
    loadSong(0);

    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playBtn.textContent = '⏸️';
        } else {
            audio.pause();
            playBtn.textContent = '▶️';
        }
    });

    prevBtn.addEventListener('click', () => {
        currentSongIndex = (currentSongIndex - 1 + songsData.length) % songsData.length;
        loadSong(currentSongIndex);
    });

    nextBtn.addEventListener('click', () => {
        currentSongIndex = (currentSongIndex + 1) % songsData.length;
        loadSong(currentSongIndex);
    });

    audio.addEventListener('timeupdate', () => {
        progress.value = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    });

    progress.addEventListener('input', () => {
        if (audio.duration) {
            audio.currentTime = (progress.value / 100) * audio.duration;
        }
    });

    volume.addEventListener('input', () => {
        audio.volume = volume.value / 100;
    });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. INIT & NAVIGATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function init() {
    // Assign DOM refs
    navItems = document.querySelectorAll('#sidebar .nav-item');
    mainContent = document.getElementById('main-content');
    themeBtn = document.getElementById('theme-btn');

    playerCover = document.getElementById('player-cover');
    playerTitle = document.getElementById('player-title');
    playerArtist = document.getElementById('player-artist');
    playBtn = document.getElementById('play-btn');
    prevBtn = document.getElementById('prev-btn');
    nextBtn = document.getElementById('next-btn');
    progress = document.getElementById('progress');
    volume = document.getElementById('volume');

    // Theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    themeBtn.addEventListener('click', () => {
        const current = localStorage.getItem('theme') || 'dark';
        setTheme(current === 'dark' ? 'light' : 'dark');
    });

    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const page = item.getAttribute('data-page');
            switch(page) {
                case 'home': renderDashboard(); break;
                case 'search': renderSearch(); break;
                case 'playlists': renderPlaylists(); break;
                case 'library':
                    mainContent.innerHTML = `<h1 style="text-align:center; margin-top:50px;">Your Library</h1>`;
                    break;
                default:
                    mainContent.innerHTML = `<h1 style="text-align:center; margin-top:50px;">${page.charAt(0).toUpperCase() + page.slice(1)}</h1>`;
            }
        });
    });

    // Lazy loading
    lazyLoadImages();

    // Player
    initPlayer();

    // Initial view
    renderDashboard();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 8. LAZY LOADING (kept from your code)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function lazyLoadImages() {
    const lazyImages = document.querySelectorAll('img.lazy');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '100px 0px' });

        lazyImages.forEach(img => observer.observe(img));
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 9. START APP WHEN DOM IS READY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
