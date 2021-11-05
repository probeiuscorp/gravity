let loaded = 0;
let total = 0;
let allInitiated = false;

let callbacks: (() => void)[] = [];
export function onFinishedLoading(callback: () => void) {
    callbacks.push(callback);
}

function finishedLoading() {
    loaded++;
    if(loaded === total && allInitiated) {
        for(const callback of callbacks) {
            callback();
        }
    }
}

export function loadImage(url: string) {
    let img = new Image();
    img.src = '/public/img/' + url;
    total++;
    img.onload = finishedLoading;
    return img;
}

export type Sound = () => void;
export function loadSound(url: string): Sound {
    let sound = new Audio();
    sound.src = '/public/sound/' + url;
    total++;
    sound.addEventListener('loadeddata', finishedLoading);
    return function() {
        const el = (sound.cloneNode(false) as HTMLAudioElement);
        el.volume = 0.15;
        el.play();
    };
}

export const STATION_FRIENDLY = loadImage('station-friendly.png');
export const STATION_ENEMY = loadImage('station-enemy.png');
export const STATION_DESTROY_FRIENDLY = loadImage('station-destroy-friendly.png');
export const STATION_DESTROY_ENEMY = loadImage('station-destroy-enemy.png')
export const STATION_SELECTED = loadImage('station-selected.png');
export const MOON_FRAME_1 = loadImage('moon-1.png');
export const MOON_FRAME_2 = loadImage('moon-2.png');
export const PLANET_FRAME_1 = loadImage('planet-1.png');
export const PLANET_FRAME_2 = loadImage('planet-2.png');
export const BLACK_HOLE_FRAME_1 = loadImage('black-hole.png');
export const BLACK_HOLE_FRAME_2 = loadImage('black-hole-2.png');
export const SHELL = loadImage('shell.png');
export const BLAST = loadImage('blast.png');
export const ASTEROID_1 = loadImage('asteroid-1.png');
export const ASTEROID_2 = loadImage('asteroid-2.png');
export const ASTEROID_3 = loadImage('asteroid-3.png');
export const ASTEROID_4 = loadImage('asteroid-4.png');
export const DEBRIS_1 = loadImage('debris-1.png');
export const DEBRIS_2 = loadImage('debris-2.png');
export const DEBRIS_3 = loadImage('debris-3.png');
export const DEBRIS_4 = loadImage('debris-4.png');
export const BUTTON = loadImage('button.png');
export const BUTTON_HOVER_1 = loadImage('button-1.png');
export const BUTTON_HOVER_2 = loadImage('button-2.png');
export const BUTTON_HOVER_3 = loadImage('button-3.png');
export const ALT_BTN = loadImage('button-select.png');
export const ALT_BTN_HOVER_1 = loadImage('button-select-1.png');
export const ALT_BTN_HOVER_2 = loadImage('button-select-2.png');
export const ALT_BTN_HOVER_3 = loadImage('button-select-3.png');
export const BACKGROUND = loadImage('background.gif'); // while not used, should force the background to be present when loading is finished
export const ANTI_GRAVITY = loadImage('antimatter.png');

export const Sounds = {
    CLICK: loadSound('click.wav'),
    DAMAGE: loadSound('damage.wav'),
    DESTROYED: loadSound('destroyed.wav'),
    FIRE: loadSound('fire.wav')
};

allInitiated = true;
if(loaded === total) {
    for(const callback of callbacks) callback();
}