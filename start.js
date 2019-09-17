var express = require("express");
var Terser = require("terser");
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static("public", {
    maxAge: "0"
}));

app.listen(app.get('port'));
