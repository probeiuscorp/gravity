export const loadingEl = document.getElementById('loading');
export const body = document.getElementsByTagName('body')[0]
body.classList.add('loaded');

const moveListeners: Map<any, (newPos: Vector) => void> = new Map();
const clickListeners: Map<any, (e: ClickEvent) => void> = new Map();
const keybindListeners: Map<any, Keybind> = new Map();

// function<T extends (...args: any[]) => any>(func: T): (...funcArgs: Parameters<T>) => ReturnType<T>
function debounce<T extends (...args: any[]) => any>(func: (...args: Parameters<T>) => ReturnType<T>, wait: number, immediate: boolean): (...args: Parameters<T>) => void {
    let debounceTime: number = null;
    let timeout: number;
    return function(...args) {
        if(debounceTime) {
            if(debounceTime + wait < Date.now()) {
                func.call(this, ...args);
                debounceTime = Date.now();
            } else if(timeout) {
                clearTimeout(timeout);
                timeout = window.setTimeout(() => {
                    func.call(this, ...args);
                    debounceTime = Date.now();
                }, wait);
                timeout = null;
            }
        } else {
            func.call(this, ...args);
            debounceTime = Date.now();
        }
    }
}

export interface Keybind {
    match: (e: KeyboardEvent) => boolean;
    execute: (e: KeyboardEvent) => void;
}

export class BasicBind implements Keybind {
    match;
    execute;
    
    constructor(key: string, modifiers: { ctrl?: boolean, shift?: boolean, alt?: boolean }, callback: (e: KeyboardEvent) => void) {
        this.match = (e: KeyboardEvent) => {
            return e.key === key && e.ctrlKey === (modifiers.ctrl ?? false) && e.shiftKey === (modifiers.shift ?? false) && e.altKey === (modifiers.alt ?? false);   
        }

        this.execute = callback;
    }
}

export interface ClickEvent {
    lmb: boolean;
    rmb: boolean;
    mmb: boolean;
    pos: Vector;
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
}

export function onClick(identifier: any, callback: (e: ClickEvent) => void) {
    clickListeners.set(identifier, callback);
}

export function dropAllListeners() {
    clickListeners.clear();
}

export function removeClickListener(identifier: any) {
    clickListeners.delete(identifier);
}

import { Vector } from './data';
import { View } from './menu';
import saferLevel from './safer-level';
import { mainMenu, playingGame } from './view';

export const canvas = document.getElementById('canvas') as HTMLCanvasElement;
export var currentPos: Vector = new Vector(0, 0);
export const ctx = canvas.getContext('2d', { alpha: true });
export var cursor: string = '';

export function setCursor(_cursor: string) {
    cursor = _cursor;
}

let view = mainMenu.bind(ctx, {});

export function setView<T extends object>(newView: View<any, T>, options: T) {
    view.unbind();
    view = newView.bind(ctx, options);
}

canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('mouseup', (e) => {
    const clickEvent: ClickEvent = {
        lmb: e.button === 0,
        rmb: e.button === 2,
        mmb: e.button === 1,
        pos: new Vector(e.x, e.y),
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey
    };
    const it = clickListeners.values();
    const listeners = [];
    for(const listener of it) listeners.push(listener);
    // Otherwise listeners just get appended, called, appended, called, appended...
    for(const listener of listeners) listener(clickEvent);
});
document.addEventListener('keydown', (e) => {
    const keyListeners = keybindListeners.values();
    const listeners: Keybind[] = [];
    for(const listener of keyListeners) listeners.push(listener);
    for(const listener of listeners) {
        if(listener.match(e)) {
            listener.execute(e);
        }
    }
});

export function onMove(identifier: any, callback: (newPos: Vector) => void) {
    moveListeners.set(identifier, callback);
}

const mouseMove = debounce(function(e: MouseEvent) {
    const newPos = new Vector(e.x, e.y);
    const listeners = moveListeners.values();
    for(const listener of listeners) listener(newPos);
    currentPos = newPos;
}, 50, true);
canvas.addEventListener('mousemove', mouseMove);

export function removeMoveListener(identifier: any) {
    moveListeners.delete(identifier);
}

export function onKey(identifier: any, bind: Keybind) {
    keybindListeners.set(identifier, bind);
}

export function removeKeyListener(identifier: any) {
    keybindListeners.delete(identifier);
}

function paint() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    cursor = '';
    ctx.imageSmoothingEnabled = false;
    view.paint(currentPos);
    canvas.style.cursor = cursor;
}

updateCanvases();
paint();

let isRendering = true;
export function disableRendering() {
    if(isRendering) {
        isRendering = false;
        clearInterval(renderer);
    }
}

export function enableRendering() {
    if(!isRendering) {
        isRendering = true;
        renderer = setInterval(paint, 1e3 / 25);
    }
}

window.addEventListener('resize', () => {
    updateCanvases();
    paint();
});

let renderer = setInterval(paint, 1e3 / 25);

function updateCanvases() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}

export const colors = {
    RED: '#f14c4c',
    WARN: '#ffc107',
    INFO: '#17a2b8',
    SUCCESS: '#28a745'
}

export { playingGame };
export { saferLevel };