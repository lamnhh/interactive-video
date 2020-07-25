let express = require("express");
let path = require("path");

let app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", function (_, res) {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

let port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`Server running port ${port}`);
});
