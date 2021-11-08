import * as mongoose from 'mongoose';
import chalk = require('chalk');
import { CHECK, X } from './server';

let connectionCallbacks: ((wasSuccessful: boolean) => void)[] = [];
mongoose.connect(process.env.MONGODB_URI, {
    auth: {
        username: 'gravity',
        password: process.env.DATABASE_PSWD
    },
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

mongoose.connection.on('error', () => {
    console.log(chalk.redBright(X + ' error connecting to mongo'));
});

interface ILevelSchema {
    name: string,
    official: boolean,
    timestamp: Date,
    levelData: string,
    source: string,
    public: string,
    private: string,
    rating: number,
    ratings: number,
    played: number
}
const LevelSchema = new mongoose.Schema<ILevelSchema>({
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
    }
});

export const LevelModel = mongoose.model('Level', LevelSchema, 'levels');