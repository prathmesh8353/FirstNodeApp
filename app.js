const express = require("express");
const userModel = require("./models/user");
const postModel = require("./models/post");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, resp) => {
  resp.render("index");
});

app.get("/login", (req, resp) => {
  resp.render("login");
});

app.get("/logout", (req, resp) => {
    resp.cookie("tokwn", "");
    resp.redirect("/login");
  });

app.post("/register", async (req, resp) => {
  let { username, name, password, age, email } = req.body;
  let user = await userModel.findOne({ email });

  if (user) return resp.status(500).send("User Already Register");

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userModel.create({
        username,
        email,
        name,
        age,
        password: hash,
      });

      let token = jwt.sign({ email: email, userid: user._id }, "shhhh");
      resp.cookie("token", token);

      resp.send("Register");
    });
  });
});

app.post("/login", async (req, resp) => {
  let { password, email } = req.body;
  let user = await userModel.findOne({ email });

  if (!user) return resp.status(500).send("Something Went Wrong");

  bcrypt.compare(password, user.password, (err, result) => {
    if (result) return resp.status(200).send("Logged in Successfully");
    else return resp.redirect("/login");
  });
});

app.listen(3000);
