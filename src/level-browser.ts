import { FetchLevelsResponse } from './common';
import btn from './elements/create-btn';
import genericStatus, { Status } from './elements/generic-status';
import whileLoading from './elements/while-loading';
import { levelDetails } from './level-details';
import { body, canvas, disableRendering, enableRendering, setView } from './main';
import { View } from './menu';
import saferLevel from './safer-level';
import { mainMenu, playingGame } from './view';

export interface LevelBrowserState {
    root: HTMLElement
}

const BULLET = String.fromCharCode(0x2022);
export const levelBrowser = new View<LevelBrowserState>((ctx, state) => {
    disableRendering();
    canvas.style.display = 'none';
    
    const root = document.createElement('div');
    root.className = 'level-browser';
    state.root = root;

    const search = document.createElement('div');
    search.className = 'level-browser-search widget';
    
    const sort = document.createElement('div');
    sort.className = 'level-browser-sort';
    sort.appendChild(document.createTextNode('Sort by: '));
    let first = true;
    let selected: HTMLElement;
    for(const method of ['Popular', 'New', 'Rating']) {
        const selector = document.createElement('div');
        selector.dataset.method = method.toLowerCase();
        selector.className = `level-browser-sort-method${first ? ' selected' : ''}`;
        if(first) selected = selector;
        selector.innerText = method;
        first = false;
        selector.addEventListener('click', () => {
            if(selector !== selected) {
                selected.classList.remove('selected');
                selector.classList.add('selected');
                selected = selector;
                searchBtn.click();
            }
        });
        sort.appendChild(selector);
    }
    search.appendChild(sort);

    const filter = document.createElement('div');
    filter.className = 'level-browser-filter';

    const textbox = document.createElement('input');
    textbox.type = 'text';
    textbox.placeholder = 'Filter by name';
    textbox.className = 'widget-text-box';
    textbox.addEventListener('keyup', (e) => {
        if(e.key === 'Enter') {
            searchBtn.click();
        }
    });
    filter.appendChild(textbox);

    const searchBtn = btn('Search', () => {
        levels.textContent = '';
        let url = new URLSearchParams();
        url.set('sort', selected.dataset.method);
        if(textbox.value) {
            url.set('name', textbox.value);
        }
        fetchLevels('/levels?' + url.toString());
    });
    searchBtn.classList.add('level-browser-filter-btn');
    filter.appendChild(searchBtn);
    const backBtn = btn('Back', () => {
        setView(mainMenu, {});
    });
    backBtn.classList.add('level-browser-filter-btn');
    filter.appendChild(backBtn);

    search.appendChild(filter);
    
    root.appendChild(search);

    const levels = document.createElement('div');
    levels.className = 'level-browser-levels';
    root.appendChild(levels);

    function fetchLevels(url: string): void {
        whileLoading((doneLoading) => {
            fetch(url).then((res) => res.json()).then((json: FetchLevelsResponse) => {
                for(const level of json) {
                    const parent = document.createElement('div');
                    parent.className = 'level-browser-level widget';
                    
                    const header = document.createElement('div');
                    header.className = 'level-browser-title';
                    if(level.official) {
                        const icon = document.createElement('i');
                        icon.className = 'bi bi-patch-check-fill';
                        icon.style.fontSize = 'medium';
                        icon.title = 'Official level.';
                        header.appendChild(icon);
                    }
                    header.appendChild(document.createTextNode((level.official ? ' ' : '') + level.name));
                    parent.appendChild(header);

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
                    coveringRating.style.width = Math.round(100 - level.rating * 100) +'%';
                    parent.appendChild(rating);

                    const text = document.createElement('div');
                    text.className = 'level-browser-level-info';
                    text.innerText = level.ratings + ' ratings ' + BULLET + ' ' + level.played +' plays';
                    parent.appendChild(text);

                    const buttons = document.createElement('div');
                    buttons.className = 'widget-btns';
                    buttons.appendChild(btn('Play', () => {
                        const levelData = saferLevel(level.levelData, false);
                        if(levelData) {
                            setView(playingGame, {
                                level: levelData,
                                whenDone: () => {
                                    setView(levelBrowser, {});
                                }
                            });
                        } else {
                            genericStatus(['There was an error while attempting to load the level.'], Status.ERROR);
                        }
                    }));
                    buttons.appendChild(btn('Level info', () => {
                        setView(levelDetails, {
                            level
                        })
                    }));
                    parent.appendChild(buttons);

                    levels.appendChild(parent);
                }
                doneLoading();

                if(json.length === 0) {

                }
            });
        });
    }
    fetchLevels('/levels?sort=popular');
    body.appendChild(root);
}, () => {

}, (ctx, state) => {
    enableRendering();
    body.removeChild(state.root);
    canvas.style.display = 'initial';
});