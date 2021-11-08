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
    id: number,
    official: boolean,
    jsCode: string,
    source: string,
    rating: number
}[]

export interface UpdateLevel {
    id: string
}