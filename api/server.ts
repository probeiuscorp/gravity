import express = require('express');
import fs = require('fs');
import path = require('path');
import * as typescript from 'typescript';
import { ILevelSchema, LevelModel, onConnectionFinished } from './mongo';
import chalk = require('chalk');
import sharp = require('sharp');
import type { PostLevel, RateLevel } from './common';
import type { FilterQuery } from 'mongoose';
import { waitForAll } from './util';

export const CHECK = String.fromCharCode(0x2713);
export const X = String.fromCharCode(0x2717);

const mode: 'development' | 'production' = process.env.NODE_ENV as any;
if(mode !== 'development' && mode !== 'production') {
    console.log(chalk.redBright(X + ' NODE_ENV was not (correctly) provided. must be either: "development" or "production".'));
    process.exit(1);
} else {
    console.log(`server running in "${mode}" mode`);
}

const app = express();

app.use(express.json());
app.use(express.raw({
    type: 'image/png',
    limit: '1mb'
}));
app.use(express.raw({
    type: 'image/jpeg',
    limit: '1mb'
}));

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

// To my understanding pseudo-random RNG should not create any problems here.
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

function publicInterface(doc: ILevelSchema): any {
    return {
        name: doc.name,
        source: doc.source,
        levelData: doc.levelData,
        official: doc.official,
        timestamp: doc.timestamp.valueOf(),
        id: doc.public,
        rating: doc.rating,
        ratings: doc.ratings,
        played: doc.played,
        description: doc.description,
        thumbnail: doc.thumbnail
    }
}

/**
 * For public ID's
 */
function isValidId(id: any): id is string {
    return (
        typeof id === 'string' && 
        id.length === 24 && 
        id.match(/^[0-9a-f]+$/) !== null
    );
}

app.post('/api/publish-level', (req, res) => {
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

    if(!json.name.match(/^[A-Za-z0-9\-_:&$\+~`!#\?\.\, ]+$/g)) {
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

    const description = json.description;
    if(!description) {
        if(typeof description !== 'string' || description.length > 2048) {
            res.status(400).json({
                error: 'Level description must be a string of less than 2048 characters.'
            });
        } else if(description.indexOf('<') > 0 || description.indexOf('>') > 0) {
            res.status(400).json({
                error: 'Level description must not contain "<" or ">".'
            });
        }
    }


    waitForAll({
        privateId: generatePrivate(),
        publicId: generatePublic()
    }).then(({ privateId, publicId }) => {
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
            played: 0,
            keywords: json.name.toLowerCase().split(' '),
            description
        });

        level.save().then(() => {
            res.json({
                error: false,
                id: privateId
            });
        }).catch(() => {
            res.status(500).json({
                error: 'There was an error saving the level to the database.'
            });
        });
    });
});

app.post('/api/publish-level/thumbnail', (req, res) => {
    if(typeof req.query.private === 'string') {
        if(Buffer.isBuffer(req.body)) {
            LevelModel.findOne({ private: req.query.private as string }).then((document) => {
                if(document) {
                    document.thumbnail = `/public/thumbnails/${document.public}.jpg`;
                    document.save().then(() => {
                        sharp(req.body)
                            .resize(250, 155, {
                                fit: 'contain',
                                background: {
                                    r: 31,
                                    g: 35,
                                    b: 43
                                }
                            })
                            .jpeg()
                            .toFile(path.join(__dirname, '..', 'public', 'thumbnails', document.public + '.jpg'))
                            .then(() => {
                                res.sendStatus(200);
                            });
                    });
                } else {
                    // Sends 200 in production to hide private lobby keys
                    res.sendStatus(mode === 'development' ? 200 : 404);
                }
            }).catch(() => {
                res.sendStatus(500);
            });
        } else {
            res.status(400).send('Request body was not an image.');
        }
    } else {
        res.status(400).send('No query parameter "private" was provided.');
    }
});

app.post('/api/transpile', (req, res) => {
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

app.get('/api/levels', (req, res) => {
    if(typeof req.query.sort !== 'string') {
        res.sendStatus(400);
        return;
    }
    
    let sort: any;
    if(req.query.sort === 'popular') {
        sort = {
            played: -1
        };
    } else if(req.query.sort === 'new') {
        sort = {
            timestamp: -1
        };
    } else if(req.query.sort === 'rating') {
        sort = {
            rating: -1
        };
    } else {
        res.sendStatus(400);
        return;
    }

    let filter: FilterQuery<ILevelSchema> = {};
    if(typeof req.query.name === 'string' && req.query.name.length <= 64) {
        filter = {
            keywords: {
                $all: req.query.name.toLowerCase().split(' ')
            }
        };
    }

    LevelModel.find(filter).sort(sort).lean().exec((err, docs) => {
        if(err) {
            res.sendStatus(500);
        } else {
            res.json(docs.map((doc) => {
                return publicInterface(doc);
            }));
        }
    });
});

app.post('/api/rate-level', (req, res) => {
    const { id, rating } = req.body as RateLevel;
    if(!isValidId(id)) {
        res.sendStatus(400);
        return;
    }
    if(typeof rating !== 'number' || !Number.isInteger(rating)) {
        res.sendStatus(400);
        return;
    }

    LevelModel.findOne({ public: id }).exec((err, doc) => {
        if(err) {
            res.sendStatus(500);
        } else if(doc) {
            const ratings = doc.ratings++;
            doc.rating = (doc.rating * ratings + rating) / (ratings + 1);
            doc.save((err) => {
                if(err) {
                    res.sendStatus(500);
                } else {
                    res.sendStatus(200);
                }
            });
        } else {
            res.status(404).send('No such level exists.');
        }
    });
});

app.get('/api/get-level', (req, res) => {
    if(isValidId(req.query.id)) {
        LevelModel.findOne({ public: req.query.id }).exec((err, doc) => {
            if(err) {
                res.sendStatus(500);
            } else if(doc) {
                res.json(publicInterface(doc));
            } else {
                res.status(404).send('No such level exists.');
            }
        });
    } else {
        res.sendStatus(400);
    }
});

app.get('/api/played-level', (req, res) => {
    if(isValidId(req.query.id)) {
        LevelModel.findOne({ public: req.query.id }).exec((err, doc) => {
            if(err) {
                res.sendStatus(500);
            } else if(doc) {
                // Hopefully this causes no concurrency problems.
                doc.played++;
                doc.save();
            } else {
                res.status(404).send('No such level exists.');
            }
        });
    } else {
        res.sendStatus(400);
    }
});

module.exports = app;