import { body, colors } from '../main';
import btn from './create-btn';

export const enum Status {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    SUCCESS = 3
}
export default async function(text: string[], status?: Status): Promise<void> {
    return new Promise((resolve, reject) => {
        const parent = document.createElement('div');
        parent.style.flexDirection = 'row';
        parent.className = 'widget center';
        const blockingEl = document.createElement('div');
        blockingEl.className = 'background-blocker';
        body.appendChild(blockingEl);

        const icon = document.createElement('div');
        icon.className = 'widget-icon';
        if(status !== undefined) {
            const statusEl = document.createElement('i');
            if(status === Status.ERROR) {
                statusEl.className = 'bi bi-x-circle-fill';
                statusEl.style.color = colors.RED;
            } else if(status === Status.WARN) {
                statusEl.className = 'bi bi-exclamation-circle-fill';
                statusEl.style.color = colors.WARN;
            } else if(status === Status.INFO) {
                statusEl.className = 'bi bi-info-circle-fill';
                statusEl.style.color = colors.INFO;
            } else if(status === Status.SUCCESS) {
                statusEl.className = 'bi bi-check-circle-fill';
                statusEl.style.color = colors.SUCCESS;
            }
            icon.appendChild(statusEl);
        }
        parent.appendChild(icon);

        const content = document.createElement('div');
        content.className = 'widget-content';
        const textParent = document.createElement('div');
        textParent.className = 'widget-text';
        const len = text.length;
        for(let i=0;i<len;i++) {
            textParent.appendChild(document.createTextNode(text[i]));
            if(i !== len - 1) textParent.appendChild(document.createElement('br'));
        }
        content.appendChild(textParent);
        parent.appendChild(content);

        const buttons = document.createElement('div');
        buttons.className = 'widget-btns'
        buttons.appendChild(btn('Ok', () => {
            body.removeChild(blockingEl);
            body.removeChild(parent);
            resolve();
        }));
        content.appendChild(buttons);

        body.appendChild(parent);
    });
}