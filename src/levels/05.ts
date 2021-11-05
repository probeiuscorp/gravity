import { registerLevel } from '../levels';

registerLevel({
    name: 'Thinking with portals',
    level: 5,
    center: {
        x: 1000,
        y: 450
    },
    objects: [
        {
            type: 'moon',
            x: 500,
            y: 600
        }, {
            type: 'moon',
            x: 1500,
            y: 600
        }, {
            type: 'planet',
            x: 1000,
            y: 500
        }, {
            type: 'asteroid',
            x: 1100,
            y: 540
        }, {
            type: 'asteroid',
            x: 1170,
            y: 520
        }, {
            type: 'asteroid',
            x: 1230,
            y: 500
        }, {
            type: 'asteroid',
            x: 900,
            y: 540
        }, {
            type: 'asteroid',
            x: 830,
            y: 520
        }, {
            type: 'asteroid',
            x: 770,
            y: 500
        }, {
            type: 'friendly-station',
            x: 1000,
            y: 800
        }, {
            type: 'enemy-station',
            x: 1000,
            y: 150
        }
    ]
});