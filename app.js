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

app.get("/showgotrequest", middleware.isLoggedIn, function (req, res) {


  Appliedproject.find({}, function (err, foundappliedprojects) {
    if (err) {
      console.log(err);
    } else {
      
          res.render("gotRequests", {
            user: req.user,
            applications: foundappliedprojects
               });
        
    
      
    }
  });
});

app.post("/showgotrequest/:id/:userId/accept", function (req, res) {
  let flag1 = 0;
  const projectId = req.params.id;
  const userId = req.params.userId;
  Project.findById(projectId, function (err, foundProject) {
    if (err) {
      console.log(err);
    } else {
      foundProject.team.forEach(function (member) {
        if (member.equals(userId)) {
          flag1 = 1;
        }
      });
      if (flag1 === 0) {
        if (foundProject.need != 0) {
          foundProject.team.push(userId);
          foundProject.need = foundProject.need - 1;
        }
        foundProject.save();
      }
    }
  });
  res.redirect("/showgotrequest");
});
app.post("/showgotrequest/:id/:userId/reject", function (req, res) {
  const projectId = req.params.id;
  const userId = req.params.userId;
  Project.findById(projectId, function (err, foundProject) {
    if (err) {
      console.log(err);
    } else {
      const index = foundProject.team.indexOf(userId);
      if (index > -1) {
        var p = foundProject.team.splice(index, 1);
        if (foundProject.need != foundProject.max) {
          foundProject.need = foundProject.need + 1;
        }
      }

      foundProject.save();
    }
  });
  



  Credit.deleteOne({id: projectId,userId:String(userId)}).then(function(){
    console.log("Data deleted"); // Success
}).catch(function(error){
    console.log(error); // Failure
});
  res.redirect("/showgotrequest");
});

app.get("/request", middleware.isLoggedIn, function (req, res) {
  User.findById(req.user._id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      Project.find(
        { _id: { $in: foundUser.appliedProjects } },
        function (err, foundProjects) {
          if (err) {
            console.log(err);
          } else {
            res.render("requests", {
              user: req.user,
              appliedprojects: foundProjects,
            });
          }
        }
      );
    }
  });
});

app.post("/request/:id", middleware.isLoggedIn, function (req, res) {
  const projectId = req.params.id;
  User.findById(req.user._id, function (err, foundUser) {
    if (err) {
      console.log(err);
      res.redirect("/projects");
    } else {
      var flag = 0;
      foundUser.appliedProjects.forEach(function (project) {
        console.log(projectId);
        console.log(project);
        if (project.equals(projectId)) {
          flag = 1;
        }
      });
      console.log(flag);
      if (flag === 0) {
        Project.findById(projectId, function (err, found) {
          if (err) {
            console.log(err);
          } else {
            User.findById(found.owner.id, function (err, foundOwner) {
              if (err) {
                console.log(err);
              } else {
                if (foundOwner.username != req.user.username) {
                  console.log(foundOwner.username);
                  console.log(req.user.username);
                  foundUser.appliedProjects.push(projectId);
                  foundUser.save();
                }
              }
            });
          }
        });
      }
      res.redirect("/projects");
    }
  });
});

app.post("/request/:id/delete", middleware.isLoggedIn, function (req, res) {
  const projectId = req.params.id;

  Project.findById(projectId, function (err, foundProject) {
    if (err) {
      console.log(err);
    } else {
      const index = foundProject.team.indexOf(req.user._id);
      if (index > -1) {
        var p = foundProject.team.splice(index, 1);
        if (foundProject.need != foundProject.max) {
          foundProject.need = foundProject.need + 1;
        }
      }

      foundProject.save();

  
    }
 
  });

  Credit.deleteOne({id: projectId,userId:String(req.user._id)}).then(function(){
    console.log("Data deleted"); // Success
}).catch(function(error){
    console.log(error); // Failure
});

  User.findById({ _id: req.user._id }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      const index = foundUser.appliedProjects.indexOf(projectId);
      if (index > -1) {
        var p = foundUser.appliedProjects.splice(index, 1);
      }

      foundUser.save();
      res.redirect("/request");
    }
  });
});


app.get("/credits/request/:projectId/:userId",middleware.isLoggedIn,function(req,res){
          const projectId=req.params.projectId;
          const userId=req.params.userId;
           res.render("creditsRequest",{user:req.user,pId:projectId,uId:userId});
});


app.post("/credits/:projectId/:userId",middleware.isLoggedIn,function (req, res) {
    const pId = req.params.projectId;
    const uId = req.params.userId;
    const link=req.body.link;
    const descrip=req.body.description;
    Project.findById(pId, function (err, foundProject) {
      if (err) {
        console.log(err);
      } else {
        User.findById(uId, function (err, foundUser) {
          if (err) {
            console.log(err);
          } else {
            let credits = new Credit({
              id: foundProject._id,
              title: foundProject.title,
              name: foundUser.email,
              link:link,
              credits:0,
              description:descrip,
              userId: foundUser._id,
              owner:foundProject.owner,
              flag:0
            });
           
            Credit.find({id:pId,userId:uId}, function (err, found) {
              if (err) {
                console.log(err);
              } 
              else if(found.length==0){
                credits.save();
              }
            });
           
              
            
            res.redirect("/request");
          }
        });
      }
    });
  }
);

app.get("/admin", middleware.isLoggedIn, function (req, res) {
  if (req.user.username.toLowerCase() === "kartikkhanna2000@gmail.com") {
    Credit.find({},function(err,foundRequests){
      if(err){
        console.log(err);
      }
      else{
        res.render("admin", { user: req.user,applications:foundRequests });
      }
    })
    
  }
});
app.get("/admin/:id",function(req,res){
  if (req.user.username.toLowerCase() === "kartikkhanna2000@gmail.com") {
    Credit.findById(req.params.id,function(err,foundApplication){
      if(err){
        console.log(err);
      }
      else{
        res.render("status",{user:req.user,project:foundApplication});
      }
    })
    


  }
});
app.post("/credits/:id",function(req,res){
  const id=req.params.id;
  const usercredits=parseInt(req.body.credits);
  console.log(id);

  Credit.findById(id, function (err, found) {
    if (err) {
      console.log(err);
    } 
    else {
      console.log(found.flag);
      if(found.flag==0){
      
      User.findById(found.userId,function(err,foundUser){
        if(err){
          console.log(err)
        }
        else{
         
        
          console.log(foundUser.credits);
          foundUser.credits+=usercredits;
          found.credits+=usercredits;
          foundUser.save();
          found.save();
         
          
        }
      })
      found.flag=1;
      found.save();
      }
    }
  })

  
  res.redirect("/admin");
 
})

app.post("/creditsdelete/:id",function(req,res){
  const id=req.params.id;
  console.log(id);

  Credit.findById(id, function (err, found) {
    if (err) {
      console.log(err);
    } 
    else {
      console.log(found.flag);
      if(found.flag==1){
      
      User.findById(found.userId,function(err,foundUser){
        if(err){
          console.log(err)
        }
        else{
         
        
          console.log(foundUser.credits);
          foundUser.credits-=found.credits;
          found.credits-=found.credits;
          found.save();
          foundUser.save();
         
          
        }
      })
      found.flag=0;
      found.save();
      }
    }
  })

  
  res.redirect("/admin");
 
})

app.get("/post", middleware.isLoggedIn, function (req, res) {
  if (req.user.username.toLowerCase() === "kartikkhanna2000@gmail.com") {
    
        res.render("post", { user: req.user });
     
    
  }
});
app.post("/post",middleware.isLoggedIn,upload.single('myImage'),function(req,res){

  var img = fs.readFileSync(req.file.path);
    var encode_image = img.toString('base64');          
    var finalImg = {                                    // Define a JSONobject for the image attributes for saving to database
        contentType: req.file.mimetype,
        path:req.file.path,
        image:  new Buffer(encode_image, 'base64')
    };
   
  const title=req.body.title;
  const descrip=req.body.description;
  const credits=req.body.credits;


 let newItem = new Item({
 title:title,
 description:descrip,
 swag:req.body.swag,
 credits:credits,
 alutoze:req.body.alutoze,
 img:finalImg
});
newItem.save();
res.redirect("/shop")
});


app.get("/shop",middleware.isLoggedIn,function(req,res){

  Item.find({},function(err,foundItems){
    if(err){
      console.log(err);
    }
    else{
      res.render("shop",{user:req.user,items:foundItems});
    }
  })
 
});

app.post("/shop/:id",middleware.isLoggedIn,function(req,res){
  const id = req.params.id;
  console.log(id);
  Item.findById(id,function(err,foundItem){
    if(err){
      console.log(err);
    }
    else{
      console.log(foundItem);
      User.findById(req.user._id,function(err,foundUser){
        if(err){
          console.log(err);
        }
        else{
          if(foundUser.credits>=foundItem.credits){
          foundUser.credits-=foundItem.credits;
          let data={
            itemname:foundItem.title,
            spent:foundItem.credits,
            details:"We will send you details once your contribution is received",
            name:req.user.email

          }
          foundUser.history.push(data);
          
            foundUser.xp+=foundItem.alutoze;
        
         
          foundUser.save();
          }
        }
      })
    }
  })
  setTimeout(function(){res.redirect("/shop");},7000);
});

app.get("/orderHistory",middleware.isLoggedIn,function(req,res){
  
  User.findById(req.user._id,function(err,foundUser){
    if(err){
      console.log(err);
    }
    else{
      res.render("transactions",{user:req.user,transactions:foundUser.history});
    }
  })
})


app.get("/track",middleware.isLoggedIn,function(req,res){
   var arr_push=[]
    User.find({},function(err,foundUser){
      if(err){
        console.log(err);
      
      }
      else{
        foundUser.forEach(function(user){
          if(user.history.length!=0)
          arr_push.push(user.history);
      
          
        
        })
      
        res.render("track",{user:req.user,applications:arr_push});
        
      }
    })
   
 
  
})

app.post("/track/:id",function(req,res){
  const id=req.params.id;
  const notify=req.body.notify;
  let userId;
  User.find({},function(err,foundUser){
    if(err){
      console.log(err);
    }
    else{
       foundUser.forEach(function(foundaUser){
         foundaUser.history.forEach(function(hid){
      if(hid._id==id){
        hid.details=notify;
      }

    })
     foundaUser.save();
    })
    }
  })

  res.redirect("/track");
})


let port = process.env.PORT;
if (port == null || port == "") {
  port = 9000;
}
app.listen(port, function () {
  console.log("Server started successfully at port 9000");
});
