import { LevelResponse } from './common';
import btn from './elements/create-btn';
import previewContent from './elements/preview-content';
import rating from './elements/rating';
import { levelBrowser } from './level-browser';
import { LevelEditor } from './level-editor';
import { body, canvas, disableRendering, enableRendering, setView } from './main';
import { View } from './menu';
import saferLevel from './safer-level';
import { playingGame } from './view';

export interface LevelDetailsOpts {
    level: LevelResponse
}
export interface LevelDetailsState {
    root: HTMLElement
}
export const levelDetails = new View<LevelDetailsState, LevelDetailsOpts>((ctx, state, opts) => {
    disableRendering();
    canvas.style.display = 'none';
    const level = opts.level;

    const root = document.createElement('div');
    state.root = root;
    root.className = 'widget no-hover level-details';

    const content = document.createElement('div');
    content.className = 'level-details-content';

    const left = document.createElement('div');
    left.className = 'level-details-content-left';

    const title = document.createElement('div');

    if(level.official) {
        const icon = document.createElement('i');
        icon.className = 'bi bi-patch-check-fill';
        icon.title = 'Official level';
        icon.style.fontSize = 'x-large';
        title.appendChild(icon);
    }
    title.appendChild(document.createTextNode((level.official ? ' ' : '') + level.name));
    title.className = 'level-details-header';
    left.appendChild(title);

    const description = document.createElement('div');
    description.className = 'level-details-description';
    description.textContent = level.description ?? 'No description provided';
    left.appendChild(description);

    content.appendChild(left);

    const right = document.createElement('div');
    right.className = 'level-details-content-right';
    right.appendChild(previewContent(level));

    content.appendChild(right);

    root.appendChild(content);

    const buttons = document.createElement('div');
    buttons.className = 'widget-btns';
    buttons.appendChild(btn('Play', () => {
        const lvl = saferLevel(level.levelData, false);
        fetch('/played-level?id='+level.id);
        
        if(lvl) {
            setView(playingGame, {
                level: lvl,
                whenDone: () => {
                    setView(levelDetails, { level: level });
                }
            });
        }
    }));
    buttons.appendChild(btn('View source', () => {
        setView(LevelEditor, { code: level.source, project: { levelData: level.source, name: '$view-source' } })
    }));
    const ratingBtn = btn('Rate', () => {
        rating(level.id).then((rated) => {
            if(rated) {
                ratingBtn.innerText = 'Rated';
                ratingBtn.classList.add('disabled');
            }
        });
    });
    buttons.appendChild(ratingBtn);
    buttons.appendChild(btn('Back', () => {
        setView(levelBrowser, {});
    }));
    root.appendChild(buttons);

    body.appendChild(root);
}, () => {}, (ctx, state) => {
    enableRendering();
    body.removeChild(state.root);
    canvas.style.display = 'initial';
});