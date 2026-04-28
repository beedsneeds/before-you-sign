// all admin routes in this file

import { Router } from "express";
import xss from "xss";

import {
  getBuildingById,
  updateBuildingById,
  deleteBuildingById,
} from "../data/buildings.js";


const router = Router();

router.get("/", async (req, res) => {
  return res.render("admin/adminForms", { title: "Admin Dashboard" });
});

router.get("/add", async (req, res) => {
  return res.render("admin/addBuilding", { title: "Add Building" });
});

router.get("/edit", async (req, res) => {
  return res.render("admin/editBuilding", { title: "Edit Building" });
});

router.get("/delete", async (req, res) => {
  return res.render("admin/deleteBuilding", { title: "Delete Building" });
});

// This POST for looking up the building first
router.post("/edit", async (req, res) => {
  const buildingID = xss(req.body.BuildingID || "").trim();

  try {
    if (!buildingID) throw "Building ID must be supplied";

    const building = await getBuildingById(buildingID);

    return res.render("admin/editBuilding", {
      title: "Edit Building",
      building: building,
    });
  } catch (e) {
    return res.status(400).render("admin/editBuilding", {
      title: "Edit Building",
      error: e,
      formData: {
        BuildingID: buildingID,
      },
    });
  }
});

// This POST updates the building after the form is submitted
router.post("/edit/submit", async (req, res) => {
  const buildingData = {
    BuildingID: xss(req.body.BuildingID || "").trim(),
    Address: xss(req.body.Address || "").trim(),
    binNumber: xss(req.body.binNumber || "").trim(),
    AvgRating: xss(req.body.AvgRating || "").trim(),
    ReviewsCount: xss(req.body.ReviewsCount || "").trim(),
  };

  try {
    const updatedBuilding = await updateBuildingById(
      buildingData.BuildingID,
      buildingData.Address,
      buildingData.binNumber,
      buildingData.AvgRating,
      buildingData.ReviewsCount
    );

    return res.render("admin/editBuilding", {
      title: "Edit Building",
      success: "Building updated successfully.",
      building: updatedBuilding,
    });
  } catch (e) {
    return res.status(400).render("admin/editBuilding", {
      title: "Edit Building",
      error: e,
      building: buildingData,
    });
  }
});

// This POST is only for looking up the building before deleting
router.post("/delete", async (req, res) => {
  const buildingID = xss(req.body.BuildingID || "").trim();

  try {
    if (!buildingID) throw "Building ID must be supplied";

    const building = await getBuildingById(buildingID);

    return res.render("admin/deleteBuilding", {
      title: "Delete Building",
      building: building,
    });
  } catch (e) {
    return res.status(400).render("admin/deleteBuilding", {
      title: "Delete Building",
      error: e,
      formData: {
        BuildingID: buildingID,
      },
    });
  }
});

// This POST  deletes after confirmation
router.post("/delete/confirm", async (req, res) => {
  const buildingID = xss(req.body.BuildingID || "").trim();

  try {
    if (!buildingID) throw "Building ID must be supplied";

    await deleteBuildingById(buildingID);

    return res.render("admin/deleteBuilding", {
      title: "Delete Building",
      success: "Building deleted successfully.",
    });
  } catch (e) {
    return res.status(400).render("admin/deleteBuilding", {
      title: "Delete Building",
      error: e,
    });
  }
});

export default router;