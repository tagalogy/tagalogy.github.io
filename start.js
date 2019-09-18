"use strict";
var app = express();

var port = process.env.PORT || 5000

// Start hosting static files
console.log("Starting server");
app.set("port", port);
app.use(express.static("public", {
    maxAge: "0"
}));
app.listen(app.get('port'), function(error) {
    if(error) throw error;
    console.log("Server started! Listening at port " + port);
});
var option = {
    module: true
};
