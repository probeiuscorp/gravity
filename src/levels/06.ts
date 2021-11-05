import { registerLevel } from '../levels'

registerLevel({
    name: 'Level 6',
    level: 6,
    center: {
        x: 0,
        y: 0
    },
    objects: [
        {
            type: 'friendly-station',
            x: -150,
            y: -300
        },
        {
            type: 'friendly-station',
            x: 150,
            y: -300
        },
        {
            type: 'enemy-station',
            x: 150,
            y: 300
        },
        {
            type: 'enemy-station',
            x: -150,
            y: 300
        },
        {
            type: 'planet',
            x: 0,
            y: 0
        },
        {
            type: 'asteroid',
            x: -230,
            y: 0
        },
        {
            type: 'asteroid',
            x: -290,
            y: 20
        },
        {
            type: 'asteroid',
            x: 230,
            y: 0
        },
        {
            type: 'asteroid',
            x: 290,
            y: 20
        }
    ]
});