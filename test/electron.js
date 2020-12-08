const { app, BrowserWindow } = require(`electron`);
const {resolve} = require("path")

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
	win.loadFile(resolve(__dirname, "electron.html"));

	// open devtools
	win.webContents.openDevTools();
}

app.on(`ready`, () => {
	createWindow();
});
