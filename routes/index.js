var express = require('express');
var router = express.Router();
const userModel = require("./users")
const expenseModel = require("./expense");

const passport = require("passport");
const LocalStrategy = require("passport-local");
passport.use(new LocalStrategy(userModel.authenticate()));

const { sendmail } = require("../utils/sendmail");
// const { sendmail } = require("C:\\Users\\HP\\OneDrive\\Desktop\\ExpenseTrackerApp\\utils\\sendmail.js");


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/signup', function(req, res, next) {
  res.render('signup');
});

router.post("/signup", async function(req,res,next){
  try{
    await userModel.register(
      {
        username:req.body.username,
        email:req.body.email
      },
      req.body.password
    );
    res.redirect("/signin");
  } catch(error){
    console.log(error);
    res.send(error);
  }
})

router.get('/signin', function(req, res, next) {
  res.render('signin', {error: req.flash('error')});
});

router.get('/forget',function(req, res, next){
  res.render("forget", { admin: req.user});
});

router.post("/send-mail", async function (req, res, next) {
  try {
      const user = await userModel.findOne({ email: req.body.email });
      if (!user)
          return res.send("User Not Found! <a href='/forget'>Try Again</a>");

      sendmail(user.email, user, res, req);
  } catch (error) {
      console.log(error);
      res.send(error);
  }
});

router.post("/forget/:id" , async function(req, res, next){
  try{

    const user = await userModel.findById(req.params.id);
    if(!user)
    return res.send("User not found! <a href='/forget'>Try Again</a>.");

    if(user.token == req.body.token){
      user.token = -1;
      await user.setPassword(req.body.newpassword);
      await user.save();
      res.redirect("/signin");
    }else{
      user.token = -1;
      await user.save();
      res.send("Invalid Token! <a href='/forget'>Try Again<a/>");
    }

  } catch(error){
    res.send(error);
  }
});

router.post("/signin", passport.authenticate("local",{
  successRedirect: "/profile",
  failureRedirect: "/signin",
  failureFlash: true,
}),
function(req, res, next){});

router.get("/profile", isLoggedIn, async function(req, res, next){
  try{
    const { expenses } = await req.user.populate("expenses");
    console.log(req.user, expenses);
    res.render("profile",{ admin: req.user, expenses });
  }catch(error){
    res.send(error);
  }
});

router.get('/reset', isLoggedIn, function(req, res, next) {
  res.render('reset' , { admin: req.user });
});

router.post("/reset", isLoggedIn, async function(req, res, next){
  try{

    await req.user.changePassword(
      req.body.oldpassword,
      req.body.newpassword
    );

    await req.user.save();
    res.redirect("/profile");

  }catch(error){
    res.send(error);
  }
});

router.get("/signout", isLoggedIn, function(req, res, next){
  req.logout(() => {
    res.redirect("/signin");
  });
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    next();
  }else{
    res.redirect("/signin");
  }
}

router.get("/createexpense", isLoggedIn, function(req, res, next){
  res.render("createexpense", { admin: req.user });
});

router.get("/datashow", isLoggedIn, async function(req, res, next){
  try{
    const{ expenses } = await req.user.populate("expenses");
    console.log(req.user, expenses);
    res.render("datashow" , { admin: req.user, expenses});
  }catch(error){
    res.send(error);
  }
});

router.post("/createexpense", isLoggedIn, async function(req, res, next){
  try{
    const expense = new expenseModel(req.body);
    req.user.expenses.push(expense._id);
    expense.user = req.user._id;
    await expense.save();
    await req.user.save();
    res.redirect("/datashow")
  }catch(error){
    res.send(error);
  }
});

router.get("/filter", async function (req, res, next) {
  try {
      let { expenses } = await req.user.populate("expenses");
      expenses = expenses.filter((e) => e[req.query.key] == req.query.value);
      res.render("profile", { admin: req.user, expenses });
  } catch (error) {
      console.log(error);
      res.send(error);
  }
});
module.exports = router;
