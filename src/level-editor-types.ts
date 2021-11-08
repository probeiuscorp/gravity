export default 
`/// <reference no-default-lib="true"/>
/// <reference lib="es5"/>

declare namespace gravity {
    type radians = number;
    interface Image = {
        url: string
    };
    type Sound = (volume?: number) => void;
    type CanvasRenderingContext2D = any;
    type PostponedRender = (ctx: CanvasRenderingContext2D) => void;

    class Renderer {
        public drawImage(location: Vector, img: Image, scale: number, rotation?: radians): void;
        public drawOnUI(callback: PostponedRender): void;
    }

    interface Simulation {
        objects: VBody[];
        renderer: Renderer;
        camera: Vector;
        frame: number;

        addBody(body: VBody): void;
    }

    /**
     * Immutable representation of a simple (x, y) pair. The default Vector methods will *not* change any Vector.
     */
    class Vector {
        public x: number;
        public y: number;

        constructor(x: number, y: number);

        public static add(v1: Vector, v2: Vector): Vector;
        public static subtract(v1: Vector, v2: Vector): Vector;
        public static magnitude(v: Vector): number;
        public static distance(v1: Vector, v2: Vector): number;
        public static ofMaxLength(v: Vector, length: number): Vector;

        public add(other: Vector): Vector;
        public subtract(other: Vector): Vector;
        public distance(other: Vector): Vector;
        public magnitude(): number;
        public scale(scalar: number): Vector;
        /**
         * Inverse of \`scale()\`.
         */
        public shrink(scalar: number): Vector;
        public normalize(): Vector;
        public ofMaxLength(max: number): Vector;
        public toString(): string;
    }

    abstract class VBody extends Vector {
        /**
         * If \`true\` the default \`onTick()\` will prevent this body from being affected by any forces applied to it.
         */
        public immovable: boolean;
        /**
         * If \`true\` this body will not have forces of gravity applied to it by gravity generators.
         */
        public ignoresGravity: boolean;
        public velocity: Vector;
        public mass: number;
        public netForce: Vector;
        /**
         * If \`true\`, other bodies will destroy themselves when coming into contact with this body.
         */
        public solid: boolean;
        /**
         * If \`true\` this body will destroy itself in its next \`onTick()\`.
         */
        public destroy: boolean;
        /**
         * Solid body collision distance. Has no effect if \`solid\` is set to false.
         */
        public radius: number;

        /**
         * Called when the object collides with another body.
         */
        public onCollision(): void;
        /**
         * Called when the body is hit with a projectile.
         */
        public onHit(): void;

        /**
         * Phase to apply forces to other bodies.
         */
        protected preTick(): void;
        /**
         * *Should not* affect other bodies. Should simply update itelf. Return \`false\` to dispose of the body. These of course can be overridden.
         */
        protected onTick(time: number): boolean;
        protected tick(time: number, others: VBody[]): boolean;

        protected abstract render(renderer: Renderer, frame: number): void;
    }

    /**
     * Has built-in tick methods apply gravitational forces on every other bodies. These of course can be overridden.
     * Methods re-implemented:
     *  - preTick()
     */
    class GravityGenerator extends VBody {
        protected render(renderer: Renderer, frame: number): void;
    }

    /**
     * Simply overrides \`render\` to rotate the \`img\` towards \`velocity\`.
     */
    class Projectile extends VBody {
        constructor(x: number, y: number, velocity: Vector, mass: number, simulation: Simulation, img: Image);

        protected render(renderer: Renderer, frame: number): void;
    }

    /**
     * Default shell launched by Stations. 
     */
    class Shell extends Projectile {
        constructor(x: number, y: number, velocity: Vector, mass: number, simulation: Simulation);
    }

    /**
     * Built-in methods to ignore all forces and destroy other bodies that come into contact with it.
     */
    class Obstacle extends VBody {
        constructor(x: number, y: number, simulation: Simulation);

        protected render(renderer: Renderer, frame: number): void;
    }

    /**
     * Built-in methods to ignore all forces and destroy other bodies that come into contact with it.
     */
    class Moon extends VBody {
        constructor(x: number, y: number, simulation: Simulation);

        protected render(renderer: Renderer, frame: number): void;
    }

    /**
     * Built-in methods to ignore all forces and destroy other bodies that come into contact with it.
     */
    class Planet extends VBody {
        constructor(x: number, y: number, simulation: Simulation);

        protected render(renderer: Renderer, frame: number): void;
    }

    /**
     * Built-in methods to ignore all forces and destroy other bodies that come into contact with it.
     */
    class BlackHole extends VBody {
        constructor(x: number, y: number, simulation: Simulation);

        protected render(renderer: Renderer, frame: number): void;
    }

    /**
     * Overrides \`onTick()\` method.
     */
    abstract class Destructible extends VBody {
        public maxHealth: number;
        public health: number;
    }

    class Station extends Destructible {
        public static readonly totalShots: number;
        public shotsLeft: number;
        public friendly: boolean;
        public selected: boolean;

        constructor(x: number, y: number, friendly: boolean, simulation: Simulation);

        public fireAt(point: Vector): void;

        protected render(renderer: Renderer, frame: number): void;
    }

    namespace level {
        interface BodyType<T, K, V> {
            type: K,
            x: number,
            y: number,
            startup?: (state: T, object: V) => void
        }

        type Body<T> = BodyType<T, 'friendly-station' | 'enemy-station', Station> |
                       BodyType<T, 'moon' | 'planet' | 'black-hole' | 'asteroid', VBody>;
    }
}

interface Level<T = any> {
    center: {
        x: number,
        y: number
    },
    objects: gravity.level.Body<T>[],
    tick?: (state: T, simulation: gravity.Simulation) => void,
    /**
     * Is guaranteed to be run after every object's \`startup\`.
     */
    startup?: (state: T, simulation: gravity.Simulation) => void,
    cleanup?: (state: T, simulation: gravity.Simulation) => void
}

declare var Gravity: IGravity;
declare global {
    function eval(): never;
}

interface IGravity {
    /**
     * If called multiple times, only the most recent one will be respected.
     */
    createLevel<T = any>(level: Level<T>): void,
    requestImage(url: string) => gravity.Image,
    requestSound(url: string) => gravity.Sound,
    /**
     * Goes straight to \`console.log()\` in testing.
     */
    debug: (...args: any[]) => void,
    setTimeout: (callback: string | Function, ms: number, ...args: any[]) => number,
    clearTimeout: (id: number) => void,
    setInterval: (callback: string | Function, ms: number, ...args: any[]) => number,
    clearInterval: (id: number) => void
}`;