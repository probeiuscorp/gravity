import express = require('express');
import fs = require('fs');
import path = require('path');
import * as typescript from 'typescript';
import { LevelModel, onConnectionFinished } from './mongo';
import chalk = require('chalk');

import type { PostLevel } from '../src/common';

export const CHECK = String.fromCharCode(0x2713);
export const X = String.fromCharCode(0x2717);

const app = express();

app.use('/dist', express.static(path.join(__dirname, '..', 'dist')));
app.use('/public', express.static(path.join(__dirname, '..', 'public')));
app.use('/lib/bootstrap-icons', express.static(path.join(__dirname, '..', 'node_modules', 'bootstrap-icons')));
app.use(express.json());

app.get('/', (req, res) => {
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
        res.send(data.toString());
    });
});

const port = process.env.PORT;
onConnectionFinished().then(() => {
    app.listen(port, () => {
        console.log(chalk.greenBright(CHECK + ' server succesfully started on port ' + port));
    });
}).catch(() => {
    console.log(chalk.redBright(X + ' server failed to start'));
});

function transpile(code: string): string {
    return typescript.transpile(code, {
        target: typescript.ScriptTarget.ES2015
    });
}

const hex = '0123456789abcdef';
async function generatePublic(): Promise<string> {
    return new Promise(async (resolve) => {
        let key: string;
        while(true) {
            key = '';
            for(let i=0;i<24;i++) {
                key += hex[Math.floor(Math.random() * 16)];
            }
            const level = await LevelModel.findOne({ public: key }).exec();
            if(!level) break;
        }
        resolve(key);
    });
}

async function generatePrivate(): Promise<string> {
    return new Promise(async (resolve) => {
        let key: string;
        while(true) {
            key = '';
            for(let i=0;i<64;i++) {
                key += hex[Math.floor(Math.random() * 16)];
            }
            const level = await LevelModel.findOne({ private: key }).exec();
            if(!level) break;
        }
        resolve(key);
    });
}

app.post('/publish-level', (req, res) => {
    const json = req.body as PostLevel;
    
    if(typeof json !== 'object') {
        res.status(400).json({
            error: 'Data posted was not valid JSON.'
        });
        return;
    }

    if(!json.code || !json.name || typeof json.code !== 'string' || typeof json.name !== 'string') {
        res.status(400).json({
            error: 'Data posted was not valid.'
        });
        return;
    }

    if(!json.name.match(/^[a-zA-Z\-_ 0-9]+$/g)) {
        res.status(400).json({
            error: 'Level name may only contain alphanumeric characters, hyphens, underscores and spaces.'
        });
    }

    if(json.name.length > 48) {
        res.status(400).json({
            error: 'Level name may not exceed 48 characters.'
        });
    }

    let jsCode: string;
    try {
        jsCode = transpile(json.code);
    } catch(e) {
        res.status(400).json({
            error: 'Level code sent is not valid TypeScript.'
        });
        return;
    }

    generatePublic().then((publicId) => {
        generatePrivate().then((privateId) => {
            const level = new LevelModel({
                name: json.name,
                timestamp: new Date(),
                levelData: jsCode,
                source: json.code,
                official: false,
                public: publicId,
                private: privateId,
                rating: 0,
                ratings: 0,
                played: 0
            });

            level.save().then(() => {
                res.json({
                    succcess: true
                });
            }).catch(() => {
                res.status(500).json({
                    error: 'There was an error saving the level to the database.'
                });
            });
        });
    });
});

app.post('/transpile', (req, res) => {
    const body = req.body as { code: string };
    try {
        if(typeof body === 'object' && typeof body.code === 'string') {
            const transpiled = transpile(body.code);
            res.send(transpiled);
        } else {
            res.sendStatus(400);
        }
    } catch(e) {
        res.sendStatus(400);
    }
});

app.get('/levels', (req, res) => {
    LevelModel.find({}).lean().exec((err, docs) => {
        if(err) {
            res.sendStatus(500);
        } else {
            res.json(docs.map((doc) => {
                return {
                    name: doc.name,
                    source: doc.source,
                    levelData: doc.levelData,
                    official: doc.official,
                    timestamp: doc.timestamp,
                    id: doc.public,
                    rating: doc.rating,
                    ratings: doc.ratings,
                    played: doc.played
                }
            }));
        }
    });
});