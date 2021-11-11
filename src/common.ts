export interface PostLevel {
    name: string,
    code: string
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
    id: number,
    rating: number,
    ratings: number,
    played: number
};

export type FetchLevelsResponse = LevelResponse[]

export interface UpdateLevel {
    id: string
}