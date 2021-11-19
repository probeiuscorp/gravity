type Awaited<T> = T extends PromiseLike<infer U> ? U : T
type PromiseValueExtractor<T extends Record<string, Promise<any>>> = {
    [P in keyof T]: Awaited<T[P]>
}

export function waitForAll<T extends Record<string, Promise<any>>>(promises: T): Promise<PromiseValueExtractor<T>> {
    return new Promise((resolve, reject) => {
        const keys = Object.getOwnPropertyNames(promises);
        const total = keys.length;
        let returned = 0;
        let ret: any = {};
        for(const key of keys) {
            const promise = promises[key];
            promise.then((v) => {
                returned++;
                ret[key] = v;
                if(returned === total) {
                    resolve(ret);
                }
            }).catch((reason) => {
                reject(reason);
            });
        }
    });
}