// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SongCard Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function SongCard(song, artist, onClick) {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    const img = document.createElement('img');
    img.dataset.src = song.cover || 'assets/placeholder-album.png';
    img.alt = song.title || 'Unknown Song';
    img.className = 'lazy';

    const cardInfo = document.createElement('div');
    cardInfo.className = 'card-info';

    const title = document.createElement('h4');
    title.textContent = song.title || 'Untitled';

    const artistName = document.createElement('p');
    artistName.textContent = artist?.name || 'Unknown Artist';

    cardInfo.append(title, artistName);
    card.append(img, cardInfo);

    const handleClick = () => {
        if (typeof onClick === 'function') {
            onClick(song);
        }
    };

    card.addEventListener('click', handleClick);
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    });

    return card;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PlaylistCard Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function PlaylistCard(playlist, onClick) {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    const img = document.createElement('img');
    img.dataset.src = playlist.cover || 'assets/placeholder-album.png';
    img.alt = playlist.title || 'Unnamed Playlist';
    img.className = 'lazy';

    const cardInfo = document.createElement('div');
    cardInfo.className = 'card-info';

    const title = document.createElement('h4');
    title.textContent = playlist.title || 'Untitled Playlist';

    const songCount = document.createElement('p');
    const count = playlist.songIds?.length || 0;
    songCount.textContent = `${count} song${count !== 1 ? 's' : ''}`;

    cardInfo.append(title, songCount);
    card.append(img, cardInfo);

    const handleClick = () => {
        if (typeof onClick === 'function') {
            onClick(playlist);
        }
    };

    card.addEventListener('click', handleClick);
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    });

    return card;
}
