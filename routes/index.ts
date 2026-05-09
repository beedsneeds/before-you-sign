import { Router, Express, Request, Response } from "express";
import adminRoutes from "./admin.js";
import authRoutes from "./authRoutes.js";
import buildingRoutes from "./buildings.js";
import searchRoutes from "./search.js";
import profileRoutes from "./profile.js";

const router = Router();

//route for admin added for preliminary structure, change and add rest as needed
const constructorMethod = (app: Express) => {
  app.use("/", searchRoutes);
  app.use("/admin", adminRoutes);
  app.use("/", authRoutes);
  app.use("/", buildingRoutes);
  app.use("/profile", profileRoutes);

  // mount router (needed for building route to work)
  app.use("/", router);

  app.use((req: Request, res: Response) => {
    res.status(404).render("error", { title: "Error", error: "Page not found" });
  });
};

//home
router.get("/", async (req, res) => {
  res.render("home", { title: "Home" });
});

export default constructorMethod;
