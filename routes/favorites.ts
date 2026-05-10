import { Router } from "express";
import xss from "xss";
import { addFavBuilding, removeFavBuilding, getFavBuildings } from "../data/favorites.js";

const router = Router();

//viewing the favorites page
router.get("/favorites", async (req, res) => {
  try {
    const user = (req.session as any).user;

    if (!user) {
      return res.redirect("/signin");
    }

    const buildings = await getFavBuildings(user.userId);

    return res.render("favorites", {
      title: "My Favorite Buildings",
      buildings,
    });
  } catch (e) {
    return res.status(500).render("error", {
      title: "Error",
      error: e,
    });
  }
});

//adding a building to favorites
router.post("/favorites/:buildingId", async (req, res) => {
  try {
    const user = (req.session as any).user;

    if (!user) {
      return res.redirect("/signin");
    }

    const buildingId = xss(req.params.buildingId || "").trim();
    const redirectTo = xss(
      String(req.body.redirectTo || req.get("Referrer") || "/favorites"),
    ).trim();
    const result = await addFavBuilding(user.userId, buildingId);

    if (result.alreadyFavorited) {
      return res.redirect(
        `${redirectTo}${redirectTo.includes("?") ? "&" : "?"}favoriteExists=true`,
      );
    }

    return res.redirect(redirectTo);
  } catch (e) {
    return res.status(400).render("error", {
      title: "Error",
      error: e,
    });
  }
});

//removing a building from favorites
router.post("/favorites/:buildingId/remove", async (req, res) => {
  try {
    const user = (req.session as any).user;

    if (!user) {
      return res.redirect("/signin");
    }

    const buildingId = xss(req.params.buildingId || "").trim();
    const redirectTo = xss(
      String(req.body.redirectTo || req.get("Referrer") || "/favorites"),
    ).trim();

    await removeFavBuilding(user.userId, buildingId);

    return res.redirect(redirectTo);
  } catch (e) {
    return res.status(400).render("error", {
      title: "Error",
      error: e,
    });
  }
});

export default router;
