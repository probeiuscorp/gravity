import { RateLevel } from '../../api/common';
import { body } from '../main';
import btn from './create-btn';
import genericStatus, { Status } from './generic-status';
import whileLoading from './while-loading';

const colors = [
    'rgb(255, 6, 0)',
    'rgb(255, 66, 0)',
    'rgb(255, 135, 0)',
    'rgb(255, 203, 0)',
    'rgb(235, 253, 1)',
    'rgb(165, 253, 3)',
    'rgb(96, 254, 5)',
    'rgb(26, 255, 7)',
    'rgb(41, 196, 63)',
    'rgb(62, 164, 92)',
    'rgb(78, 144, 112)',
    'rgb(89, 127, 126)',
    'rgb(98, 113, 139)',
    'rgb(106, 101, 150)',
    'rgb(114, 90, 161)'
];

const messages = [
    'Spawn of Satan',
    'Very bad',
    'Bad',
    'Poor',
    'Not good',
    'Mediocre',
    'Decent',
    'Good',
    'Very good',
    'Amazing',
    'Astounding',
    'Incredible',
    'Legendary',
    'The bee\'s knees',
    'The Holy Grail'
];

export default function(id: string): Promise<boolean> {
    return new Promise((resolve) => {
        const root = document.createElement('div');
        root.className = 'rating widget center';

        const header = document.createElement('div');
        header.className = 'rating-header';
        header.appendChild(document.createTextNode('Rate this level'));
        root.appendChild(header);

        const text = document.createElement('div');
        text.className = 'rating-text';
        const rating = document.createElement('div');
        rating.className = 'rating-circles';
        let circles: HTMLElement[] = [];
        let bars: HTMLElement[] = [];
        let selected: number | null = null;

        for(let i=0;i<15;i++) {
            const circle = document.createElement('div');
            circle.className = 'rating-circle inert';
            // circle.style.background = colors[i];
            circle.style.borderColor = colors[i];
            rating.appendChild(circle);
            circles.push(circle);

            const prevCircles = [...circles];
            const prevBars = [...bars];
            circle.addEventListener('mouseenter', () => {
                for(const item of circles) {
                    item.classList.add('inert');
                }
                for(const item of prevCircles) {
                    item.classList.remove('inert');
                }

                for(const item of bars) {
                    item.classList.add('inert');
                }
                for(const item of prevBars) {
                    item.classList.remove('inert');
                }
                text.textContent = messages[i];
            });

            circle.addEventListener('click', () => {
                if(selected === i) {
                    selected = null;
                } else {
                    selected = i;
                }
            });

            if(i < 14) {
                const bar = document.createElement('div');
                bar.style.backgroundColor = colors[i];
                bar.className = 'rating-circle-bar inert';
                rating.appendChild(bar);
                bars.push(bar);
            }
        }

        rating.addEventListener('mouseleave', () => {
            if(selected === null) {
                for(const circle of circles) {
                    circle.classList.add('inert');
                }
                for(const bar of bars) {
                    bar.classList.add('inert');
                }
                text.textContent = '';
            } else {
                for(let i=0;i<=selected;i++) {
                    if(i > 0) bars[i-1].classList.remove('inert');
                    circles[i].classList.remove('inert');
                }
                for(let i=selected+1;i<15;i++) {
                    if(i > 0) bars[i-1].classList.add('inert');
                    circles[i].classList.add('inert');
                }
                text.textContent = messages[selected];
            }
        });

        function cleanup() {
            body.removeChild(blockingEl);
            body.removeChild(root);
        }

        const buttons = document.createElement('div');
        buttons.className = 'widget-btns';
        buttons.appendChild(btn('Cancel', () => {
            cleanup();
            resolve(false);
        }));
        buttons.appendChild(btn('Rate', () => {
            console.log(selected);
            if(selected !== null) {
                cleanup();
                resolve(true);
                whileLoading((doneLoading) => {
                    fetch('/api/rate-level', {
                        method: 'POST',
                        body: JSON.stringify({
                            rating: selected + 1,
                            id
                        } as RateLevel),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).then((res) => {
                        if(res.ok) {
                            genericStatus(['Level rated.'], Status.SUCCESS);
                        } else {
                            genericStatus(['Server responded with error ' + res.status + '.'], Status.ERROR);
                        }
                    }).catch(() => {
                        genericStatus(['Failed to connect with server.'], Status.ERROR);
                    }).finally(doneLoading);
                });
            }
        }));

        root.appendChild(rating);
        root.appendChild(text);
        root.appendChild(buttons);

        const blockingEl = document.createElement('div');
        blockingEl.className = 'background-blocker';
        body.appendChild(blockingEl);
        body.appendChild(root);
    });
}