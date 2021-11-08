(window as any).__GRAVITY = {
    evalNoStrict: function(code: string, args: Record<string, any>): void {
        const entries = Object.entries(args);
        (new Function(...entries.map(entry => entry[0]), code))(...entries.map(entry => entry[1]));
    },
    executeInWith(ctx: object, __not_in_ctx_cb: () => void) {
        //@ts-ignore
        with(ctx) {
            __not_in_ctx_cb();
        }    
    }
}

import('./resources').then((Resources) => {
    Resources.onFinishedLoading(() => {
        import('./main').then(() => {
            document.getElementById('loading').style.display = 'none';
        });
    });
});