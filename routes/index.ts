import { Express } from 'express';
import searchRoutes from './search.js';
const configureRoutes = (app: Express) => {
  app.use('/', searchRoutes);
  //app.use("/rachelroutes, rachelRoutes);")

  app.use((req, res) => {
    res.status(404).send('Page not found');
  });
};

export default configureRoutes;
