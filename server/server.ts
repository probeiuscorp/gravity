import express = require('express');
import fs = require('fs');
import path = require('path');
import * as typescript from 'typescript';
import { LevelModel, onConnectionFinished } from './mongo';

import type { PostLevel } from '../src/common';

const app = express();

app.use('/dist', express.static(path.join(__dirname, 'dist')));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
        res.send(data.toString());
    });
});

onConnectionFinished().then(() => {
    app.listen(3010, () => {
        console.log('Listening on port 3010');
    });
});

app.post('/publish-level', (req, res) => {
    let json: PostLevel;
    try {
        json = JSON.parse(req.body) as PostLevel;
    } catch(e) {
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

    if(!json.name.match(/[a-zA-Z\-_ 0-9]+/g)) {
        res.status(400).json({
            error: 'Level name may only contain alphanumeric characters, hyphens, underscores and spaces.'
        });
    }

    let jsCode: string;
    try {
        jsCode = typescript.transpile(json.code);
    } catch(e) {
        res.status(400).json({
            error: 'Level code sent is not valid TypeScript.'
        });
        return;
    }

    const level = new LevelModel({
        name: json.name,
        timestamp: new Date(),
        levelData: jsCode,
        source: json.code,
        official: false
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