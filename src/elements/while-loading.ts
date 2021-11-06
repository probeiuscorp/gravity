import { body, loadingEl } from '../main';

type AsyncFunction = () => Promise<void>;
export default function(callback: AsyncFunction) {
    const blockingEl = document.createElement('div');
    blockingEl.className = 'background-blocker';
    body.appendChild(blockingEl);
    loadingEl.style.display = 'initial';
    callback().then(() => {
        console.log('done blocking');
        body.removeChild(blockingEl);
        loadingEl.style.display = 'none';
    });
}