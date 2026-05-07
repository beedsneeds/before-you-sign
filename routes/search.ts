import { Router } from 'express';
import { searchBuildings } from '../data/buildings.js';

const router = Router();

router.get('/', async (req, res) => {
  return res.render('home', {
    title: 'Before You Sign',
  });
});

router.get('/search', async (req, res) => {
  try {
    const search = req.query['search'] as string;

    const results = await searchBuildings(search);

    return res.render('searchResults', {
      title: 'Search Results',
      query: search,
      results,
    });
  } catch (e) {
    return res.status(400).render('searchResults', {
      title: 'Search Results',
      error: e,
      results: [],
    });
  }
});

export default router;
