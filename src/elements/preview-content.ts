import { LevelResponse } from '../common';

function format(s: number): string {
    if(s < 1000) {
        return s.toLocaleString();
    } else if(s < 1e6) {
        return (Math.round(s / 1e2) / 10).toLocaleString() + 'k';
    } else if(s < 1e9) {
        return (Math.round(s / 1e5) / 10).toLocaleString() + 'm';
    } else {
        return (Math.round(s / 1e8) / 10).toLocaleString() + 'b'; // because this will certainly be played a billion times
    }
}

const BULLET = String.fromCharCode(0x2022);
export default function(level: LevelResponse): HTMLElement {
    const parent = document.createElement('div');

    const thumbnail = document.createElement('img');
    thumbnail.width = 250;
    thumbnail.height = 155;
    thumbnail.src = '/public/img/placeholder_250x155.png';
    parent.appendChild(thumbnail);

    const rating = document.createElement('div');
    rating.className = 'level-browser-level-rating';
    const coveringRating = document.createElement('div');
    coveringRating.className = 'level-browser-level-rating-cover';
    rating.appendChild(coveringRating);
    coveringRating.style.width = Math.round(100 - (level.rating / 15) * 100) +'%';
    parent.appendChild(rating);

    const text = document.createElement('div');
    text.className = 'level-browser-level-info';
    text.innerText = level.ratings + ' ratings ' + BULLET + ' played ' + format(level.played) + ' times';
    parent.appendChild(text);

    return parent;
}