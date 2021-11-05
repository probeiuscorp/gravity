const whitelist = [
    'Object',
    'String',
    'Number',
    'NaN',
    'Infinity',
    'parseInt',
    'parseFloat',
    'isNaN',
    'isFinite',
    'Symbol',
    'Function',
    'Array',
    'ArrayBuffer',
    'Boolean',
    'Error',
    'Date',
    'JSON',
    'Math',
    'TypeError',
    'RangeError',
    'ReferenceError',
    'SyntaxError',
    'RegExp',
    'undefined'
];

var saferCtx = {};
for(const key of Object.keys(Object.getOwnPropertyDescriptors(window))) {
    if(!(key in whitelist)) {
        saferCtx[key] = undefined;
    }
}

export default function(code: string): Function {
    return new Function(`with(saferCtx) {${code}}`);
}