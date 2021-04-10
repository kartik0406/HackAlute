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
app.post("/result",middleware.isLoggedIn,function(req,res){

  Project.find({}, function (err, allProjects) {
    if (err) {
      console.log(err);
    } else {
  var dataToSend;
  // spawn new child process to call the python script
  console.log(req.body.query);
 
   var input=req.body.query;
   User.findById(req.user._id,function(err,foundUser){
    if(err){
      console.log(err)
    }
    else{
      console.log(foundUser.fag);
  const python = spawn('python', ['FAQ_BOT_ACTUAL.py',input,JSON.stringify(foundUser.fag)]);
  // collect data from script
  python.stdout.on('data', function (data) {
   dataToSend = data.toString();
  
    var dataToAppend="";
    var i=dataToSend.length-1;
    var count=0;
    var pos=0;
    while(i>=0){
      
      if(dataToSend[i]=="\n"){
        count++;
        if(count==2){
          pos=i;
          break;
        }
      }
      i--;
    }
    dataToAppend=dataToSend.slice(i+1,dataToSend.length-2);
    foundUser.fag.push(dataToAppend);
    foundUser.save();
   
    fs.appendFile("data.text",dataToAppend+",",function(err){
      if(err){
        console.log(err)
      }
    })
   
    dataToSend=dataToSend.slice(0,dataToSend.length-dataToAppend.length-2)
  
  });
  // in close event we are sure that stream from child process is closed
  python.on('close', (code) => {
  console.log(`child process close all stdio with code ${code}`);
  // send data to browser
  query_array.push([req.body.query,dataToSend]);
  res.render("project",{user:req.user,projects: allProjects,queries:query_array});
  });

 }
})
}
});
  
})


app.get("/projects/new", middleware.isLoggedIn, function (req, res) {
  res.render("new", { user: req.user });
});
app.post("/projects", function (req, res) {
  const title = req.body.title;
  const description = req.body.description;
  const technology = req.body.technology;
  const max = req.body.members;
  const credits = max * 10;
  var user = {
    id: req.user,
    username: req.user.email,
  };
  const newproject = new Project({
    title: title,
    descrip: description,
    technologies: technology,
    max: max,
    need: max,
    skills:req.body.skills,
    credits: credits,
    owner: user,
  });

  newproject.save(function (err) {
    if (!err) {
      req.user.projects.push(newproject._id);
      req.user.save();
      res.redirect("/projects");
    }
  });
});

app.get("/projects/:id", function (req, res) {
  const projectId = req.params.id;
  Project.findById(projectId, function (err, foundProject) {
    if (err) {
      console.log(err);
    } else {
      res.render("show", { project: foundProject, user: req.user });
    }
  });
});

app.get("/userprofile/editproject", middleware.isLoggedIn, function (req, res) {
  User.findById(req.user.id)
    .populate("projects")
    .exec(function (err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        res.render("editproject", { userprojects: foundUser, user: req.user });
      }
    });
});

app.get("/userprofile", middleware.isLoggedIn, function (req, res) {
  Appliedproject.find({}).remove().exec();
  User.findById(req.user._id, function (err, foundUser) {
    console.log(foundUser.projects);
    User.find(
      { appliedProjects: { $in: foundUser.projects } },
      function (err, foundApplications) {
        if (err) {
          console.log(err);
        } else {
          console.log(foundApplications);

          foundApplications.forEach(function (foundApplication) {
            console.log(foundApplication.appliedProjects);
            foundApplication.appliedProjects.forEach(function (project) {
              Project.findById(project, function (err, foundProject) {
                if (err) {
                  console.log(err);
                } else {
                  User.findById(
                    foundProject.owner.id,
                    function (err, foundOwner) {
                      if (err) {
                        console.log(err);
                      } else {
                        //console.log(foundOwner.username);
                        if (foundOwner.username === req.user.username) {
                          console.log(
                            foundProject.title,
                            foundApplication.email
                          );

                          let appliedProjectss = new Appliedproject({
                            id: foundProject._id,
                            title: foundProject.title,
                            name: foundApplication.email,
                            userId: foundApplication._id,
                          });
                          appliedProjectss.save();
                        }
                      }
                    }
                  );
                }
              });
            });
          });
        }
      }
    );
  });


  res.render("profile", { user: req.user });
});

app.get("/userprofile/:id", function (req, res) {
  var profileuser = req.params.id;
  User.findById(profileuser, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      res.render("userprofile", { puser: foundUser, user: req.user });
    }
  });
});

app.get("/editprofile", middleware.isLoggedIn, function (req, res) {
  res.render("editprofile", { user: req.user, puser: req.user });
});

app.put(
  "/userprofile",
  middleware.isLoggedIn,
  upload.single("myImage"),
  function (req, res) {
    var img = fs.readFileSync(req.file.path);
    var encode_image = img.toString("base64");
    var finalImg = {
      // Define a JSONobject for the image attributes for saving to database
      contentType: req.file.mimetype,
      path: req.file.path,
      image: new Buffer(encode_image, "base64"),
    };
    var userData = {
      username: req.user.username,
      about: req.body.about,
      img: finalImg,
      email: req.body.name,
      skills:req.body.skills,
      institute: req.body.institute,
      language: req.body.language,
      github: req.body.github,
      linkedIn: req.body.linkedIn,
    };
    User.findByIdAndUpdate(req.user.id, userData, function (err, updateUser) {
      if (err) {
        console.log(err);
        res.redirect("/userprofile");
      } else {
        console.log(userData);
        console.log(updateUser);
        res.redirect("/userprofile");
      }
    });
  }
);

app.get(
  "/projects/editproject/:id",
  middleware.isLoggedIn,
  function (req, res) {
    const projectId = req.params.id;
    Project.findById(projectId, function (err, foundProject) {
      if (err) {
        console.log(err);
      } else {
        res.render("newedit", { user: req.user, project: foundProject });
      }
    });
  }
);

app.put(
  "/projects/editproject/:id",
  middleware.isLoggedIn,
  function (req, res) {
    const projectId = req.params.id;
    const title = req.body.title;
    const description = req.body.description;
    const technology = req.body.technology;
    const max = req.body.members;
    var user = {
      id: req.user,
      username: req.user.email,
    };
    const updatedProject = {
      title: title,
      descrip: description,
      technologies: technology,
      skills:req.body.skills,
      max: max,
      need: max,
      owner: user,
    };

    Project.findByIdAndUpdate(
      projectId,
      updatedProject,
      function (err, updated) {
        if (err) {
          console.log(err);
          res.redirect("/editproject/editproject");
        } else {
          console.log(updatedProject);
          console.log(updated);
          res.redirect("/userprofile/editproject");
        }
      }
    );
  }
);

app.delete(
  "/projects/editproject/delete/:id",
  middleware.isLoggedIn,
  function (req, res) {
    Project.findById(req.params.id, function (err, foundProject) {
      if (err) {
        console.log(err);
      } else {
        User.findById(foundProject.owner.id, function (err, foundOwner) {
          console.log(foundOwner.username);
          console.log(req.user.username);
          if (req.user.username === foundOwner.username) {
            Project.findByIdAndRemove(
              req.params.id,
              function (err, foundProject) {
                if (err) {
                  console.log(err);
                } else {
                  console.log(foundOwner.projects);
                  console.log(foundProject._id);

                  // User.update({_id:req.user._id},{$pull:{projects:{$in:["5fc481fb447417376853704e"]}} },{multi:true});
                  //  User.updateOne({_id: req.user._id}, {$pull: { projects: { $in: [foundProject._id] } }})
                  const index = foundOwner.projects.indexOf(foundProject._id);
                  if (index > -1) {
                    var p = foundOwner.projects.splice(index, 1);
                  }

                  console.log(foundOwner.projects);
                  foundOwner.save();
                  res.redirect("/userprofile/editproject");
                }
              }
            );
          }
        });
      }
    });
  }
);

















let port = process.env.PORT;
if (port == null || port == "") {
  port = 9000;
}
app.listen(port, function () {
  console.log("Server started successfully at port 9000");
});
