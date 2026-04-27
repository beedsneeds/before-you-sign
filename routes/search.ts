import { Router } from 'express';
// import { ObjectId } from 'mongodb';
import { getAllBuildings } from '../data/buildings.js';

const router = Router();

//landing page code
router.get('/', async (req, res) => {
  console.log('Hit home route');
  res.render('home', { title: 'Before You Sign' });
});

//search results page code
router.get('/search', async (req, res) => {
  const search = req.query['search'] as string;
  if (!search || typeof search !== 'string' || search.trim().length === 0) {
    return res.status(400).render('searchResults', {
      title: 'Search Results',
      error: 'Please enter an address or BIN to search.',
      results: [],
    });
  }

  const searchTerm = search.trim().toLowerCase();

  const allBuildings = await getAllBuildings();
  const results = allBuildings.filter((building) => {
    const addressesMatched = building['address'].toLowerCase().includes(searchTerm);
    const binsMatched = building['bin'] && building['bin'].toString().includes(searchTerm);
    return addressesMatched || binsMatched;
  });
  res.render('searchResults', {
    title: 'Search Results',
    query: search.trim(),
    results: results,
  });
});
export default router;
