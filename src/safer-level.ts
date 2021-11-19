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
    'undefined',
    'Promise'
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

function runFuncSafe(func: () => void, ctx: any): void {
    if(func instanceof Function) {
        func.bind(ctx)();
        // if(func.toString().startsWith('() =>')) {
        //     // arrow function, don't bind
        //     // const me = Symbol();
        //     // // (window as any).__GRAVITY.executeInWith(ctx, func);
        //     // ctx[me] = {
        //     //     assign: function() { this.func = func; }
        //     // }
        //     // ctx[me].assign();
        //     // ctx[me].func();
        //     // delete ctx[me];
        //     func();
        // } else {
        //     // normal function, bind
        //     func.bind(ctx)(); /* otherwise arrow functions can't be bound */
        // }
    }
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

        setTimeout: ((func: () => void, ms: number, ...args: any[]) => {
            timeouts[window.setTimeout(() => void runFuncSafe(func, ctx), ms, ...args)] = true;
        }).bind(window),
        clearTimeout: ((handle: number) => {
            delete timeouts[handle];
            window.clearTimeout(handle);
        }).bind(window),
        setInterval: ((func: () => void, ms: number, ...args: any[]) => {
            intervals[window.setInterval(() => void runFuncSafe(func, ctx), ms, ...args)] = true;
        }).bind(window),
        clearInterval: ((handle: number) => {
            delete intervals[handle];
            window.clearInterval(handle);
        }).bind(window)
    }

    try {
        (window as any).__GRAVITY.evalNoStrict(`with(ctx){(function(){${code}}).bind(ctx)()}`, {
            ctx
        });
    } catch(e) {
        if(testing) {
            console.log('js code run:', code);
            console.log('error encountered:', e.name + ': ' + e.message);
            genericStatus(['Error encountered while loading level.', 'See console for details.'], Status.ERROR);
        } else {
            console.log('error encountered:', e.name + ': ' + e.message);
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