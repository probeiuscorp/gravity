import { registerLevel } from '../levels'

registerLevel({
    name: 'Level 4',
    level: 4,
    center: {
        x: 0,
        y: 200
    },
    objects: [
        {
            type: 'moon',
            x: 0,
            y: 0
        }, {
            type: 'asteroid',
            x: -70,
            y: 70
        }, {
            type: 'asteroid',
            x: -60,
            y: 130
        }, {
            type: 'asteroid',
            x: 20,
            y: 220
        }, {
            type: 'asteroid',
            x: 0,
            y: 275
        }, {
            type: 'asteroid',
            x: 20,
            y: 330
        }, {
            type: 'asteroid',
            x: 60,
            y: 130
        }, {
            type: 'asteroid',
            x: -100,
            y: 380
        }, {
            type: 'friendly-station',
            x: -500,
            y: 200
        }, {
            type: 'enemy-station',
            x: 500,
            y: 200
        }
    ]
});