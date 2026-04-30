import { Router } from 'express';
import { createUser, checkUser } from '../data/users.js';

const router = Router();

router.get('/', async (req, res) => {
  return res.render('home', {
    title: 'Home',
  });
});

router
  .route('/register')
  .get(async (req, res) => {
    const sessionInfo = req.session as any;

    if (sessionInfo.user) {
      return res.redirect('/');
    }

    return res.render('register', {
      title: 'Register',
    });
  })
  .post(async (req, res) => {
    const sessionInfo = req.session as any;
    const { firstName, lastName, email, password } = req.body;

    try {
      const user = await createUser({
        firstName,
        lastName,
        email,
        password,
        isAdmin: false,
      });

      sessionInfo.user = {
        userId: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
      };

      return res.redirect('/');
    } catch (e) {
      return res.status(400).render('register', {
        title: 'Register',
        error: e,
        firstName,
        lastName,
        email,
      });
    }
  });

router
  .route('/signin')
  .get(async (req, res) => {
    const sessionInfo = req.session as any;

    if (sessionInfo.user) {
      return res.redirect('/');
    }

    return res.render('signin', {
      title: 'Sign In',
    });
  })
  .post(async (req, res) => {
    const sessionInfo = req.session as any;
    const { email, password } = req.body;

    try {
      const user = await checkUser(email, password);

      sessionInfo.user = {
        userId: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
      };

      return res.redirect('/');
    } catch (e) {
      return res.status(400).render('signin', {
        title: 'Sign In',
        error: e,
        email,
      });
    }
  });

router.get('/signout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/signin');
  });
});

export default router;
