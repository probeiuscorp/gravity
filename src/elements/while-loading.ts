import { body, loadingEl } from '../main';

export default function<T = void>(callback: (doneLoading: (ret: T) => void) => void): Promise<T> {
    return new Promise((resolve) => {
        const blockingEl = document.createElement('div');
        blockingEl.className = 'background-blocker';
        body.appendChild(blockingEl);
        loadingEl.style.display = 'initial';
        callback((ret) => {
            body.removeChild(blockingEl);
            loadingEl.style.display = 'none';
            resolve(ret);
        });
    });
}