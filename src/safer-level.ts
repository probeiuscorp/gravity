import { BlackHole, Destructible, GravityGenerator, Moon, Obstacle, Planet, Projectile, Renderer, Shell, Simulation, Station, VBody, Vector } from './data';
// import { LevelData } from './types';
import genericStatus, { Status } from './elements/generic-status';

export interface LevelData {
    center: {
        x: number,
        y: number
    },
    objects: {
        type: string,
        x: number,
        y: number,
        startup?: (state, body) => void
    }[],
    startup?: (state, simulation) => void,
    cleanup?: (state, simulation) => void,
    tick?: (state, simulation) => void
}

const whitelist = [
    'Object',
    'String',
    'Number',
    'NaN',
    'Infinity',
    'parseInt',
    'parseFloat',
    'isNaN',
    'isFinite',
    'Symbol',
    'Function',
    'Array',
    'ArrayBuffer',
    'Boolean',
    'Error',
    'Date',
    'JSON',
    'Math',
    'TypeError',
    'RangeError',
    'ReferenceError',
    'SyntaxError',
    'RegExp',
    'undefined'
];

var saferCtx: any = {};
for(const key of Object.keys(Object.getOwnPropertyDescriptors(window))) {
    if(!(key in whitelist)) {
        saferCtx[key] = undefined;
    }
}

saferCtx.gravity = {
    Renderer: Object.freeze(Renderer),
    Simulation: Object.freeze(Simulation),
    Vector: Object.freeze(Vector),
    VBody: Object.freeze(VBody),
    GravityGenerator: Object.freeze(GravityGenerator),
    Projectile: Object.freeze(Projectile),
    Shell: Object.freeze(Shell),
    Obstacle: Object.freeze(Obstacle),
    Moon: Object.freeze(Moon),
    Planet: Object.freeze(Planet),
    BlackHole: Object.freeze(BlackHole),
    Destructible: Object.freeze(Destructible),
    Station: Object.freeze(Station)
};

function executeSafer(ctx: any, code): void {
    (window as any).__GRAVITY.evalNoStrict(`with(ctx){${code}}`, {
        ctx
    });
}

/**
 * Rejects if the level didn't actually create one with `Gravity.createLevel()`.
 */
export default function saferLevel(code: string, testing: boolean): LevelData | false {
    let timeouts = {};
    let intervals = {};
    let level: LevelData;
    let ctx = {...saferCtx};

    ctx.Gravity = {
        createLevel: (_level: LevelData) => {
            level = _level;
        },
        debug: (...args: any[]) => {
            if(testing) {
                console.log(...args)
            }
        },

        setTimeout: ((func: Function, ms: number, ...args: any[]) => {
            timeouts[window.setTimeout(func, ms, ...args)] = true;
        }).bind(window),
        clearTimeout: ((handle: number) => {
            delete timeouts[handle];
            window.clearTimeout(handle);
        }).bind(window),
        setInterval: ((func: Function, ms: number, ...args: any[]) => {
            intervals[window.setInterval(() => {executeSafer(ctx, func)}, ms, ...args)] = true;
        }).bind(window),
        clearInterval: ((handle: number) => {
            delete intervals[handle];
            window.clearInterval(handle);
        }).bind(window)
    }

    try {
        executeSafer(ctx, code);
    } catch(e) {
        if(testing) {
            console.log(e);
            genericStatus(['Error encountered while loading level.', 'See console for details.'], Status.ERROR);
        } else {
            genericStatus(['Error encountered while loading level.'], Status.ERROR);
        }
        return false;
    }
    
    if(
        typeof level === 'object' &&
        typeof level.center === 'object' &&
        typeof level.center.x === 'number' &&
        typeof level.center.y === 'number' &&
        typeof level.objects === 'object' && Array.isArray(level.objects) &&
        level.objects.every((item) => (
            typeof item === 'object' &&
            typeof item.type === 'string' &&
            typeof item.x === 'number' &&
            typeof item.y === 'number' &&
            (!item.startup || typeof item.startup === 'function')
        )) &&
        (!level.startup || typeof level.startup === 'function') &&
        (!level.cleanup || typeof level.cleanup === 'function') &&
        (!level.tick || typeof level.tick === 'function')
    ) {
        return level;
    } else {
        genericStatus(['Level attempted to create is invalid.']);
        return false;
    }
}