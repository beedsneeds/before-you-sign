// all admin routes in this file

import { Router } from 'express';
import xss from 'xss';
import * as z from 'zod';

import {
  createBuilding,
  getBuildingById,
  updateBuildingById,
  deleteBuildingById,
} from '../data/buildings.js';

import { BuildingInputSchema } from '../data/models/Building.js';

const router = Router();

const BuildingIdFormSchema = z.object({
  BuildingID: z.coerce.number().int().positive(),
});

const BuildingUpdateExtraSchema = z.object({
  AvgRating: z.coerce.number().min(0).max(5),
  ReviewsCount: z.coerce.number().int().nonnegative(),
});

const formatZodError = (error: z.ZodError): string => {
  return z.prettifyError(error);
};

const parseBuildingInputForm = (body: any) => {
  return BuildingInputSchema.safeParse({
    address: xss(body.Address || '').trim(),
    BIN: Number(xss(body.binNumber || '').trim()),
  });
};

router.get('/', async (req, res) => {
  return res.render('admin/adminForms', { title: 'Admin Dashboard' });
});

router.get('/add', async (req, res) => {
  return res.render('admin/addBuilding', { title: 'Add Building' });
});

router.post('/add', async (req, res) => {
  const parsed = parseBuildingInputForm(req.body);

  if (!parsed.success) {
    return res.status(400).render('admin/addBuilding', {
      title: 'Add Building',
      error: formatZodError(parsed.error),
      formData: {
        Address: xss(req.body.Address || '').trim(),
        binNumber: xss(req.body.binNumber || '').trim(),
      },
    });
  }

  if (parsed.data.address.length === 0) {
    return res.status(400).render('admin/addBuilding', {
      title: 'Add Building',
      error: 'Address must be supplied',
      formData: {
        Address: parsed.data.address,
        binNumber: parsed.data.BIN,
      },
    });
  }

  try {
    await createBuilding(parsed.data.address, parsed.data.BIN);

    return res.render('admin/addBuilding', {
      title: 'Add Building',
      success: 'Building added successfully.',
    });
  } catch (e) {
    return res.status(400).render('admin/addBuilding', {
      title: 'Add Building',
      error: e,
      formData: {
        Address: parsed.data.address,
        binNumber: parsed.data.BIN,
      },
    });
  }
});

router.get('/edit', async (req, res) => {
  return res.render('admin/editBuilding', { title: 'Edit Building' });
});

router.get('/delete', async (req, res) => {
  return res.render('admin/removeBuilding', { title: 'Delete Building' });
});

// This POST is for looking up the building first
router.post('/edit', async (req, res) => {
  const parsedId = BuildingIdFormSchema.safeParse({
    BuildingID: xss(req.body.BuildingID || '').trim(),
  });

  if (!parsedId.success) {
    return res.status(400).render('admin/editBuilding', {
      title: 'Edit Building',
      error: formatZodError(parsedId.error),
      formData: {
        BuildingID: xss(req.body.BuildingID || '').trim(),
      },
    });
  }

  try {
    const building = await getBuildingById(parsedId.data.BuildingID);

    return res.render('admin/editBuilding', {
      title: 'Edit Building',
      building: building,
    });
  } catch (e) {
    return res.status(400).render('admin/editBuilding', {
      title: 'Edit Building',
      error: e,
      formData: {
        BuildingID: parsedId.data.BuildingID,
      },
    });
  }
});

// This POST updates the building after the form is submitted
router.post('/edit/submit', async (req, res) => {
  const parsedId = BuildingIdFormSchema.safeParse({
    BuildingID: xss(req.body.BuildingID || '').trim(),
  });

  const parsedBuilding = parseBuildingInputForm(req.body);

  const parsedExtra = BuildingUpdateExtraSchema.safeParse({
    AvgRating: xss(req.body.AvgRating || '').trim(),
    ReviewsCount: xss(req.body.ReviewsCount || '').trim(),
  });

  const formData = {
    BIN: xss(req.body.BuildingID || '').trim(),
    address: xss(req.body.Address || '').trim(),
    avgRating: xss(req.body.AvgRating || '').trim(),
    reviewsCount: xss(req.body.ReviewsCount || '').trim(),
  };

  if (!parsedId.success || !parsedBuilding.success || !parsedExtra.success) {
    let errorMessage = '';

    if (!parsedId.success) {
      errorMessage += formatZodError(parsedId.error) + '\n';
    }

    if (!parsedBuilding.success) {
      errorMessage += formatZodError(parsedBuilding.error) + '\n';
    }

    if (!parsedExtra.success) {
      errorMessage += formatZodError(parsedExtra.error);
    }

    return res.status(400).render('admin/editBuilding', {
      title: 'Edit Building',
      error: errorMessage,
      building: formData,
    });
  }

  if (parsedBuilding.data.address.length === 0) {
    return res.status(400).render('admin/editBuilding', {
      title: 'Edit Building',
      error: 'Address must be supplied',
      building: formData,
    });
  }

  try {
    const updatedBuilding = await updateBuildingById(
      parsedId.data.BuildingID,
      parsedBuilding.data.address,
      parsedBuilding.data.BIN,
      parsedExtra.data.AvgRating,
      parsedExtra.data.ReviewsCount,
    );

    return res.render('admin/editBuilding', {
      title: 'Edit Building',
      success: 'Building was updated',
      building: updatedBuilding,
    });
  } catch (e) {
    return res.status(400).render('admin/editBuilding', {
      title: 'Edit Building',
      error: e,
      building: formData,
    });
  }
});

// This POST is only for looking up the building before deleting
router.post('/delete', async (req, res) => {
  const parsedId = BuildingIdFormSchema.safeParse({
    BuildingID: xss(req.body.BuildingID || '').trim(),
  });

  if (!parsedId.success) {
    return res.status(400).render('admin/removeBuilding', {
      title: 'Delete Building',
      error: formatZodError(parsedId.error),
      formData: {
        BuildingID: xss(req.body.BuildingID || '').trim(),
      },
    });
  }

  try {
    const building = await getBuildingById(parsedId.data.BuildingID);

    return res.render('admin/removeBuilding', {
      title: 'Delete Building',
      building: building,
    });
  } catch (e) {
    return res.status(400).render('admin/removeBuilding', {
      title: 'Delete Building',
      error: e,
      formData: {
        BuildingID: parsedId.data.BuildingID,
      },
    });
  }
});

// This POST deletes after confirmation
router.post('/delete/confirm', async (req, res) => {
  const parsedId = BuildingIdFormSchema.safeParse({
    BuildingID: xss(req.body.BuildingID || '').trim(),
  });

  if (!parsedId.success) {
    return res.status(400).render('admin/removeBuilding', {
      title: 'Delete Building',
      error: formatZodError(parsedId.error),
    });
  }

  try {
    await deleteBuildingById(parsedId.data.BuildingID);

    return res.render('admin/removeBuilding', {
      title: 'Delete Building',
      success: 'Building deleted successfully.',
    });
  } catch (e) {
    return res.status(400).render('admin/removeBuilding', {
      title: 'Delete Building',
      error: e,
    });
  }
});

export default router;