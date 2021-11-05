import type { LevelData } from './types';

export var levels: LevelData[];

export function registerLevel<Cache = any>(level: LevelData<Cache>) {
    if(!levels) levels = [];
    levels[level.level - 1] = level;
}
import './levels/01';
import './levels/02';
import './levels/03';
import './levels/04';
import './levels/05';
import './levels/06';
import './levels/07';
import './levels/08';