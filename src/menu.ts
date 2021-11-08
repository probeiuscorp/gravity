import { Image, Vector } from './data';
import * as Main from './main';
import * as Resources from './resources';

export interface Button {
    render: (x: number, y: number, mouse: Vector) => void;
    unbind: () => void;
    enabled: boolean;
}

export interface ButtonClass {
    new(ctx: CanvasRenderingContext2D, text: string, onClick: () => void): Button;
    readonly WIDTH: number,
    readonly HEIGHT: number,
    prototype: Button
}

// abstract class Button {
//     constructor(width: number, height: number, adjustment: number)
// }

function makeButtonType(base: Image, hover: Image[], OFFSET: number): ButtonClass {
    const w = base.width * 2;
    const h = base.height * 2;
    // TypeScript does not want to behave!
    return (class {
        private ctx: CanvasRenderingContext2D;
        public static readonly WIDTH = w - 2 * OFFSET;
        public static readonly HEIGHT = h;
        public enabled = true;
        private x: number;
        private y: number;
        private text: string;
        private last: number = Date.now();
        private frame = 0;

        constructor(ctx: CanvasRenderingContext2D, text: string, onClick: () => void) {
            this.ctx = ctx;
            this.text = text;
            Main.onClick(this, (e) => {
                if(this.enabled && e.pos.x > this.x && e.pos.y > this.y && e.pos.x + 2 * OFFSET < this.x + w && e.pos.y < this.y + h && e.lmb) {
                    onClick();
                    Resources.Sounds.CLICK();
                }
            });
        }

        public render(x: number, y: number, mouse: Vector) {
            this.x = x;
            this.y = y;
            if(mouse.x > x && mouse.y > y && mouse.x + 2 * OFFSET < x + w && mouse.y < y + h) {
                Main.setCursor('pointer');
                if(Date.now() - this.last > 200) {
                    this.frame++;
                    this.last = Date.now();
                }
                this.ctx.drawImage(hover[this.frame % hover.length], x - OFFSET, y, w, h);
            } else {
                this.last = Date.now();
                this.ctx.drawImage(base, x - OFFSET, y, w, h);
            }
            if(this.text) {
                this.ctx.fillStyle = 'white';
                this.ctx.font = '24px monospace';
                this.ctx.textBaseline = 'middle';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(this.text, x + w / 2 - OFFSET, y + h / 2);
            }
        }

        public unbind() {
            Main.removeClickListener(this);
        }
    });
}

export const BigButton = makeButtonType(Resources.BUTTON, [
    Resources.BUTTON_HOVER_1,
    Resources.BUTTON_HOVER_2,
    Resources.BUTTON_HOVER_3,
    Resources.BUTTON_HOVER_2
], 24);

export const LevelSelectBtn = makeButtonType(Resources.ALT_BTN, [
    Resources.ALT_BTN_HOVER_1,
    Resources.ALT_BTN_HOVER_2,
    Resources.ALT_BTN_HOVER_3,
    Resources.ALT_BTN_HOVER_2
], 24);

export type SetupCallback<T, Options extends object> = (ctx: CanvasRenderingContext2D, state: Partial<T>, opts: Options) => void;
export type RenderCallback<T> = (ctx: CanvasRenderingContext2D, mousePos: Vector, state: Partial<T>) => void;
export type UnbindCallback<T> = (ctx: CanvasRenderingContext2D, state: Partial<T>) => void;
export class View<T extends object, Options extends object = {}> {
    private setup: SetupCallback<Partial<T>, Options>;
    private paint: RenderCallback<T>;
    private unbind: UnbindCallback<Partial<T>>;
    constructor(setup: SetupCallback<T, Options>, paint: RenderCallback<T>, unbind: UnbindCallback<T>) {
        this.setup = setup;
        this.paint = paint;
        this.unbind = unbind;
    }

    public bind(ctx: CanvasRenderingContext2D, options: Options) {
        let state = {};
        this.setup(ctx, state, options);
        return new BoundView<T>(state, this.unbind, this.paint, ctx);
    }
}

class BoundView<T extends object> {
    private paintCB: RenderCallback<T>;
    private ctx: CanvasRenderingContext2D;
    private state: Partial<T>;
    private unbindCB: UnbindCallback<T>;

    constructor(state: Partial<T>, unbind: UnbindCallback<T>, paint: RenderCallback<T>, ctx: CanvasRenderingContext2D) {
        this.paintCB = paint;
        this.unbindCB = unbind;
        this.state = state;
        this.ctx = ctx;
    }

    public paint(mousePos: Vector) {
        this.paintCB(this.ctx, mousePos, this.state);
    }

    public unbind(): void {
        this.unbindCB(this.ctx, this.state);
    }
}