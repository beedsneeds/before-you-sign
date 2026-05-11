// all admin routes in this file

import { Router } from "express";
import xss from "xss";

import {
  createBuilding,
  getBuildingById,
  updateBuildingById,
  deleteBuildingById,
} from "../data/buildings.js";

import { BuildingInputSchema } from "../data/models/Building.js";
import { BinSchema, formatZodError } from "../helpers/validation.js";

const router = Router();

const parseBuildingInputForm = (body: any) => {
  return BuildingInputSchema.safeParse({
    address: xss(body.Address || "").trim(),
    BIN: Number(xss(body.BIN || "").trim()),
  });
};

router.get("/", async (req, res) => {
  return res.render("admin/adminForms", { title: "Admin Dashboard" });
});

router.get("/add", async (req, res) => {
  return res.render("admin/addBuilding", { title: "Add Building" });
});

router.post("/add", async (req, res) => {
  const parsed = parseBuildingInputForm(req.body);

  if (!parsed.success) {
    return res.status(400).render("admin/addBuilding", {
      title: "Add Building",
      error: formatZodError(parsed.error),
      formData: {
        Address: xss(req.body.Address || "").trim(),
        BIN: xss(req.body.BIN || "").trim(),
      },
    });
  }

  try {
    await createBuilding(parsed.data.address, parsed.data.BIN);

    return res.render("admin/addBuilding", {
      title: "Add Building",
      success: "Building added successfully.",
    });
  } catch (e) {
    return res.status(400).render("admin/addBuilding", {
      title: "Add Building",
      error: e,
      formData: {
        Address: parsed.data.address,
        BIN: parsed.data.BIN,
      },
    });
  }
});

router.get("/edit", async (req, res) => {
  return res.render("admin/editBuilding", { title: "Edit Building" });
});

router.get("/delete", async (req, res) => {
  return res.render("admin/removeBuilding", { title: "Delete Building" });
});

// Look up building by BIN before editing
router.post("/edit", async (req, res) => {
  const parsedBin = BinSchema.safeParse(xss(req.body.BIN || "").trim());

  if (!parsedBin.success) {
    return res.status(400).render("admin/editBuilding", {
      title: "Edit Building",
      error: formatZodError(parsedBin.error),
      formData: {
        BIN: xss(req.body.BIN || "").trim(),
      },
    });
  }

  try {
    const building = await getBuildingById(parsedBin.data);

    return res.render("admin/editBuilding", {
      title: "Edit Building",
      building: building,
    });
  } catch (e) {
    return res.status(400).render("admin/editBuilding", {
      title: "Edit Building",
      error: e,
      formData: {
        BIN: parsedBin.data,
      },
    });
  }
});

// Submit edited building
router.post("/edit/submit", async (req, res) => {
  const parsedOriginalBin = BinSchema.safeParse(xss(req.body.originalBIN || "").trim());

  const parsedBuilding = parseBuildingInputForm(req.body);

  const formData = {
    originalBIN: xss(req.body.originalBIN || "").trim(),
    BIN: xss(req.body.BIN || "").trim(),
    address: xss(req.body.Address || "").trim(),
  };

  if (!parsedOriginalBin.success || !parsedBuilding.success) {
    let errorMessage = "";

    if (!parsedOriginalBin.success) {
      errorMessage += formatZodError(parsedOriginalBin.error) + "\n";
    }

    if (!parsedBuilding.success) {
      errorMessage += formatZodError(parsedBuilding.error) + "\n";
    }

    return res.status(400).render("admin/editBuilding", {
      title: "Edit Building",
      error: errorMessage,
      building: formData,
    });
  }

  try {
    const updatedBuilding = await updateBuildingById(
      parsedOriginalBin.data,
      parsedBuilding.data.address,
      parsedBuilding.data.BIN,
    );

    return res.render("admin/editBuilding", {
      title: "Edit Building",
      success: "Building was updated",
      building: updatedBuilding,
    });
  } catch (e) {
    return res.status(400).render("admin/editBuilding", {
      title: "Edit Building",
      error: e,
      building: formData,
    });
  }
});

// Look up building by BIN before deleting
router.post("/delete", async (req, res) => {
  const parsedBin = BinSchema.safeParse(xss(req.body.BIN || "").trim());

  if (!parsedBin.success) {
    return res.status(400).render("admin/removeBuilding", {
      title: "Delete Building",
      error: formatZodError(parsedBin.error),
      formData: {
        BIN: xss(req.body.BIN || "").trim(),
      },
    });
  }

  try {
    const building = await getBuildingById(parsedBin.data);

    return res.render("admin/removeBuilding", {
      title: "Delete Building",
      building: building,
    });
  } catch (e) {
    return res.status(400).render("admin/removeBuilding", {
      title: "Delete Building",
      error: e,
      formData: {
        BIN: parsedBin.data,
      },
    });
  }
});

// Delete after confirmation
router.post("/delete/confirm", async (req, res) => {
  const parsedBin = BinSchema.safeParse(xss(req.body.BIN || "").trim());

  if (!parsedBin.success) {
    return res.status(400).render("admin/removeBuilding", {
      title: "Delete Building",
      error: formatZodError(parsedBin.error),
    });
  }

  try {
    await deleteBuildingById(parsedBin.data);

    return res.render("admin/removeBuilding", {
      title: "Delete Building",
      success: "Building deleted successfully.",
    });
  } catch (e) {
    return res.status(400).render("admin/removeBuilding", {
      title: "Delete Building",
      error: e,
    });
  }
});

export default router;
