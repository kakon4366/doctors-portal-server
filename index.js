const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
	res.send("Doctors portal server is running");
});

app.listen(port, () => {
	console.log(`This server is running port: ${port}`);
});
