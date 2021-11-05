export type LevelObjectAICallback<T = any, Cache = any> = (object: T, cache: Cache) => void

export type LevelObject<CacheType = any> = ({
    type: 'friendly-station' | 'enemy-station' | 'moon' | 'asteroid' | 'planet' | 'black-hole' | 'antigravity',
    aiTick?: LevelObjectAICallback<any, CacheType>;
    aiInit?: LevelObjectAICallback<any, CacheType>;
    aiUnbind?: LevelObjectAICallback<any, CacheType>;
    x: number,
    y: number,
});

export interface LevelData<CacheType = any> {
    name: string,
    level: number,
    center: {
        x: number,
        y: number
    },
    objects: LevelObject<CacheType>[]
}