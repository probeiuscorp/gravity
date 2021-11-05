import('./resources').then((Resources) => {
    Resources.onFinishedLoading(() => {
        import('./main').then(() => {
            document.getElementById('loading').style.display = 'none';
        });
    });
});