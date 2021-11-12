import { LevelResponse } from '../common';

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
    text.innerText = level.ratings + ' ratings ' + BULLET + ' played ' + level.played +' times';
    parent.appendChild(text);

    return parent;
}