import { registerLevel } from '../levels';

registerLevel({
    name: 'Gravity',
    level: 3,
    center: {
        x: 750,
        y: 400
    },
    objects: [
        {
            type: 'friendly-station',
            x: 300,
            y: 400
        }, {
            type: 'enemy-station',
            x: 1200,
            y: 400
        }, {
            type: 'moon',
            x: 750,
            y: 600
        }, {
            type: 'moon',
            x: 750,
            y: 200
        }
    ]
});