var express = require("express");
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static("public", {
    maxAge: "0"
}));

app.listen(app.get('port'));
