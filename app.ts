import express from "express";
import configRoutes from "./routes/index.js";
import exphbs from "express-handlebars";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static("public"));

app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");

configRoutes(app);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
