import { body } from '../main';
import btn from './create-btn';

export default async function(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const parent = document.createElement('div');
        parent.className = 'widget';
        const blockingEl = document.createElement('div');
        blockingEl.className = 'background-blocker';
        body.appendChild(blockingEl);

        const textParent = document.createElement('div');
        textParent.className = 'widget-text';
        textParent.appendChild(document.createTextNode(text));
        parent.appendChild(textParent);

        const buttons = document.createElement('div');
        buttons.className = 'widget-btns'
        buttons.appendChild(btn('Ok', () => {
            body.removeChild(blockingEl);
            body.removeChild(parent);
            resolve();
        }));
        parent.appendChild(buttons);

        body.appendChild(parent);
    });
}