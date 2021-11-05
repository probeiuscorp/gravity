export default function btn(text: string, handler: (e: MouseEvent) => void): HTMLAnchorElement {
    const el = document.createElement('a');
    el.className = 'monaco-button widget-btn';
    el.ariaRoleDescription = 'button';
    el.title = text;
    el.tabIndex = 0;
    el.addEventListener('click', handler);
    el.innerText = text;
    return el;
}