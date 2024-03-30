import { connect, connection, model, Schema } from 'mongoose';
import chalk = require('chalk');
import { CHECK, X } from './server';

let connectionCallbacks: ((wasSuccessful: boolean) => void)[] = [];
console.log('initiating mongo connection...');
connect(process.env.MONGODB_URI, {
    auth: {
        username: 'gravity',
        password: process.env.DATABASE_PSWD
    },
    dbName: 'gravity',
    w: 'majority',
    retryWrites: true
}).then(() => {
    console.log(chalk.greenBright(CHECK + ' mongo connected succesfully'));
    connectionCallbacks.forEach((callback) => void callback(true));
}).catch(() => {
    connectionCallbacks.forEach((callback) => void callback(false));
});

export async function onConnectionFinished(): Promise<void> {
    return new Promise((resolve, reject) => {
        connectionCallbacks.push((wasSuccessful) => {
            wasSuccessful ? resolve() : reject();
        });
    });
}

connection.on('error', () => {
    console.log(chalk.redBright(X + ' error connecting to mongo'));
});

export interface ILevelSchema {
    name: string,
    official: boolean,
    timestamp: Date,
    levelData: string,
    source: string,
    public: string,
    private: string,
    rating: number,
    ratings: number,
    played: number,
    keywords: string[],
    thumbnail?: string,
    description?: string
}
const LevelSchema = new Schema<ILevelSchema>({
    name: {
        type: String
    },
    official: {
        type: Boolean
    },
    timestamp: {
        type: Date
    },
    levelData: {
        type: String
    },
    source: {
        type: String
    },
    public: {
        type: String
    },
    private: {
        type: String
    },
    rating: {
        type: Number
    },
    ratings: {
        type: Number
    },
    played: {
        type: Number
    },
    keywords: {
        type: [String]
    },
    thumbnail: {
        type: String,
        default: '/public/img/placeholder_250x155.png'
    },
    description: {
        type: String
    }
});

export const LevelModel = model('Level', LevelSchema, 'levels');