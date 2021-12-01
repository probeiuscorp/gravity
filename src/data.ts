import { canvas, currentPos, onClick, onKey, onMove, removeClickListener, removeMoveListener, setCursor } from './main';
import * as Resources from './resources';

export type KG = number;
export type N = number;
export type Image = HTMLImageElement;
export type PostponedRender = (ctx: CanvasRenderingContext2D) => void;

// Gravitational constant... not sure why I bothered
const G = 1;

export class Renderer {
    private ctx: CanvasRenderingContext2D;
    public pendingUIDraws: PostponedRender[] = [];
    private simulation: Simulation;

    constructor(ctx: CanvasRenderingContext2D, simulation: Simulation) {
        this.ctx = ctx;
        this.simulation = simulation;
    }

    public drawImage(location: Vector, img: Image, scale: number, rotation?: number) {
        let camera = this.simulation.camera;
        this.ctx.scale(this.simulation.zoom, this.simulation.zoom);
        if(rotation) {
            this.ctx.translate(location.x - camera.x, location.y - camera.y);
            this.ctx.rotate(rotation);
            this.ctx.drawImage(img, -img.width*scale/2, -img.height*scale/2, img.width * scale, img.height * scale);
            this.ctx.resetTransform();
        } else {
            this.ctx.translate(-camera.x, -camera.y);
            this.ctx.drawImage(img, location.x - (img.width * scale / 2), location.y - (img.height * scale / 2), img.width * scale, img.height * scale);
            this.ctx.resetTransform();
        }
    }

    public drawOnUI(callback: PostponedRender) {
        this.pendingUIDraws.push(callback);
    }
}

export class Simulation {
    public objects: VBody[] = [];
    public renderer: Renderer;
    public camera = new Vector(0, 0);
    public zoom = Math.min(Math.max(innerWidth / 1800, 0.5), 2);
    public frame: number = 0;
    private particles: Particle[] = [];
    private ctx: CanvasRenderingContext2D;
    private panning = false;
    private panningCallbacks: VoidFunction[] = [];

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.renderer = new Renderer(this.ctx, this);
        let selectedStation: Station = null;

        onClick(this, (e) => {
            let v = e.pos.shrink(this.zoom).add(this.camera);
            
            let selectedAny = false;
            for(const object of this.objects) {
                if(object instanceof Station && object.isWithin(v) && object.friendly) {
                    if(selectedStation === object) {
                        object.selected = !object.selected;
                    } else {
                        object.selected = true;
                        if(selectedStation) selectedStation.selected = false;
                        selectedStation = object;
                    }
                    selectedAny = true;
                    Resources.Sounds.CLICK();
                    break;
                }
            }
            if(!selectedAny && selectedStation?.health > 0 && selectedStation.selected) {
                selectedStation.fireAt(v);
            }
        });

        this.handleKeydown = this.handleKeydown.bind(this);
        this.handleKeyup   = this.handleKeyup.bind(this);
        this.handleWheel   = this.handleWheel.bind(this);
        document.addEventListener('keydown', this.handleKeydown, { passive: true });
        document.addEventListener('keyup',   this.handleKeyup,   { passive: true });
        canvas.addEventListener('wheel',   this.handleWheel,   { passive: true });

        onMove(this, (newPos) => {
            if(this.panning) {
                this.camera = this.camera.subtract(newPos).add(currentPos);
                for(const callback of this.panningCallbacks) callback();
            }
        });
    }

    public onPan(callback: () => void) {
        this.panningCallbacks.push(callback);
    }

    private handleKeydown(e: KeyboardEvent) {
        if(e.key === ' ') {
            this.panning = true;
        }
    }

    private handleKeyup(e: KeyboardEvent) {
        if(e.key === ' ') {
            this.panning = false;
        }
    }

    private handleWheel(e: WheelEvent) {
        const oldZoom = this.zoom;
        if(e.deltaY > 0) {
            this.zoom = Math.max(this.zoom * 0.9, 0.5);
        } else {
            this.zoom = Math.min(2, this.zoom * 1.1);
        }

        const mouse = new Vector(e.x, e.y);
        const pos = mouse.shrink(oldZoom).add(this.camera);
        const change = pos.subtract(this.camera).scale(this.zoom - oldZoom);
        this.camera = this.camera.add(change);
    }

    public spawnParticle(particle: Particle) {
        particle.bind(this);
        this.particles.push(particle);
    }

    public addBody(vbody: VBody) {
        this.objects.push(vbody);
    }

    public tick(): boolean {
        this.frame++;

        if(this.panning) {
            setCursor('grabbing');
        }

        let keep: boolean[] = [];
        this.objects.forEach((object) => keep.push(object.tick(0.5, this.objects.filter((o) => o !== object))));

        let anyEnemyStationsAlive = false;
        for(let i=0;i<this.objects.length;i++) {
            const object = this.objects[i];
            if(object instanceof Station) {
                if(!object.friendly) {
                    anyEnemyStationsAlive = true;
                }
            }
            if(!keep[i]) {
                this.objects.splice(i, 1);
                keep.splice(i, 1);
            } else {
                object.render(this.renderer, Math.floor(this.frame / 20));
            }
        }

        keep = [];
        for(const particle of this.particles) {
            keep.push(particle.render(this.ctx));
        }
        for(let i=0;i<keep.length;i++) {
            if(!keep[i]) {
                this.particles.splice(i, 1);
                keep.splice(i, 1);
                i--;
            }
        }

        this.ctx.scale(this.zoom, this.zoom);
        this.ctx.translate(-this.camera.x, -this.camera.y);
        for(const callback of this.renderer.pendingUIDraws) {
            callback(this.ctx);
        }
        this.ctx.resetTransform();
        this.renderer.pendingUIDraws = [];

        return anyEnemyStationsAlive;
    }

    /**
     * Should be called to make sure all event listeners are cleaned up.
     */
    public unbind() {
        removeMoveListener(this);
        removeClickListener(this);
        document.removeEventListener('keyup', this.handleKeyup);
        document.removeEventListener('keydown', this.handleKeydown);
        canvas.removeEventListener('wheel', this.handleWheel);
    }
}

/**
 * Immutable representation of a simple (x, y) pair.
 */
export class Vector {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public static add(v1: Vector, v2: Vector): Vector {
        return new Vector(v1.x + v2.x, v1.y + v2.y);
    }

    public static subtract(v1: Vector, v2: Vector): Vector {
        return new Vector(v1.x - v2.x, v1.y - v2.y);
    }

    public static magnitude(vector: Vector): number {
        return Math.sqrt(vector.x**2 + vector.y**2);
    }

    public static distance(v1: Vector, v2: Vector): number {
        return Math.sqrt((v1.x - v2.x)**2 + (v1.y - v2.y)**2)
    }

    public static ofMaxLength(vector: Vector, length: number): Vector {
        const magnitude = vector.magnitude();
        if(magnitude > length) {
            return vector.scale(length / magnitude);
        } else {
            return vector;
        }
    }

    public add(other: Vector): Vector {
        return Vector.add(this, other);
    }

    public subtract(other: Vector): Vector {
        return Vector.subtract(this, other);
    }

    public distance(other: Vector): number {
        return Vector.distance(this, other);
    }

    public magnitude(): number {
        return Vector.magnitude(this);
    }

    public scale(scalar: number): Vector {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    /**
     * Divides by @param scalar to minimize floating point error 
     */
    public shrink(scalar: number): Vector {
        return new Vector(this.x / scalar, this.y / scalar);
    }

    public normalize(): Vector {
        const magnitude = this.magnitude();
        return new Vector(this.x / magnitude, this.y / magnitude);
    }

    public ofMaxLength(max: number): Vector {
        const magnitude = this.magnitude();
        if(magnitude > max) {
            return this.normalize().scale(max);
        } else {
            return this;
        }
    }

    public toString(): string {
        return `<${this.x}, ${this.y}>`;
    }
}

export class Particle extends Vector {
    private numFrames: number;
    private frame: number = 0;
    private steps: number = 0;
    private w: number = 0;
    private resource: Image;
    private scaleFactor: number;
    public speed: number;
    private listeners: VoidFunction[] = [];
    private simulation: Simulation;

    constructor(x: number, y: number, resource: Image, scale?: number, animationSpeed?: number) {
        super(x, y);
        this.w = resource.width;
        this.resource = resource;
        this.scaleFactor = scale ?? 1;
        this.speed = animationSpeed ?? 1;
        this.numFrames = resource.height / this.w;
    }

    public bind(simulation: Simulation) {
        this.simulation = simulation;
    }

    public render(ctx: CanvasRenderingContext2D): boolean {
        if(++this.steps >= this.speed) {
            this.steps = 0;
            this.frame++;
            this.listeners[this.frame]?.();
        }
        
        ctx.scale(this.simulation.zoom, this.simulation.zoom);
        ctx.translate(-this.simulation.camera.x, -this.simulation.camera.y);
        ctx.drawImage(this.resource, 0, this.frame * this.w, this.w, this.w, this.x - this.w * this.scaleFactor, this.y - this.w * this.scaleFactor, this.w*2*this.scaleFactor, this.w*2*this.scaleFactor);
        ctx.resetTransform();
        return this.frame < this.numFrames;
    }

    public on(stage: number, callback: () => void) {
        this.listeners[stage] = callback;
    }
}


export type Force = Vector;

export abstract class VBody extends Vector {
    public immovable = true;
    public ignoresGravity = true;
    public velocity: Vector;
    public mass: KG;
    public netForce: Force = new Vector(0, 0);
    public solid: boolean = false;
    public destroy: boolean = false;
    public radius: number = 50;
    protected simulation: Simulation;

    constructor(x: number, y: number, velocity: Vector, mass: KG, simulation: Simulation) {
        super(x, y);
        this.velocity = velocity;
        this.mass = mass;
        this.simulation = simulation;
    }

    public applyForce(force: Force) {
        this.netForce = Vector.add(this.netForce, force);
    }

    public isWithin(v: Vector) {
        return this.subtract(v).magnitude() < this.radius;
    }

    /**
     * Phase to apply forces to other objects. 
     */
    protected preTick(seconds: number, others: VBody[]) {
        for(const other of others) {
            if(other.isWithin(this) && other.solid) {
                this.destroy = true;
                this.simulation.spawnParticle(new Particle(this.x, this.y, Resources.BLAST));
                this.onCollision(other);
                Resources.Sounds.DAMAGE();
            }
        }
    }

    /**
     * Should not affect other objects. Should simply update itself. Return `true` to keep the object.
     */
    protected onTick(seconds: number): boolean {
        if(this.immovable) {
            return !this.destroy;
        } else {
            // F = ma; a = F/m
            this.velocity = this.velocity.add(this.netForce.scale(seconds / this.mass));
            const newLocation = this.add(this.velocity);
            this.x = newLocation.x;
            this.y = newLocation.y;
            return this.magnitude() <= 5000 && !this.destroy;
        }
    }

    /**
     * @param others Does not include this object. Returns true if the object should be kept.
     */
    public tick(seconds: number, others: VBody[]): boolean {
        this.preTick(seconds, others);
        const keep = this.onTick(seconds);
        this.netForce = new Vector(0, 0);
        return keep;
    }

    public onHit() {}
    
    protected onCollision(other: VBody) {}

    public abstract render(renderer: Renderer, frame: number): void;
}

const ASTEROIDS = [Resources.ASTEROID_1, Resources.ASTEROID_2, Resources.ASTEROID_3, Resources.ASTEROID_4];

export class Obstacle extends VBody {
    private img: Image;
    private angle = 0;
    private direction = 1;
    private left = 16;
    solid = true;
    radius = 30;

    constructor(x: number, y: number, simulation: Simulation) {
        super(x, y, new Vector(0, 0), 0, simulation);

        this.img = ASTEROIDS[Math.floor(Math.random() * ASTEROIDS.length)];
    }

    public override render(renderer: Renderer, frame: number) {
        this.angle += this.direction * Math.PI / 720;
        this.left--;
        if(this.left < 0) {
            this.direction *= -1;
            this.left = Math.floor(Math.random() * 600) + 80
        }
        renderer.drawImage(this, this.img, 3, this.angle);
    }
    
    protected onCollision(other: VBody) {}
}

export class Projectile extends VBody {
    private img: Image;

    constructor(x: number, y: number, velocity: Vector, mass: number, simulation: Simulation, img: Image) {
        super(x, y, velocity, mass, simulation);
        this.img = img;
        this.immovable = false;
        this.ignoresGravity = false;
    }

    public override render(renderer: Renderer) {
        let angle = Math.PI/2 + (Math.atan2(this.velocity.y, this.velocity.x));
        renderer.drawImage(this, this.img, 3, angle);
    }
}

export class Shell extends Projectile {
    constructor(x: number, y: number, velocity: Vector, mass: number, simulation: Simulation) {
        super(x, y, velocity, mass, simulation, Resources.SHELL);
    }

    protected override onCollision(other: VBody) {
        other.onHit();
    }
}

export abstract class GravityGenerator extends VBody {
    public solid = true;

    constructor(x: number, y: number, velocity: Vector, mass: number, simulation: Simulation) {
        super(x, y, velocity, mass, simulation);
    }

    protected override preTick(seconds: number, others: VBody[]) {
        super.preTick(seconds, others);
        for(const object of others) {
            if(!object.ignoresGravity) {
                const magnitude = G * (this.mass * object.mass) / Vector.distance(this, object)**2;
                const force = Vector.subtract(this, object).normalize().scale(magnitude);
                object.applyForce(force);
            }
        }
    }
}

export class Moon extends GravityGenerator {
    radius = 40;

    constructor(x: number, y: number, simulation: Simulation) {
        super(x, y, new Vector(0, 0), 35000, simulation);
    }

    public override render(renderer: Renderer, frame: number) {
        renderer.drawImage(this, frame % 2 === 0 ? Resources.MOON_FRAME_1 : Resources.MOON_FRAME_2, 4);
    }
}

export class Planet extends GravityGenerator {
    constructor(x: number, y: number, simulation: Simulation) {
        super(x, y, new Vector(0, 0), 65000, simulation)
    }

    public override render(renderer: Renderer, frame: number) {
        renderer.drawImage(this, frame % 2 === 0 ? Resources.PLANET_FRAME_1 : Resources.PLANET_FRAME_2, 4);
    }
}

export class BlackHole extends GravityGenerator {
    radius = 80;

    constructor(x: number, y: number, simulation: Simulation) {
        super(x, y, new Vector(0, 0), 150000, simulation);
    }

    public override render(renderer: Renderer, frame: number) {
        renderer.drawImage(this, frame % 2 === 0 ? Resources.BLACK_HOLE_FRAME_1 : Resources.BLACK_HOLE_FRAME_2, 4);
    }
}

export class Antigravity extends GravityGenerator {
    radius = 60;
    constructor(x: number, y: number, simulation: Simulation) {
        super(x, y, new Vector(0, 0), -12000, simulation);
    }

    public override render(renderer: Renderer, frame: number) {
        renderer.drawImage(this, Resources.ANTI_GRAVITY, 4);
    }
}

export abstract class Destructible extends VBody {
    public health: number = 100;
    public maxHealth: number = 100;
    public solid = true;

    public override onTick(seconds): boolean {
        super.onTick(seconds);
        return this.health >= 0;
    }
}

export class Station extends Destructible {
    public radius = 40;
    public maxHealth = 120;
    public health = 120;
    public static readonly totalShots: number = 4;
    public shotsLeft: number = Station.totalShots;
    public friendly: boolean;
    public selected: boolean = false;
    private readonly img: Image;
    private readonly destroyImg: Image;

    constructor(x: number, y: number, friendly: boolean, simulation: Simulation) {
        super(x, y, new Vector(0, 0), 250, simulation);
        this.friendly = friendly;

        this.img = friendly ? Resources.STATION_FRIENDLY : Resources.STATION_ENEMY;
        this.destroyImg = friendly ? Resources.STATION_DESTROY_FRIENDLY : Resources.STATION_DESTROY_ENEMY;
    }

    public override onHit() {
        this.health -= 50;
        if(this.health <= 0) {
            const particle = new Particle(this.x, this.y, this.destroyImg, 2, 4);
            this.simulation.spawnParticle(particle);
            particle.on(5, () => {
                particle.speed = 1;
                this.simulation.addBody(new Projectile(this.x - 10, this.y + 5, new Vector(-4, 6), 30, this.simulation, Resources.DEBRIS_1));
                this.simulation.addBody(new Projectile(this.x + 5, this.y - 5, new Vector(6, 6), 30, this.simulation, Resources.DEBRIS_2));
                this.simulation.addBody(new Projectile(this.x - 10, this.y - 5, new Vector(4, -6), 30, this.simulation, Resources.DEBRIS_3));
                this.simulation.addBody(new Projectile(this.x, this.y, new Vector(0, -0.5), 90, this.simulation, Resources.DEBRIS_4));
            });
            Resources.Sounds.DESTROYED();
        }
    }

    public override render(renderer: Renderer, frame: number) {
        renderer.drawImage(this.add(new Vector(0, ([-2, 0, 2, 0][frame % 4]))), this.selected ? Resources.STATION_SELECTED : this.img, 4);
        renderer.drawOnUI((ctx) => {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x - 50, this.y - 70, 100, 10);
            ctx.fillStyle = 'green';
            ctx.fillRect(this.x - 50, this.y - 70, Math.max(this.health / this.maxHealth * 100, 0), 10);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x - 50, this.y - 70, 100, 10);
            const w = (100 + 2 * ctx.lineWidth) / Station.totalShots;
            ctx.fillStyle = 'white';
            for(let i=0;i<Station.totalShots;i++) {
                if(i < this.shotsLeft) {
                    ctx.fillRect(this.x - 50 + w * i, this.y - 55, w - 4, 10);
                }
                ctx.strokeRect(this.x - 50 + w * i, this.y - 55, w - 4, 10);
            } 
        });
    }

    public fireAt(point: Vector) {
        if(this.shotsLeft > 0 && this.health > 0) {
            this.shotsLeft--;
            const normalized = point.subtract(this).normalize();
            const start = normalized.scale(this.radius * 1.5).add(this);
            this.simulation.addBody(new Shell(start.x, start.y, normalized.scale(12), 50, this.simulation));
            Resources.Sounds.FIRE();
        }
    }
}

export class Mirror extends VBody {
    constructor(x: number, y: number, rotation: number, simulation: Simulation) {
        super(x, y, new Vector(0, 0), 4000, simulation)        
    }

    public override onCollision(other: VBody) {

    }

    public override render(renderer: Renderer, frame: number) {
        // renderer.drawImage();
    }
}