import { LevelResponse } from './common';
import { body, canvas, disableRendering, enableRendering } from './main';
import { View } from './menu';

export interface LevelDetailsOpts {
    level: LevelResponse
}
export interface LevelDetailsState {
    root: HTMLElement
}
export const levelDetails = new View<LevelDetailsState, LevelDetailsOpts>((ctx, state, opts) => {
    disableRendering();
    canvas.style.display = 'none';

    const root = document.createElement('div');
    state.root = root;
    root.className = 'widget level-details';


    body.appendChild(root);
}, () => {}, () => {
    enableRendering();
    canvas.style.display = 'initial';
});