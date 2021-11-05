import { registerLevel } from '../levels';

registerLevel({
    name: 'Level 1',
    level: 1,
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
        }
    ]
});