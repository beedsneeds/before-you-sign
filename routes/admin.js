// all admin routes in this file
// 

import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  res.render("admin/adminForms", { title: "Admin Dashboard" });
});

router.get("/add", async (req, res) => {
  res.render("admin/addBuilding", { title: "Add Building" });
});

router.get("/edit", async (req, res) => {
  res.render("admin/editBuilding", { title: "Edit Building" });
});

router.get("/delete", async (req, res) => {
  res.render("admin/deleteBuilding", { title: "Delete Building" });
});

router.post("/add", async (req, res) => {
  res.render("admin/addBuilding", { title: "Add Building" });
});

router.post("/edit", async (req, res) => {
  res.render("admin/editBuilding", { title: "Edit Building" });
});

router.post("/delete", async (req, res) => {
  res.render("admin/deleteBuilding", { title: "Delete Building" });
});

export default router;