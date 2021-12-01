// import { LevelData } from './common';
import { Antigravity, BlackHole, Moon, Obstacle, Planet, Simulation, Station, VBody, Vector } from './data';
import { BasicBind, disableRendering, enableRendering, onKey, removeKeyListener, setView } from './main';
import { View, LevelSelectBtn, BigButton, Button } from './menu';
import { levels } from './levels';
import { LevelEditor } from './level-editor';
import { levelBrowser, playLevel } from './level-browser';
import { LevelData } from './safer-level';
import whileLoading from './elements/while-loading';
import { LevelResponse } from '../server/common';

interface MainMenuState {
    levelBtn: Button,
    levelEditorBtn: Button,
    levelBrowserBtn: Button
};
export const mainMenu = new View<MainMenuState>((ctx, state) => {
    state.levelBtn = new BigButton(ctx, 'Play', () => {
        setView(selectLevel, {});
    });
    state.levelEditorBtn = new BigButton(ctx, 'Level Editor', () => {
        setView(LevelEditor, {});
    });
    state.levelBrowserBtn = new BigButton(ctx, 'Level Browser', () => {
        setView(levelBrowser, {});
    });
}, (ctx, mousePos, state) => {
    const center = (ctx.canvas.width - BigButton.WIDTH) / 2;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `96px ubuntu, monospace`;
    ctx.fillText('Gravity', ctx.canvas.width / 2, 320);
    state.levelBtn.render(center, 420, mousePos);
    state.levelEditorBtn.render(center, 505, mousePos);
    state.levelBrowserBtn.render(center, 590, mousePos);
}, (ctx, state) => {
    state.levelBtn.unbind();
    state.levelEditorBtn.unbind();
    state.levelBrowserBtn.unbind();
});

let currentLevel: number;
const w = LevelSelectBtn.HEIGHT + 15;
const h = LevelSelectBtn.HEIGHT;
interface SelectLevelState {
    backBtn: Button,
    buttons: Button[]
};
export const selectLevel = new View<SelectLevelState>((ctx, state) => {
    state.backBtn = new BigButton(ctx, 'Back', () => {
        setView(mainMenu, {});
    });
    state.buttons = [];
    for(let i=0;i<levels.length;i++) {
        state.buttons.push(new LevelSelectBtn(ctx, (i+1).toString(), () => {
            currentLevel = i;
            async function advanceLevel() {
                const level = await whileLoading<LevelResponse>(async (doneLoading) => {
                    const resp = await fetch('/get-level?id='+levels[currentLevel]);
                    const level = await resp.json() as LevelResponse;
                    doneLoading(level);
                });

                playLevel(level, (victory) => {
                    if(victory && currentLevel + 1 < levels.length) {
                        currentLevel++;
                        advanceLevel();
                    } else {
                        setView(mainMenu, {});
                    }
                });
            }
            advanceLevel();
        }));
    }
}, (ctx, mousePos, state) => {
    const center = ctx.canvas.width / 2;
    const middle = ctx.canvas.height / 2;
    const buttonLeftAlign = center - BigButton.WIDTH / 2;
    for(let y=0;y<Math.ceil(state.buttons.length/5);y++) {
        for(let x=0;x<Math.min(5, state.buttons.length - 5*y);x++) {
            state.buttons[y*5+x].render(center - 2 * w - h / 2 + x * w, middle - 3 * w + y * w, mousePos);
        }
    }

    state.backBtn.render(buttonLeftAlign, ctx.canvas.height - 100, mousePos);
}, (ctx, state) => {
    state.backBtn.unbind();
    for(const btn of state.buttons) btn.unbind();
});

interface GameOpts {
    level: LevelData,
    whenDone: (victory: boolean) => void
}
interface GameState {
    simulation: Simulation,
    done: boolean,
    cache: any,
    level: LevelData,
    continueBtn: Button,
    continueKey: symbol,
    continue: boolean,
    restartBtn: Button,
    restartKey: symbol,
    restartBtnEnd: Button,
    backBtn: Button,
    backKey: symbol
}
export const playingGame = new View<GameState, GameOpts>((ctx, state, opts) => {
    const simulation = new Simulation(ctx);
    const level = opts.level;
    state.level = level;

    simulation.camera = new Vector(-ctx.canvas.width / 2 + level.center.x, -ctx.canvas.height / 2 + level.center.y);
    state.cache = {};
    const handleContinue = () => {
        if(state.done) {
            state.continue = true;
            opts.whenDone(true);
        }
    }
    state.continueBtn = new BigButton(ctx, 'Continue', handleContinue);
    state.continueBtn.enabled = false;
    state.continueKey = Symbol('playingGame$continue');
    onKey(state.continueKey, new BasicBind('Enter', {}, handleContinue));

    const handleBack = () => {
        opts.whenDone(false);
    }
    state.backBtn = new LevelSelectBtn(ctx, String.fromCharCode(0x232b), handleBack);
    state.backKey = Symbol('playingGame$backKey');
    onKey(state.backKey, new BasicBind('Backspace', {}, handleBack));

    const handleRestart = () => {
        setView(playingGame, opts);
    };
    state.restartBtn = new LevelSelectBtn(ctx, String.fromCharCode(0x21ba), handleRestart);
    state.restartKey = Symbol('playingGame$restartKey');
    state.restartBtnEnd = new BigButton(ctx, 'Restart', handleRestart);
    state.restartBtnEnd.enabled = false;
    onKey(state.restartKey, new BasicBind('r', {}, handleRestart));

    for(const entry of level.objects) {
        let object: VBody;
        switch(entry.type) {
            case 'friendly-station':
                object = new Station(entry.x, entry.y, true, simulation);
                break;
            case 'enemy-station':
                object = new Station(entry.x, entry.y, false, simulation);
                break;
            case 'moon':
                object = new Moon(entry.x, entry.y, simulation);
                break;
            case 'asteroid':
                object = new Obstacle(entry.x, entry.y, simulation);
                break;
            case 'planet':
                object = new Planet(entry.x, entry.y, simulation);
                break;
            case 'black-hole':
                object = new BlackHole(entry.x, entry.y, simulation);
                break;
            case 'antigravity':
                object = new Antigravity(entry.x, entry.y, simulation);
                break;
        }
        simulation.addBody(object);
        entry.startup?.(state.cache, object);
    }
    level.startup?.(state.cache, simulation);
    state.simulation = simulation;
    state.done = false;
}, (ctx, mousePos, state) => {
    state.level.tick?.(state.cache, state.simulation);
    if(!state.simulation.tick()) {
        state.done = true;
        state.continueBtn.enabled = true;
        state.restartBtnEnd.enabled = true;
    } else {
        state.restartBtn.render(ctx.canvas.width - LevelSelectBtn.WIDTH - 15, ctx.canvas.height - LevelSelectBtn.HEIGHT - 15, mousePos);
        state.backBtn.render(ctx.canvas.width - LevelSelectBtn.WIDTH - 15, ctx.canvas.height - LevelSelectBtn.HEIGHT - 100, mousePos);
    }
    if(state.done) {
        ctx.font = '52px "Courier Prime", monospace';
        ctx.textBaseline = 'bottom';
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        const center = ctx.canvas.width / 2;
        const middle = ctx.canvas.height / 2;
        const text = 'MISSION SUCCESSFUL';
        ctx.strokeText(text, center, middle - 50);
        ctx.fillText(text, center, middle - 50);
        state.continueBtn.render(center - BigButton.WIDTH / 2, middle - BigButton.HEIGHT / 2 + 50, mousePos);
        state.restartBtnEnd.render(center - BigButton.WIDTH / 2, middle - BigButton.HEIGHT / 2 + 135, mousePos);
    }
}, (ctx, state) => {
    state.continueBtn.unbind();
    state.restartBtn.unbind();
    state.simulation.unbind();
    state.backBtn.unbind();
    state.restartBtnEnd.unbind();
    removeKeyListener(state.continueKey);
    removeKeyListener(state.restartKey);
    removeKeyListener(state.backKey);
});