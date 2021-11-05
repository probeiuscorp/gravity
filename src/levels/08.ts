import { registerLevel } from '../levels';

registerLevel({
    name: 'Level 8',
    level: 8,
    center: {
        x: 0,
        y: 0
    },
    objects: [
        // {
        //     type: 'black-hole',
        //     x: 0,
        //     y: 250
        // },
        {
            type: 'friendly-station',
            x: -400,
            y: -250
        },
        {
            type: 'enemy-station',
            x: 400,
            y: -250
        },
        {
            type: 'antigravity',
            x: 0,
            y: 0
        }
    ]
});