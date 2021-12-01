"use strict";
exports.__esModule = true;
exports.waitForAll = void 0;
function waitForAll(promises) {
    return new Promise(function (resolve, reject) {
        var keys = Object.getOwnPropertyNames(promises);
        var total = keys.length;
        var returned = 0;
        var ret = {};
        var _loop_1 = function (key) {
            var promise = promises[key];
            promise.then(function (v) {
                returned++;
                ret[key] = v;
                if (returned === total) {
                    resolve(ret);
                }
            })["catch"](function (reason) {
                reject(reason);
            });
        };
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            _loop_1(key);
        }
    });
}
exports.waitForAll = waitForAll;
