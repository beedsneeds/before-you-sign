import { Router } from 'express';
const router = Router();

// building route
router.get('/building/:id', async (req, res) => {
  // get the id
  const id = req.params.id;
  // RC fake temp data
  const building = {
    BuildingID: '123456',
    Address: '123 Virginia Court, New York, NY',
    AvgRating: 5.0,
    ReviewsCount: 5,
  };

  const reviews = [
    { Review_Text: 'Well maintained', Rating: 4 },
    { Review_Text: 'Bad management', Rating: 1 },
  ];

  const violations = [{ NOVDescription: 'Bedbugs', ViolationStatus: 'Open' }];

  const comments = [{ Comment_Text: 'I had the same experience' }];

  res.render('building', {
    building,
    reviews,
    violations,
    comments,
  });

});

export default (app) => {
  app.use('/', router);
};
