import adminRoutes from "./admin.js";

//route for admin added for preliminary structure, change and add rest as needed
const constructorMethod = (app) => {
  app.use("/admin", adminRoutes);

  app.use("*", (req, res) => {
    res.status(404).render("error", { title: "Error", error: "Page not found" });
  });
};

export default constructorMethod;