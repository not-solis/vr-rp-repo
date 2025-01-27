import { RequestHandler, Router, Request, Response } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  RoleplayProject,
  updateProject,
  getImageUrlByProjectId,
  deleteProject,
} from '../model/project-model.js';
import { createOwnership, getOwnerByProjectId } from '../model/owners-model.js';
import { getRoleplayLinksByProjectId } from '../model/roleplay-links-model.js';
import { auth } from './auth-router.js';
import cookieParser from 'cookie-parser';
import { ResponseData } from '../index.js';
import { getUserById, UserRole } from '../model/users-model.js';
import { handleImageUploadRequest, limitImageUpload } from './image-router.js';
import { getUpdatesByProjectId } from '../model/updates-model.js';

const MAX_QUERY = 1000;

const urlRegex = new RegExp(
  '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR IP (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', // fragment locator
  'i',
);

const isValidUrl = (url: string) => {
  return urlRegex.test(url);
};

/**
 * Validates the project provided in the request body.
 */
const validateProject: RequestHandler = (
  req,
  res: Response<ResponseData<unknown>>,
  next,
) => {
  const project = req.body as RoleplayProject;
  const { name, shortDescription, discordUrl, otherLinks } = project;
  const validationErrors: string[] = [];

  if (!name || !name.trim()) {
    validationErrors.push('No name provided.');
  }
  if (shortDescription && shortDescription.length > 512) {
    validationErrors.push('Short description max length is 512 characters.');
  }
  if (discordUrl) {
    if (!isValidUrl(discordUrl)) {
      validationErrors.push('Invalid discord URL provided.');
    } else {
      const matches = urlRegex.exec(discordUrl);
      if (!matches || !matches[2]?.includes('discord')) {
        validationErrors.push('Provided Discord URL is not a Discord URL.');
      }
    }
  }
  otherLinks?.forEach((link, i) => {
    if (!link.label) {
      validationErrors.push(`No label provided for link ${i + 1}.`);
    }
    if (!link.url) {
      validationErrors.push(`No URL provided for link ${i + 1}.`);
    } else if (!isValidUrl(link.url)) {
      validationErrors.push(`Invalid URL provided for link ${i + 1}`);
    }
  });

  if (validationErrors.length > 0) {
    res.status(400).json({ success: false, errors: validationErrors });
  } else {
    res.locals.project = project;
    next();
  }
};

/**
 * Checks whether the user owns the project denoted by the id param. Must come after {@link auth}.
 */
const checkOwnership: RequestHandler = async (
  req,
  res: Response<ResponseData<unknown>>,
  next,
) => {
  const { id } = req.params;
  const userId = res.locals.userId;
  if (!id) {
    console.warn('No id to check for ownership.');
    next();
  }
  if (!userId) {
    res.status(500).send({
      success: false,
      errors: ['Invalid routing middleware: no auth before ownership check.'],
    });
  }

  const user = await getUserById(userId);

  if (user.role === UserRole.Admin) {
    next();
  } else if (user.role === UserRole.User) {
    getOwnerByProjectId(id)
      .then((results) => results.data)
      .then((owner) => {
        if (owner?.userId === user.userId) {
          next();
        } else {
          res.status(401).send({
            success: false,
            errors: ['User is not authorized to modify this project.'],
          });
        }
      })
      .catch(() =>
        res.status(500).send({
          success: false,
          errors: ['Internal authentication error.'],
        }),
      );
  }
};

const router = Router();
router.use(cookieParser());

router.get('/', (req, res) => {
  const { start, limit, sortBy, name, tags, asc, active } = req.query;
  getProjects(
    parseInt(start as string) ?? 0,
    parseInt(limit as string) ?? MAX_QUERY,
    sortBy as string,
    name as string,
    Array.isArray(tags)
      ? (tags as string[])
      : ((tags as string)?.split('|') ?? []),
    asc === 'true',
    active === 'true',
  )
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) =>
      res.status(500).send({ success: false, errors: [error.message] }),
    );
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  getProjectById(id)
    .then((response) => {
      res.status(200).send({ success: true, data: response });
    })
    .catch((error) =>
      res.status(500).send({ success: false, errors: [error.message] }),
    );
});

router.post('/:id/owner', auth, (req, res) => {
  const { id } = req.params;
  const userId = res.locals.userId;
  createOwnership(id, userId)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) =>
      res.status(500).send({ success: false, errors: [error.message] }),
    );
});

router.get('/:id/links', (req, res) => {
  const { id } = req.params;
  getRoleplayLinksByProjectId(id)
    .then((response) => {
      res.status(200).send({ success: true, data: response });
    })
    .catch((error) =>
      res.status(500).send({ success: false, errors: [error.message] }),
    );
});

router.post('/', auth, validateProject, async (req, res) => {
  const project: RoleplayProject = res.locals.project;
  const userId = res.locals.userId;
  const user = await getUserById(userId);
  createProject(user, project)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) =>
      res.status(500).send({ success: false, errors: [error.message] }),
    );
});

router.patch(
  '/:id',
  auth,
  validateProject,
  checkOwnership,
  (req: Request, res: Response<ResponseData<unknown>>) => {
    const { id } = req.params;
    const project: RoleplayProject = res.locals.project;
    updateProject(id, project)
      .then((response) => {
        res.status(200).send({ success: true, data: response });
      })
      .catch((error) =>
        res.status(500).send({ success: false, errors: [error.message] }),
      );
  },
);

router.delete(
  '/:id',
  auth,
  checkOwnership,
  (req: Request, res: Response<ResponseData<unknown>>) => {
    const { id } = req.params;
    deleteProject(id)
      .then((response) => {
        res.status(200).send({ success: true, data: response });
      })
      .catch((error) =>
        res.status(500).send({ success: false, errors: [error.message] }),
      );
  },
);

router.get('/:id/updates', (req, res) => {
  const { id } = req.params;
  getUpdatesByProjectId(id)
    .then((response) => {
      res.status(200).send({ success: true, data: response });
    })
    .catch((error) =>
      res.status(500).send({ success: false, errors: [error.message] }),
    );
});

router.post(
  '/image',
  limitImageUpload,
  auth,
  handleImageUploadRequest('projects/img'),
);

router.post(
  '/image/:id',
  limitImageUpload,
  auth,
  checkOwnership,
  async (req: Request, res: Response<ResponseData<unknown>>, next) => {
    const { id } = req.params;
    if (id) {
      await getImageUrlByProjectId(id).then(
        (imageUrl) => (res.locals.old = imageUrl),
      );
    }
    next();
  },
  handleImageUploadRequest('projects/img'),
);

export { router as projectRouter };
