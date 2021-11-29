import { body, colors } from '../main';
import btn from './create-btn';

const MB = 2**20;

export default async function(prompt: string): Promise<{ name: string, description?: string, thumbnail?: File}> {
    return new Promise((resolve, reject) => {
        const status = document.createElement('div');
        status.style.fontSize = '14px';
        
        function ok() {
            const charsValid = textbox.value.match(/^[A-Za-z0-9\-_:&$\+~`!#\?\.\, ]+$/g);
            const shortEnough = textbox.value.length <= 48;
            const dv = description.value;
            const descriptionNoContain = dv.indexOf('<') === -1 && dv.indexOf('>') === -1;
            const descriptionShortEnough = dv.length <= 2048;
            const file = thumbnailInput.files[0];
            const thumbnailSmallEnough = file === undefined || file.size <= MB;
            if(charsValid && shortEnough && descriptionNoContain && descriptionShortEnough && thumbnailSmallEnough) {
                cleanup();
                resolve({ name: textbox.value, description: dv, thumbnail: file });
            } else {
                status.textContent = '';
                const msg = document.createElement('div');
                msg.className = 'widget-text';
                const icon = document.createElement('i');
                icon.className = 'bi bi-x-circle-fill';
                icon.style.color = colors.RED;
                msg.appendChild(icon);
                if(!charsValid) {
                    msg.appendChild(document.createTextNode(' Name contains unacceptable characters.'));
                } else if(!shortEnough) {
                    msg.appendChild(document.createTextNode(' Name must not exceed 48 characters.'));
                } else if(!descriptionNoContain) {
                    msg.appendChild(document.createTextNode(' Description must not contain "<" or ">".'));
                } else if(!descriptionShortEnough) {
                    msg.appendChild(document.createTextNode(' Description must not exceed 2048 characters.'));
                } else if(!thumbnailSmallEnough) {
                    msg.appendChild(document.createTextNode(' Thumbnail must not be larger than 1MB.'));
                }
                msg.style.color = colors.RED;
                status.appendChild(msg);
            }
        }

        function cancel() {
            cleanup();
            reject();
        }

        function listener(e: KeyboardEvent) {
            if(e.key === 'Escape') {
                cancel();
            }
        }

        function cleanup() {
            body.removeChild(parent);
            body.removeChild(blockingEl);
            document.removeEventListener('keyup', listener);
        }

        document.addEventListener('keyup', listener);

        const content = document.createElement('div');
        content.className = 'widget-content';

        const blockingEl = document.createElement('div');
        blockingEl.className = 'background-blocker';
        body.appendChild(blockingEl);

        const parent = document.createElement('div');
        parent.style.width = '360px'
        parent.className = 'widget center';
        const textParent = document.createElement('div');
        textParent.className = 'widget-text';
        textParent.appendChild(document.createTextNode(prompt));
        content.appendChild(textParent);

        const textbox = document.createElement('input');
        textbox.type = 'text';
        textbox.className = 'widget-text-box';
        textbox.addEventListener('keyup', (e) => {
            if(e.key === 'Enter') {
                ok();
            }
        });

        const description = document.createElement('textarea');
        description.className = 'widget-text-box widget-textarea';
        description.placeholder = 'No description provided';
        
        content.appendChild(textbox);

        const textDescription = document.createElement('div');
        textDescription.className = 'widget-text';
        textDescription.textContent = 'Description (optional)';

        content.appendChild(textDescription);
        content.appendChild(description);

        const headerThumbnail = document.createElement('div');
        headerThumbnail.className = 'widget-text';
        headerThumbnail.textContent = 'Thumbnail - 250x155 (optional)';

        const id = 'thumbnail-input-file';
        const thumbnailLabel = document.createElement('label');
        thumbnailLabel.htmlFor = id;
        thumbnailLabel.className = 'widget-input-file monaco-button widget-btn';
        
        const icon = document.createElement('i');
        icon.className = 'bi bi-cloud-upload';
        thumbnailLabel.appendChild(icon);
        const thumbnailLabelText = document.createElement('span');
        thumbnailLabelText.textContent = ' Upload file';
        thumbnailLabel.appendChild(thumbnailLabelText);

        const thumbnailInput = document.createElement('input');
        thumbnailInput.type = 'file';
        thumbnailInput.accept = '.png,.jpg';
        thumbnailInput.id = id;
        thumbnailInput.addEventListener('change', () => {
            const file = thumbnailInput.files[0];
            if(file) {
                thumbnailLabelText.textContent = ' File: ' + file.name;
            } else {
                thumbnailLabelText.textContent = ' Upload file';
            }
        });

        content.appendChild(headerThumbnail);
        content.appendChild(thumbnailLabel);
        content.appendChild(thumbnailInput);

        const buttons = document.createElement('div');
        buttons.className = 'widget-btns';
        buttons.appendChild(btn('Ok', ok));
        buttons.appendChild(btn('Cancel', cancel));
        content.appendChild(status);
        content.appendChild(buttons);
        parent.appendChild(content);
        body.appendChild(parent);
    });
}