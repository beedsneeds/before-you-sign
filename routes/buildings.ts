import { Router } from 'express';
import { getBuildingById } from '../data/buildings.js';
import { calculateRatingByViolations } from '../data/violations.js';
import { getReviewsByBuildingId } from '../data/reviews.js';
import { getCommentsByBuildingId } from '../data/comments.js';
import { addComment } from '../data/comments.js';
import { addReview } from '../data/reviews.js';
import { getViolationsByBuildingId, getBuildingsByRegistrationId } from '../data/violations.js';
import { addReply } from '../data/replies.js';
import { Types } from 'mongoose';
import { getRepliesByTopicId } from '../data/replies.js';

const router = Router();

// building route plus trycatch
router.get('/building/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const building = await getBuildingById(id);
    const buildingId = (building as any)._id;
    const reviews = await getReviewsByBuildingId(buildingId);
    const comments = await getCommentsByBuildingId(buildingId);

    const commentsWithReplies = [];
    let assoc_bldgs: any[] = [];
    let registrationId = null;

    for (const comment of comments) {
      const replies = await getRepliesByTopicId((comment as any)._id);

      commentsWithReplies.push({
        comment: comment,
        replies: replies,
      });
    }
    // grab registrationid if vio exists, first regid that there is
    const violations = await getViolationsByBuildingId(buildingId);
    if (violations.length > 0 && violations[0].registrationId) {
      registrationId = violations[0].registrationId;

      assoc_bldgs = await getBuildingsByRegistrationId(registrationId);
    }
    assoc_bldgs = assoc_bldgs.filter((b) => b.BIN !== building.BIN);
    //ratings based on the violations and a summary of what violations the building has(Rahim)
    // the data function is in data/violations.ts and is called calculateRatingByViolations(Rahim)
    const violationSummary = await calculateRatingByViolations(building.BIN);

    const vioClassCounts = {
      C: violations.filter((v) => v.class === 'C').length,
      B: violations.filter((v) => v.class === 'B').length,
      A: violations.filter((v) => v.class === 'A').length,
      I: violations.filter((v) => v.class === 'I').length,
    };

    // sort violation data based on selected column
    const sortBy = String(req.query['sortBy'] || 'class');

    const vioSorted = violations;

    vioSorted.sort((a, b) => {
      if (sortBy === 'status') {
        if (a.violationStatus === 'Open' && b.violationStatus !== 'Open') {
          return -1;
        }

        if (a.violationStatus !== 'Open' && b.violationStatus === 'Open') {
          return 1;
        }

        return 0;
      }

      if (sortBy === 'inspectionDate') {
        return (
          new Date(a.inspectionDate || 0).getTime() - new Date(b.inspectionDate || 0).getTime()
        );
      }

      if (sortBy === 'statusDate') {
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
    const review_confirm_submit = req.query['reviewSubmitted'];
    const comment_confirm_submit = req.query['commentSubmitted'];
    //added this here for the favorites button incase there is a duplicate(Rahim)
    const favorite_exists = req.query['favoriteExists'];
    res.render('building', {
      building,
      reviews,
      violations,
      comments: commentsWithReplies,
      assoc_bldgs,
      registrationId,
      violations_count: violations.length,
      vioClassCounts,
      vioSorted,
      review_confirm_submit,
      comment_confirm_submit,
      //just added this but you still need to diplay it in handlebars, i didn't tuch that(Rahim)
      violationSummary,
      favorite_exists,
    });
  } catch (e) {
    res.status(404).render('error', { title: 'Error', error: e });
  }
});

//get reviews and comments info
router.post('/building/:id/review', async (req, res) => {
  try {
    const sessionInfo = req.session as any;
    const id = req.params.id;

    if (!sessionInfo.user) {
      return res.status(403).render('error', {
        title: 'Error',
        error: 'You need to be signed in to leave a review.',
        signInLink: '/signin',
        backLink: `/building/${id}`,
      });
    }

    const building = await getBuildingById(id);
    const buildingId = (building as any)._id;

    await addReview(buildingId, req.body.reviewText, Number(req.body.rating));

    res.redirect(`/building/${id}?reviewSubmitted=true`);
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Error',
      error: e,
    });
  }
});

//comment
router.post('/building/:id/comment', async (req, res) => {
  try {
    const sessionInfo = req.session as any;
    const id = req.params.id;

    if (!sessionInfo.user) {
      return res.status(403).render('error', {
        title: 'Error',
        error: 'Sign in first to start a topic.',
        signInLink: '/signin',
        backLink: `/building/${id}`,
      });
    }

    const building = await getBuildingById(id);
    const buildingId = (building as any)._id;

    await addComment(buildingId, req.body.topicTitle);

    res.redirect(`/building/${id}?commentSubmitted=true`);
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Error',
      error: e,
    });
  }
});

//reply

router.post('/topic/:id/reply', async (req, res) => {
  try {
    const sessionInfo = req.session as any;

    if (!sessionInfo.user) {
      return res.status(403).render('error', {
        title: 'Error',
        error: 'Sign in to reply.',
      });
    }

    await addReply(new Types.ObjectId(req.params.id), req.body.replyText);

    res.redirect(`/building/${req.body.buildingBIN}?commentSubmitted=true`);
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Error',
      error: e,
      backLink: `/building/${req.body.buildingBIN}?commentSubmitted=true`,
    });
  }
});

export default router;
