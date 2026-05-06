import { Router, Express, Request, Response } from 'express';
import adminRoutes from './admin.js';
import { getBuildingById } from '../data/buildings.js';

import { getReviewsByBuildingId } from '../data/reviews.js';
import { getCommentsByBuildingId } from '../data/comments.js';

const router = Router();

//route for admin added for preliminary structure, change and add rest as needed
const constructorMethod = (app: Express) => {
  app.use('/admin', adminRoutes);

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
    const violations = [{ NOVDescription: 'Bedbugs', ViolationStatus: 'Open' }];
    const review_confirm_submit = req.query['reviewSubmitted'];
    const comment_confirm_submit = req.query['commentSubmitted'];

    res.render('building', {
      building,
      reviews,
      violations,
      comments,
      review_confirm_submit,
      comment_confirm_submit,
    });
  } catch (e) {
    res.status(404).render('error', { title: 'Error', error: e });
  }
});

//get reviews and comments info
router.post('/building/:id/review', async (req, res) => {
  const id = req.params.id;

  res.redirect(`/building/${id}?reviewSubmitted=true`);
});

//coment
router.post('/building/:id/comment', async (req, res) => {
  const id = req.params.id;

  res.redirect(`/building/${id}?commentSubmitted=true`);
});

export default constructorMethod;
