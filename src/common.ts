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
    official: boolean,
    jsCode: string,
    source: string
}[]

export interface UpdateLevel {
    id: string
}