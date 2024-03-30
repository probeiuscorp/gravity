import { FetchLevelsResponse, LevelResponse } from '../api/common';
import btn from './elements/create-btn';
import genericStatus, { Status } from './elements/generic-status';
import previewContent from './elements/preview-content';
import whileLoading from './elements/while-loading';
import { levelDetails } from './level-details';
import { body, canvas, disableRendering, enableRendering, setView } from './main';
import { View } from './menu';
import saferLevel from './safer-level';
import { mainMenu, playingGame } from './view';

export interface LevelBrowserState {
    root: HTMLElement
}

export function playLevel(level: LevelResponse, whenDone: (victory: boolean) => void) {
    const output = saferLevel(level.levelData, false);
    fetch('/api/played-level?id='+level.id);

    if(output.level !== false) {
        setView(playingGame, {
            level: output.level,
            whenDone: (victory) => {
                output.onDone();
                whenDone(victory);
            }
        });
    } else {
        genericStatus(['There was an error while attempting to load the level.'], Status.ERROR);
    }
}

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
        fetchLevels('/api/levels?' + url.toString());
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
                        icon.title = 'Official level';
                        header.appendChild(icon);
                    }
                    header.appendChild(document.createTextNode((level.official ? ' ' : '') + level.name));
                    parent.appendChild(header);

                    parent.appendChild(previewContent(level));

                    const buttons = document.createElement('div');
                    buttons.className = 'widget-btns';
                    buttons.appendChild(btn('Play', () => {
                        playLevel(level, () => {
                            setView(levelBrowser, {});
                        });
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
    fetchLevels('/api/levels?sort=popular');
    body.appendChild(root);
}, () => {

}, (ctx, state) => {
    enableRendering();
    body.removeChild(state.root);
    canvas.style.display = 'initial';
});