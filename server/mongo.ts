import * as mongoose from 'mongoose';

let connectionCallbacks: ((wasSuccessful: boolean) => void)[] = [];
// mongoose.connect(process.env.MONGODB_URI, {
//     auth: {
//         username: 'gravity',
//         password: process.env.DATABASE_PSWD
//     }
// }).then(() => {
//     connectionCallbacks.forEach((callback) => void callback(true));
// }).catch(() => {
//     connectionCallbacks.forEach((callback) => void callback(false));
// });

export async function onConnectionFinished(): Promise<void> {
    return new Promise((resolve, reject) => {
        resolve();
        // connectionCallbacks.push((wasSuccessful) => {
        //     wasSuccessful ? resolve() : reject();
        // });
    });
}

mongoose.connection.on('error', () => {
    console.log(`Error with Mongo connection!`);
});

interface ILevelSchema {
    name: string,
    official: boolean,
    timestamp: Date,
    levelData: string,
    source: string,
    public: string,
    private: string
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
    }
});

export const LevelModel = mongoose.model('Level', LevelSchema, 'levels');