const express = require("express");
const router = new express.Router();
const userModel = require("../models/User");
const bcrypt = require("bcrypt"); // intro to bcrypt hashing algorithm https://www.youtube.com/watch?v=O6cmuiTBZVs
const uploader = require("./../config/cloudinary");


router.get("/signup", (req, res) => {
  res.render("signup",{ js:["signup"] });
});

router.get("/signin", (req, res) => {
  res.render("signin");
});



  
router.post("/signup", (req, res, next) => {
    const user = req.body; // req.body contains the submited informations (out of post request)
     console.log(req.body) ;
    if (!user.email || !user.password) {
      req.flash("error", "no empty fields here please");
      return res.redirect("/signup");
      
    } else {
      userModel
        .findOne({ email: user.email })
        .then(dbRes => {
          if (dbRes) { // si dbRes n'est pas null
            req.flash("error", "sorry, email is already taken :/");
            return res.redirect("/signup");
          }
  
          const salt = bcrypt.genSaltSync(10); // https://en.wikipedia.org/wiki/Salt_(cryptography)
          const hashed = bcrypt.hashSync(user.password, salt);
          // generates a unique random hashed password
          user.password = hashed; // new user is ready for db
      
  
          userModel.create(user).then(() => res.redirect("/signin"));
        })
        .catch(next);
    }
  });
  
  // action::Login
  
  router.post("/signin", (req, res, next) => {
    const user = req.body;
    console.log
  
    if (!user.email || !user.password) {
      // one or more field is missing
      req.flash("error", "wrong credentials");
      return res.redirect("/signin");
    }
  
    userModel
      .findOne({ email: user.email })
      .then(dbRes => {
        if (!dbRes) {
          // no user found with this email
          req.flash("error", "wrong credentials");
          return res.redirect("/signin");
        }
        // user has been found in DB !
        if (bcrypt.compareSync(user.password, dbRes.password)) {
          // encryption says : password match success
          const { _doc: clone } = { ...dbRes }; // make a clone of db user
  
          delete clone.password; // remove password from clone
          // console.log(clone);
  
          req.session.currentUser = clone; // user is now in session... until session.destroy
          return res.redirect("/prod-manage");
          
        } else {
          // encrypted password match failed
          req.flash("error", "wrong credentials");
          return res.redirect("/signin");
        }
      })
      .catch(next);
  });
  
  // action::Logout
  
  router.get("/logout", (req, res) => {
    req.session.destroy(() => {
      res.redirect("/signin");
    });
  });



module.exports = router;
