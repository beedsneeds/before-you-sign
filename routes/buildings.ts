import { Router } from "express";
import xss from "xss";
import { Types } from "mongoose";
import { BinSchema, ObjectIdSchema, formatZodError } from "../helpers/validation.js";
import { AddReviewSchema } from "../data/reviews.js";
import { CommentInputSchema } from "../data/models/Comment.js";
import { ReplyInputSchema } from "../data/models/Reply.js";
import { getBuildingById } from "../data/buildings.js";
import { calculateRatingByViolations } from "../data/violations.js";
import { getReviewsByBuildingId, getReviewByUserAndBuilding } from "../data/reviews.js";
import { getCommentsByBuildingId, addComment } from "../data/comments.js";
import { addReview } from "../data/reviews.js";
import { getViolationsByBuildingId, getBuildingsByRegID } from "../data/violations.js";
import { addReply, getRepliesByTopicId } from "../data/replies.js";
import { getFavBuildings } from "../data/favorites.js";

const router = Router();

const TopicTitleFormSchema = CommentInputSchema.pick({ topicTitle: true });
const ReplyFormSchema = ReplyInputSchema.pick({ replyText: true });

// building route plus trycatch
router.get("/building/:id", async (req, res) => {
  try {
    const id = xss(req.params.id || "").trim();
    const building = await getBuildingById(id);
    const buildingId = (building as any)._id;
    const reviews = await getReviewsByBuildingId(buildingId);
    const comments = await getCommentsByBuildingId(buildingId);

    const sessionInfo = req.session as any;
    const favoriteBuildings = sessionInfo?.user
      ? await getFavBuildings(sessionInfo.user.userId)
      : [];
    const isFavorite = favoriteBuildings.some(
      (fav) => String((fav as any)._id) === String(buildingId),
    );

    const userReview = sessionInfo?.user
      ? await getReviewByUserAndBuilding(
          new Types.ObjectId(sessionInfo.user.userId),
          buildingId,
        )
      : null;

    const commentsWithReplies = [];
    let assoc_bldgs: any[] = [];
    const regID = (building as any).regID ?? null;

    for (const comment of comments) {
      const replies = await getRepliesByTopicId((comment as any)._id);

      commentsWithReplies.push({
        comment: comment,
        replies: replies,
      });
    }

    if (regID) {
      assoc_bldgs = await getBuildingsByRegID(regID);
      assoc_bldgs = assoc_bldgs.filter((b) => b.BIN !== building.BIN);
    }

    const violations = await getViolationsByBuildingId(buildingId);
    //ratings based on the violations and a summary of what violations the building has(Rahim)
    // the data function is in data/violations.ts and is called calculateRatingByViolations(Rahim)
    const violationSummary = await calculateRatingByViolations(building.BIN);
    const vioClassCounts = {
      C: violations.filter((v) => v.class === "C").length,
      B: violations.filter((v) => v.class === "B").length,
      A: violations.filter((v) => v.class === "A").length,
      I: violations.filter((v) => v.class === "I").length,
    };

    // sort violation data based on selected column
    const sortBy = xss(String(req.query["sortBy"] || "class")).trim();

    const vioSorted = violations;

    vioSorted.sort((a, b) => {
      if (sortBy === "status") {
        if (a.violationStatus === "Open" && b.violationStatus !== "Open") {
          return -1;
        }

        if (a.violationStatus !== "Open" && b.violationStatus === "Open") {
          return 1;
        }

        return 0;
      }

      if (sortBy === "inspectionDate") {
        return (
          new Date(a.inspectionDate || 0).getTime() - new Date(b.inspectionDate || 0).getTime()
        );
      }

      if (sortBy === "statusDate") {
        return (
          new Date(a.currentStatusDate || 0).getTime() -
          new Date(b.currentStatusDate || 0).getTime()
        );
      }

      // severity order for violation classes
      const order = {
        C: 1,
        B: 2,
        A: 3,
        I: 4,
      };

      const aClassOrder = order[a.class];
      const bClassOrder = order[b.class];

      return aClassOrder - bClassOrder;
    });

    //Form submissions confirmations
    const review_confirm_submit = xss(String(req.query["reviewSubmitted"] || "")).trim();
    const comment_confirm_submit = xss(String(req.query["commentSubmitted"] || "")).trim();
    //added this here for the favorites button incase there is a duplicate(Rahim)
    const favorite_exists = xss(String(req.query["favoriteExists"] || "")).trim();
    res.render("building", {
      building,
      reviews,
      violations,
      comments: commentsWithReplies,
      assoc_bldgs,
      regID,
      violations_count: violations.length,
      vioClassCounts,
      vioSorted,
      review_confirm_submit,
      comment_confirm_submit,
      //just added this but you still need to diplay it in handlebars, i didn't tuch that(Rahim)
      violationSummary,
      favorite_exists,
      isFavorite,
      userReview,
      title:building.address,
    });
  } catch (e) {
    res.status(404).render("error", { title: "Error", error: e });
  }
});

//get reviews and comments info
router.post("/building/:id/review", async (req, res) => {
  try {
    const sessionInfo = req.session as any;
    const id = xss(req.params.id || "").trim();

    if (!sessionInfo.user) {
      return res.status(403).render("error", {
        title: "Error",
        error: "Please sign in to write a review",
        signInLink: "/signin",
        backLink: `/building/${id}`,
        backLinkText: "Return to building",
      });
    }

    const reviewParse = AddReviewSchema.safeParse({
      reviewText: xss(req.body.reviewText || "").trim(),
      rating: xss(String(req.body.rating || "")).trim(),
    });
    if (!reviewParse.success) {
      return res.status(400).render("error", {
        title: "Error",
        error: formatZodError(reviewParse.error),
        backLink: `/building/${id}`,
        backLinkText: "Return to building",
      });
    }

    const building = await getBuildingById(id);
    const buildingId = (building as any)._id;

    await addReview(
      buildingId,
      reviewParse.data.reviewText,
      reviewParse.data.rating,
      new Types.ObjectId(sessionInfo.user.userId),
    );

    res.redirect(`/building/${id}?reviewSubmitted=true`);
  } catch (e) {
    return res.status(400).render("error", {
      title: "Error",
      error: e,
    });
  }
});

router.post("/building/:id/review/json", async (req, res) => {
  try {
    const sessionInfo = req.session as any;
    const id = xss(req.params.id || "").trim();

    if (!sessionInfo.user) {
      return res.status(403).json({
        error: "Please sign in to write a review.",
      });
    }

    const reviewParse = AddReviewSchema.safeParse({
      reviewText: xss(req.body.reviewText || "").trim(),
      rating: xss(String(req.body.rating || "")).trim(),
    });
    if (!reviewParse.success) {
      return res.status(400).json({ error: formatZodError(reviewParse.error) });
    }

    const building = await getBuildingById(id);
    const buildingId = (building as any)._id;

    await addReview(
      buildingId,
      reviewParse.data.reviewText,
      reviewParse.data.rating,
      new Types.ObjectId(sessionInfo.user.userId),
    );

    return res.json({ success: true });
  } catch (e) {
    return res.status(400).json({
      error:
        typeof e === "string" ? e : e instanceof Error ? e.message : "An unknown error occurred.",
    });
  }
});

//comment
router.post("/building/:id/comment", async (req, res) => {
  try {
    const sessionInfo = req.session as any;
    const id = xss(req.params.id || "").trim();

    if (!sessionInfo.user) {
      return res.status(403).render("error", {
        title: "Error",
        error: "Please sign in to start a topic",
        signInLink: "/signin",
        backLink: `/building/${id}`,
        backLinkText: "Return to building",
      });
    }

    const titleParse = TopicTitleFormSchema.safeParse({
      topicTitle: xss(req.body.topicTitle || "").trim(),
    });
    if (!titleParse.success) {
      return res.status(400).render("error", {
        title: "Error",
        error: formatZodError(titleParse.error),
        backLink: `/building/${id}`,
        backLinkText: "Return to building",
      });
    }

    const building = await getBuildingById(id);
    const buildingId = (building as any)._id;

    await addComment(
      buildingId,
      titleParse.data.topicTitle,
      new Types.ObjectId(sessionInfo.user.userId),
    );

    res.redirect(`/building/${id}?commentSubmitted=true`);
  } catch (e) {
    return res.status(400).render("error", {
      title: "Error",
      error: e,
    });
  }
});

//reply

router.post("/topic/:id/reply", async (req, res) => {
  const binParse = BinSchema.safeParse(xss(String(req.body.buildingBIN || "")).trim());
  const safeBin = binParse.success ? binParse.data : null;

  try {
    const sessionInfo = req.session as any;

    if (!sessionInfo.user) {
      return res.status(403).render("error", {
        title: "Error",
        error: "Please sign in to reply",
      });
    }

    if (!safeBin) {
      return res.status(400).render("error", {
        title: "Error",
        error: "Invalid building reference.",
      });
    }

    const topicIdParse = ObjectIdSchema.safeParse(xss(req.params.id || "").trim());
    if (!topicIdParse.success) {
      return res.status(400).render("error", {
        title: "Error",
        error: "Invalid topic id.",
        backLink: `/building/${safeBin}?commentSubmitted=true`,
        backLinkText: "Return to building",
      });
    }

    const replyParse = ReplyFormSchema.safeParse({
      replyText: xss(req.body.replyText || "").trim(),
    });
    if (!replyParse.success) {
      return res.status(400).render("error", {
        title: "Error",
        error: formatZodError(replyParse.error),
        backLink: `/building/${safeBin}?commentSubmitted=true`,
        backLinkText: "Return to building",
      });
    }

    await addReply(
      topicIdParse.data,
      replyParse.data.replyText,
      new Types.ObjectId(sessionInfo.user.userId),
    );

    res.redirect(`/building/${safeBin}?commentSubmitted=true`);
  } catch (e) {
    return res.status(400).render("error", {
      title: "Error",
      error: e,
      backLink: safeBin ? `/building/${safeBin}?commentSubmitted=true` : "/",
      backLinkText: "Return to building",
    });
  }
});

export default router;
