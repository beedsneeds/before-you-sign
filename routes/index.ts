import adminRoutes from "./admin.js";
import { Express, Request, Response } from "express";

//route for admin added for preliminary structure, change and add rest as needed
const constructorMethod = (app: Express) => {
  app.use("/admin", adminRoutes);

  app.use((req: Request, res: Response) => {
    res.status(404).render("error", { title: "Error", error: "Page not found" });
  });
};

export default constructorMethod;