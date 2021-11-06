import { body } from '../main';
import btn from './create-btn';

export const enum ConfirmExit {
    CANCEL = 0,
    SAVE_AND_EXIT = 1,
    EXIT = 2
}
export default async function(): Promise<ConfirmExit> {
    return new Promise((resolve, reject) => {
        const blocker = document.createElement('div');
        blocker.className = 'background-blocker';
        body.appendChild(blocker);

        const parent = document.createElement('div');
        parent.className = 'widget center';
        const content = document.createElement('div');
        content.className = 'widget-content';
        const buttons = document.createElement('div');
        buttons.className = 'widget-btns';

        function cleanup() {
            body.removeChild(blocker);
            body.removeChild(parent);
        }

        buttons.appendChild(btn('Cancel', () => {
            cleanup();
            resolve(ConfirmExit.CANCEL);
        }));
        buttons.appendChild(btn('Save & Exit', () => {
            cleanup();
            resolve(ConfirmExit.SAVE_AND_EXIT)
        }));
        buttons.appendChild(btn('Exit', () => {
            cleanup();
            resolve(ConfirmExit.EXIT);
        }));
        const text = document.createElement('div');
        text.className = 'widget-text';
        text.appendChild(document.createTextNode('Are you sure you want to exit?'));
        content.appendChild(text);
        content.appendChild(buttons);
        parent.appendChild(content);
        body.appendChild(parent);
    });
}