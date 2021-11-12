export interface PostLevel {
    name: string,
    code: string,
    description?: string
}

export type PostLevelResponse = {
    error: string,
} | {
    error: false,
    id: string
}

export interface LevelResponse {
    name: string,
    source: string,
    levelData: string,
    official: boolean,
    timestamp: number,
    id: string,
    rating: number,
    ratings: number,
    played: number,
    description?: string
};

export type FetchLevelsResponse = LevelResponse[]

export interface UpdateLevel {
    id: string
}

export interface RateLevel {
    id: string,
    rating: number
}