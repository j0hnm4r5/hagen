const { app, BrowserWindow } = require(`electron`);

function createWindow() {
	// create browser window
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		// webPreferences: {
		// 	webSecurity: false,
		// },
	});

	// load the html file
	win.loadFile(`/Users/jmars/Projects/Dev/hagen/test/electron.html`);

	// open devtools
	win.webContents.openDevTools();
}

app.on(`ready`, () => {
	createWindow();
});
