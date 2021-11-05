import { body } from '../main';
import btn from './create-btn';

export default async function(prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const blockingEl = document.createElement('div');
        blockingEl.className = 'background-blocker';
        body.appendChild(blockingEl);

        const parent = document.createElement('div');
        parent.className = 'widget';
        const textParent = document.createElement('div');
        textParent.className = 'widget-text';
        textParent.appendChild(document.createTextNode(prompt));
        parent.appendChild(textParent);

        const textbox = document.createElement('input');
        textbox.type = 'text';
        textbox.className = 'widget-text-input';
        textbox.placeholder = 'name';
        parent.appendChild(textbox);

        function cleanup() {
            body.removeChild(parent);
            body.removeChild(blockingEl);
        }

        const buttons = document.createElement('div');
        buttons.appendChild(btn('Ok', () => {
            cleanup();
            resolve(textbox.value);
        }));
        buttons.appendChild(btn('Cancel', () => {
            cleanup();
            reject();
        }));
        parent.appendChild(buttons);
        body.appendChild(body);
    });
}