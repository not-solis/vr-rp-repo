import { RequestHandler, Router, Request, Response } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  RoleplayProject,
  updateProject,
} from '../model/project-model';
import { createOwnership, getOwnerByProjectId } from '../model/owners-model';
import { getRoleplayLinksByProjectId } from '../model/roleplay-links-model';
import { auth, getAuthUser } from './auth-router';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { ResponseData } from '..';
import { User, UserRole } from '../model/users-model';

const { CLIENT_URL = 'http://localhost:3000' } = process.env;

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
    next();
  }
};

const checkOwnership: RequestHandler = (
  req,
  res: Response<ResponseData<unknown>>,
  next,
) => {
  const project = req.body as RoleplayProject;
  const user = getAuthUser(req);

  if (user.role === UserRole.Admin) {
    next();
  } else if (user.role === UserRole.User) {
    getOwnerByProjectId(project.id)
      .then((results) => results.data)
      .then((owner) => {
        if (owner?.user_id === user.user_id) {
          next();
        } else {
          res.status(401).send({
            success: false,
            errors: ['User is not authorized to modify this project.'],
          });
        }
      })
      .catch((e) =>
        res.status(500).send({
          success: false,
          errors: ['Internal authentication error.'],
        }),
      );
  }
};

const router = Router();
router.use(cookieParser());
router.use(
  cors({
    origin: [CLIENT_URL],
    credentials: true,
  }),
);

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
      res.status(200).send(response);
    })
    .catch((error) =>
      res.status(500).send({ success: false, errors: [error.message] }),
    );
});

router.post('/:id/owner', auth, (req, res) => {
  const { id } = req.params;
  const user = getAuthUser(req);
  createOwnership(id, user.user_id)
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

router.post('/', auth, validateProject, (req, res) => {
  const project = req.body as RoleplayProject;
  const user = getAuthUser(req);
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
    updateProject(id, req.body as RoleplayProject)
      .then((response) => {
        res.status(200).send({ success: true, data: response });
      })
      .catch((error) =>
        res.status(500).send({ success: false, errors: [error.message] }),
      );
  },
);

export { router as projectRouter };
