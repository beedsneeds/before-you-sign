import express from "express";
import exphbs from "express-handlebars";
import session from "express-session";
import configRoutes from "./routes/index.js";
import { connect } from "./data/config/mongoConnection.js";

// Top level await for the db conn (or should we put this in main?)
await connect();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static("public"));


app.use(
  session({
    name: "BeforeYouSignAuthState",
    secret: "some secret string!",
    resave: false,
    saveUninitialized: false,
  })
);

//TEMPORARY LOGGING MIDDLEWARE, REMOVE OR MODIFY AS NEEDED 
app.use((req, res, next) => {
  const sessionInfo = req.session as any;
  let authenticationMessage = "Non-Authenticated";

  if (sessionInfo.user) {
    if (sessionInfo.user.isAdmin === true) {
      authenticationMessage = "Authenticated Admin";
    } else {
      authenticationMessage = "Authenticated User";
    }
  }

  console.log(
    `(${authenticationMessage})`
  );

  next();
});

// makes navbar able to know if someone is logged in
app.use((req, res, next) => {
  const sessionInfo = req.session as any;

  res.locals.loggedIn = !!sessionInfo.user;
  res.locals.isAdmin = sessionInfo.user && sessionInfo.user.isAdmin === true;

  next();
});

//middleware to protect admin route
app.use("/admin", (req, res, next) => {
  const sessionInfo = req.session as any;

  if (!sessionInfo.user) {
    return res.redirect("/login");
  }

  if (sessionInfo.user.isAdmin !== true) {
    return res.status(403).render("error", {
      title: "Error",
      error: "You do not have permission to view the admin dashboard.",
      link: "/",
      linkText: "Return to the home page",
    });
  }

  next();
});


app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
configRoutes(app);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

