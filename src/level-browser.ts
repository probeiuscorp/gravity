import { FetchLevelsResponse } from './common';
import { disableRendering, enableRendering } from './main';
import { View } from './menu';

export interface LevelBrowserState {

}
export const levelBrowser = new View<LevelBrowserState>((ctx, state) => {
    disableRendering();
    fetch('get-levels').then((res) => res.json()).then((json: FetchLevelsResponse) => {
        
    });
}, () => {

}, () => {
    enableRendering();
});