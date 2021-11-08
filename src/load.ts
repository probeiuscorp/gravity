(window as any).__GRAVITY = {
    evalNoStrict: function(code: string, args: Record<string, any>): any {
        const entries = Object.entries(args);
        (new Function(...entries.map(entry => entry[0]), code))(...entries.map(entry => entry[1]));
    }
}

import('./resources').then((Resources) => {
    Resources.onFinishedLoading(() => {
        import('./main').then(() => {
            document.getElementById('loading').style.display = 'none';
        });
    });
});