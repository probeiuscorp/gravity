import { Vector } from '../data';
import { registerLevel } from '../levels';

interface CacheLevel07 {
    forward: boolean
}

registerLevel({
    name: 'Level 7',
    level: 7,
    center: {
        x: 0,
        y: 0
    },
    objects: [
        {
            type: 'friendly-station',
            x: 0,
            y: -300
        },
        {
            type: 'enemy-station',
            x: 0,
            y: 100,
            aiInit: (station, cache) => {
                // station.immovable = false;
                cache.forward = false;
                setTimeout(() => {
                    cache.forward = true;
                    setInterval(() => {
                        cache.forward = !cache.forward;
                        station.fireAt(new Vector(0, -300));
                    }, 8000);
                }, 4000);
            },
            aiTick: (station, cache) => {
                if(cache.forward) {
                    station.x += 4;
                } else {
                    station.x -= 4;
                }
            }
        },
        {
            type: 'moon',
            x: 0,
            y: 300
        }
    ]
});