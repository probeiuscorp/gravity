import express = require('express');
import fs = require('fs');
import path = require('path');
import * as typescript from 'typescript';
import { LevelModel, onConnectionFinished } from './mongo';

import type { PostLevel } from '../src/common';

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

onConnectionFinished().then(() => {
    app.listen(3010, () => {
        console.log('Listening on port 3010');
    });
});

app.post('/publish-level', (req, res) => {
    const json = req.body as PostLevel;
    console.log('raw:', json);
    
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
        jsCode = typescript.transpile(json.code);
    } catch(e) {
        res.status(400).json({
            error: 'Level code sent is not valid TypeScript.'
        });
        return;
    }

    console.log('transpiled:', jsCode);

    const level = new LevelModel({
        name: json.name,
        timestamp: new Date(),
        levelData: jsCode,
        source: json.code,
        official: false
    });

    // level.save().then(() => {
        res.json({
            succcess: true
        });
    // }).catch(() => {
    //     res.status(500).json({
    //         error: 'There was an error saving the level to the database.'
    //     });
    // });
});

app.post('/transpile', (req, res) => {
    const body = req.body as { code: string };
    try {
        if(typeof body === 'object' && typeof body.code === 'string') {
            const transpiled = typescript.transpile(body.code);
            res.send(transpiled);
        } else {
            res.sendStatus(400);
        }
    } catch(e) {
        res.sendStatus(400);
    }
});