"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.X = exports.CHECK = void 0;
exports.CHECK = String.fromCharCode(0x2713);
exports.X = String.fromCharCode(0x2717);
var mode = process.env.NODE_ENV;
if (mode !== 'development' && mode !== 'production') {
    console.log(chalk.redBright(exports.X + ' NODE_ENV was not (correctly) provided. must be either: "development" or "production".'));
    process.exit(1);
}
else {
    console.log("server running in \"" + mode + "\" mode");
}
var express = require("express");
var fs = require("fs");
var path = require("path");
var typescript = require("typescript");
var mongo_1 = require("./mongo");
var chalk = require("chalk");
var sharp = require("sharp");
var util_1 = require("./util");
var app = express();
app.use('/dist', express.static(path.join(__dirname, '..', 'dist')));
app.use('/public', express.static(path.join(__dirname, '..', 'public')));
app.use('/lib/bootstrap-icons', express.static(path.join(__dirname, '..', 'node_modules', 'bootstrap-icons')));
app.use(express.json());
app.use(express.raw({
    type: 'image/png',
    limit: '1mb'
}));
app.use(express.raw({
    type: 'image/jpeg',
    limit: '1mb'
}));
var html = fs.readFileSync(path.join(__dirname, 'index.html')).toString();
app.get('/', function (req, res) {
    res.send(html);
});
var port = process.env.PORT;
(0, mongo_1.onConnectionFinished)().then(function () {
    app.listen(port, function () {
        console.log(chalk.greenBright(exports.CHECK + ' server succesfully started on port ' + port));
    });
})["catch"](function () {
    console.log(chalk.redBright(exports.X + ' server failed to start'));
});
function transpile(code) {
    return typescript.transpile(code, {
        target: typescript.ScriptTarget.ES2015
    });
}
// To my understanding pseudo-random RNG should not create any problems here.
var hex = '0123456789abcdef';
function generatePublic() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                    var key, i, level;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!true) return [3 /*break*/, 2];
                                key = '';
                                for (i = 0; i < 24; i++) {
                                    key += hex[Math.floor(Math.random() * 16)];
                                }
                                return [4 /*yield*/, mongo_1.LevelModel.findOne({ public: key }).exec()];
                            case 1:
                                level = _a.sent();
                                if (!level)
                                    return [3 /*break*/, 2];
                                return [3 /*break*/, 0];
                            case 2:
                                resolve(key);
                                return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
function generatePrivate() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                    var key, i, level;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!true) return [3 /*break*/, 2];
                                key = '';
                                for (i = 0; i < 64; i++) {
                                    key += hex[Math.floor(Math.random() * 16)];
                                }
                                return [4 /*yield*/, mongo_1.LevelModel.findOne({ private: key }).exec()];
                            case 1:
                                level = _a.sent();
                                if (!level)
                                    return [3 /*break*/, 2];
                                return [3 /*break*/, 0];
                            case 2:
                                resolve(key);
                                return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
function publicInterface(doc) {
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
    };
}
/**
 * For public ID's
 */
function isValidId(id) {
    return (typeof id === 'string' &&
        id.length === 24 &&
        id.match(/^[0-9a-f]+$/) !== null);
}
app.post('/publish-level', function (req, res) {
    var json = req.body;
    if (typeof json !== 'object') {
        res.status(400).json({
            error: 'Data posted was not valid JSON.'
        });
        return;
    }
    if (!json.code || !json.name || typeof json.code !== 'string' || typeof json.name !== 'string') {
        res.status(400).json({
            error: 'Data posted was not valid.'
        });
        return;
    }
    if (!json.name.match(/^[A-Za-z0-9\-_:&$\+~`!#\?\.\, ]+$/g)) {
        res.status(400).json({
            error: 'Level name may only contain alphanumeric characters, hyphens, underscores and spaces.'
        });
    }
    if (json.name.length > 48) {
        res.status(400).json({
            error: 'Level name may not exceed 48 characters.'
        });
    }
    var jsCode;
    try {
        jsCode = transpile(json.code);
    }
    catch (e) {
        res.status(400).json({
            error: 'Level code sent is not valid TypeScript.'
        });
        return;
    }
    var description = json.description;
    if (!description) {
        if (typeof description !== 'string' || description.length > 2048) {
            res.status(400).json({
                error: 'Level description must be a string of less than 2048 characters.'
            });
        }
        else if (description.indexOf('<') > 0 || description.indexOf('>') > 0) {
            res.status(400).json({
                error: 'Level description must not contain "<" or ">".'
            });
        }
    }
    (0, util_1.waitForAll)({
        privateId: generatePrivate(),
        publicId: generatePublic()
    }).then(function (_a) {
        var privateId = _a.privateId, publicId = _a.publicId;
        var level = new mongo_1.LevelModel({
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
            description: description
        });
        level.save().then(function () {
            res.json({
                error: false,
                id: privateId
            });
        })["catch"](function () {
            res.status(500).json({
                error: 'There was an error saving the level to the database.'
            });
        });
    });
});
app.post('/publish-level/thumbnail', function (req, res) {
    if (typeof req.query.private === 'string') {
        if (Buffer.isBuffer(req.body)) {
            mongo_1.LevelModel.findOne({ private: req.query.private }).then(function (document) {
                if (document) {
                    document.thumbnail = "/public/thumbnails/" + document.public + ".jpg";
                    document.save().then(function () {
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
                            .then(function () {
                            res.sendStatus(200);
                        });
                    });
                }
                else {
                    // Sends 200 in production to hide private lobby keys
                    res.sendStatus(mode === 'development' ? 200 : 404);
                }
            })["catch"](function () {
                res.sendStatus(500);
            });
        }
        else {
            res.status(400).send('Request body was not an image.');
        }
    }
    else {
        res.status(400).send('No query parameter "private" was provided.');
    }
});
app.post('/transpile', function (req, res) {
    var body = req.body;
    try {
        if (typeof body === 'object' && typeof body.code === 'string') {
            var transpiled = transpile(body.code);
            res.send(transpiled);
        }
        else {
            res.sendStatus(400);
        }
    }
    catch (e) {
        res.sendStatus(400);
    }
});
app.get('/levels', function (req, res) {
    if (typeof req.query.sort !== 'string') {
        res.sendStatus(400);
        return;
    }
    var sort;
    if (req.query.sort === 'popular') {
        sort = {
            played: -1
        };
    }
    else if (req.query.sort === 'new') {
        sort = {
            timestamp: -1
        };
    }
    else if (req.query.sort === 'rating') {
        sort = {
            rating: -1
        };
    }
    else {
        res.sendStatus(400);
        return;
    }
    var filter = {};
    if (typeof req.query.name === 'string' && req.query.name.length <= 64) {
        filter = {
            keywords: {
                $all: req.query.name.toLowerCase().split(' ')
            }
        };
    }
    mongo_1.LevelModel.find(filter).sort(sort).lean().exec(function (err, docs) {
        if (err) {
            res.sendStatus(500);
        }
        else {
            res.json(docs.map(function (doc) {
                return publicInterface(doc);
            }));
        }
    });
});
app.post('/rate-level', function (req, res) {
    var _a = req.body, id = _a.id, rating = _a.rating;
    if (!isValidId(id)) {
        res.sendStatus(400);
        return;
    }
    if (typeof rating !== 'number' || !Number.isInteger(rating)) {
        res.sendStatus(400);
        return;
    }
    mongo_1.LevelModel.findOne({ public: id }).exec(function (err, doc) {
        if (err) {
            res.sendStatus(500);
        }
        else if (doc) {
            var ratings = doc.ratings++;
            doc.rating = (doc.rating * ratings + rating) / (ratings + 1);
            doc.save(function (err) {
                if (err) {
                    res.sendStatus(500);
                }
                else {
                    res.sendStatus(200);
                }
            });
        }
        else {
            res.status(404).send('No such level exists.');
        }
    });
});
app.get('/get-level', function (req, res) {
    res.setHeader('Cache-Control', 'no-store');
    if (isValidId(req.query.id)) {
        mongo_1.LevelModel.findOne({ public: req.query.id }).exec(function (err, doc) {
            if (err) {
                res.sendStatus(500);
            }
            else if (doc) {
                res.json(publicInterface(doc));
            }
            else {
                res.status(404).send('No such level exists.');
            }
        });
    }
    else {
        res.sendStatus(400);
    }
});
app.get('/played-level', function (req, res) {
    if (isValidId(req.query.id)) {
        mongo_1.LevelModel.findOne({ public: req.query.id }).exec(function (err, doc) {
            if (err) {
                res.sendStatus(500);
            }
            else if (doc) {
                // Hopefully this causes no concurrency problems.
                doc.played++;
                doc.save();
            }
            else {
                res.status(404).send('No such level exists.');
            }
        });
    }
    else {
        res.sendStatus(400);
    }
});
