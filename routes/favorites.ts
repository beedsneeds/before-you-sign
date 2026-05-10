import { Router } from "express";
import xss from "xss";
import { BinSchema } from "../helpers/validation.js";
import { addFavBuilding, removeFavBuilding, getFavBuildings } from "../data/favorites.js";

const router = Router();

const safeRedirect = (raw: unknown, fallback = "/favorites"): string => {
  const value = typeof raw === "string" ? xss(raw).trim() : "";
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
};

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

    const parsedBin = BinSchema.safeParse(xss(req.params.buildingId || "").trim());
    if (!parsedBin.success) {
      return res.status(400).render("error", {
        title: "Error",
        error: "Invalid building reference.",
      });
    }

    const redirectTo = safeRedirect(req.body.redirectTo ?? req.get("Referrer"));
    const result = await addFavBuilding(user.userId, parsedBin.data);

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

    const parsedBin = BinSchema.safeParse(xss(req.params.buildingId || "").trim());
    if (!parsedBin.success) {
      return res.status(400).render("error", {
        title: "Error",
        error: "Invalid building reference.",
      });
    }

    const redirectTo = safeRedirect(req.body.redirectTo ?? req.get("Referrer"));

    await removeFavBuilding(user.userId, parsedBin.data);

    return res.redirect(redirectTo);
  } catch (e) {
    return res.status(400).render("error", {
      title: "Error",
      error: e,
    });
  }
});

export default router;
