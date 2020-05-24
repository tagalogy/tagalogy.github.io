"use strict";
let express = require("express");
let app = express();
let port = process.env.PORT || 4000;

console.log("Starting server");
app.set("port", port);
app.use(
    express.static("public", {
        maxAge: "0",
    }),
);
app.listen(app.get("port"), error => {
    if (error) throw error;
    console.log(`Server started! Listening at port ${port}`);
});
