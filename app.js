var express = require("express"),
  app = express(),
  bodyparser = require("body-parser"),
  mongoose = require("mongoose"),
  multer = require("multer"),
  methodOverride = require("method-override"),
  passport = require("passport"),
  Project = require("./models/project"),
  User = require("./models/user"),
  Appliedproject = require("./models/appliedProject"),
  Credit = require("./models/credits"),
  Team = require("./models/team"),
  Item = require("./models/item"),
  middleware = require("./middleware"),
  session = require("express-session"),
  multer = require("multer"),
  fs = require("fs"),
 {spawn}           = require('child_process'),
 fs                = require("fs"),
  path = require("path");

// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads"); //null is the error field and uploads is the folder name where pictures will be stored
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    ); //fieldname is the name given to the upload input box in the html file and path is used to get the file extension name
  },
});
var upload = multer({ storage: storage });

app.use(bodyparser.urlencoded({ extended: true }));
app.use("/public", express.static("public"));
app.use(methodOverride("_method"));

app.set("view engine", "ejs");

mongoose.connect(
  "mongodb+srv://kartik_alute:Test123@cluster0.8be9m.mongodb.net/alute?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
);

//Setting up passport
app.use(
  session({
    secret: "Its our secret.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const { POINT_CONVERSION_COMPRESSED } = require("constants");
const e = require("express");
const { isLoggedIn } = require("./middleware");
var indexRoutes = require("./routes/index");

app.use(indexRoutes);

var query_array=[[]];

app.get("/projects", function (req, res) {
  Project.find({}, function (err, allProjects) {
    if (err) {
      console.log(err);
    } else {
      res.render("project", { user: req.user, projects: allProjects,data:"",queries:query_array});
    }
  });

  
});

















let port = process.env.PORT;
if (port == null || port == "") {
  port = 9000;
}
app.listen(port, function () {
  console.log("Server started successfully at port 9000");
});
