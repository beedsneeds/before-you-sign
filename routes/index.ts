import { Router, Express, Request, Response } from 'express';
import adminRoutes from './admin.js';
import authRoutes from './authRoutes.js';
import { getBuildingById } from '../data/buildings.js';

import { getReviewsByBuildingId } from '../data/reviews.js';
import { getCommentsByBuildingId } from '../data/comments.js';
import { addComment } from '../data/comments.js';
import { addReview } from '../data/reviews.js';
import { getViolationsByBuildingId } from '../data/violations.js';

const router = Router();

//route for admin added for preliminary structure, change and add rest as needed
const constructorMethod = (app: Express) => {
  app.use('/admin', adminRoutes);
  app.use('/', authRoutes);

  // mount router (needed for building route to work)
  app.use('/', router);

  app.use((req: Request, res: Response) => {
    res.status(404).render('error', { title: 'Error', error: 'Page not found' });
  });
};

//home
router.get('/', async (req, res) => {
  res.render('home', { title: 'Home' });
});

// building route plus trycatch
router.get('/building/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const building = await getBuildingById(id);
    const buildingId = (building as any)._id;
    const reviews = await getReviewsByBuildingId(buildingId);
    const comments = await getCommentsByBuildingId(buildingId);
    const violations = await getViolationsByBuildingId(buildingId);

    //
    const vioClassCounts = {
      C: violations.filter((v) => v.class === 'C').length,
      B: violations.filter((v) => v.class === 'B').length,
      A: violations.filter((v) => v.class === 'A').length,
      I: violations.filter((v) => v.class === 'I').length,
    };
    //sample of violations description, order or most severe to least
    const sortedViolations = [];

    for (const violation of violations) {
      if (violation.class === 'C') {
        sortedViolations.push(violation);
      }
    }

    for (const violation of violations) {
      if (violation.class === 'B') {
        sortedViolations.push(violation);
      }
    }

    for (const violation of violations) {
      if (violation.class === 'A') {
        sortedViolations.push(violation);
      }
    }

    for (const violation of violations) {
      if (violation.class === 'I') {
        sortedViolations.push(violation);
      }
    }

    const sample_violations = sortedViolations.slice(0, 5);

    //Form submissions confirmations
    const review_confirm_submit = req.query['reviewSubmitted'];
    const comment_confirm_submit = req.query['commentSubmitted'];

    res.render('building', {
      building,
      reviews,
      violations,
      comments,
      vioClassCounts,
      sample_violations,
      review_confirm_submit,
      comment_confirm_submit,
    });
  } catch (e) {
    res.status(404).render('error', { title: 'Error', error: e });
  }
});

//get reviews and comments info
router.post('/building/:id/review', async (req, res) => {
  const sessionInfo = req.session as any;

  if (!sessionInfo.user) {
    return res.status(403).render('error', {
      title: 'Error',
      error: 'Please log in to write a review',
    });
  }
  const id = req.params.id;

  const building = await getBuildingById(id);
  const buildingId = (building as any)._id;

  await addReview(buildingId, req.body.reviewText, Number(req.body.rating));

  res.redirect(`/building/${id}?reviewSubmitted=true`);
});

//coment
router.post('/building/:id/comment', async (req, res) => {
  const sessionInfo = req.session as any;

if (!sessionInfo.user) {
  return res.status(403).render('error', {
    title: 'Error',
    error: 'Please log in to write a comment'
  });
}
  const id = req.params.id;

  const building = await getBuildingById(id);
  const buildingId = (building as any)._id;

  await addComment(buildingId, req.body.commentText);

  res.redirect(`/building/${id}?commentSubmitted=true`);
});

export default constructorMethod;
