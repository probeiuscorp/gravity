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

export type FetchLevelsResponse = {
    name: string,
    source: string,
    levelData: string,
    official: boolean,
    timestamp: number,
    id: number,
    rating: number,
    ratings: number,
    played: number
}[]

export interface UpdateLevel {
    id: string
}