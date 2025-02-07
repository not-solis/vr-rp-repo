import { RequestHandler, Router, Request, Response } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  RoleplayProject,
  updateProject,
  getImageUrlByProjectId,
  deleteProject,
  getProjectByUrlName,
} from '../model/project-model.js';
import {
  createOwnership,
  getOwnerByProjectId,
  getPendingOwnersByProjectId,
  grantOwnership,
  removeOwnership,
} from '../model/owners-model.js';
import { getRoleplayLinksByProjectId } from '../model/roleplay-links-model.js';
import { auth, checkPermissions } from './auth-router.js';
import { respondError, respondSuccess, ResponseData } from '../index.js';
import { getAdmins, getUserById, UserRole } from '../model/users-model.js';
import { handleImageUploadRequest, limitImageUpload } from './image-router.js';
import { sendMail } from '../service/email-service.js';
import { CLIENT_URL } from '../env/config.js';

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
    respondError(res, {
      name: 'Validation Error',
      message: validationErrors,
      code: 400,
    });
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
    respondError(res, {
      message: 'Invalid routing middleware: no auth before ownership check.',
    });
  }

  const user = await getUserById(userId);

  if (user.role === UserRole.Admin) {
    next();
  } else if (user.role === UserRole.User) {
    getOwnerByProjectId(id)
      .then((owner) => {
        if (owner && owner.id === user.id) {
          next();
        } else {
          respondError(res, {
            name: 'Authentication Error',
            message: 'User is not authorized to modify this project.',
            code: 401,
          });
        }
      })
      .catch(() =>
        respondError(res, {
          name: 'Authentication Error',
          message: 'Internal authentication error.',
        }),
      );
  }
};

const router = Router();

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
    .then((data) => {
      respondSuccess(res, data, 206);
    })
    .catch((err) =>
      respondError(res, {
        name: 'Get Projects Error',
        message: err.message,
      }),
    );
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  getProjectById(id)
    .then((data) => {
      respondSuccess(res, data);
    })
    .catch((err) =>
      respondError(res, {
        name: 'Get Project Error',
        message: err.message,
      }),
    );
});

router.get('/name/:name', (req, res) => {
  const { name } = req.params;
  getProjectByUrlName(name)
    .then((data) => {
      respondSuccess(res, data);
    })
    .catch((err) =>
      respondError(res, {
        name: 'Get Project Error',
        message: err.message,
      }),
    );
});

router.get(
  '/:id/owner/pending',
  auth,
  checkPermissions(UserRole.Admin),
  (req, res) => {
    const { id } = req.params;
    getPendingOwnersByProjectId(id)
      .then((data) => {
        respondSuccess(res, data, 201);
      })
      .catch((err) =>
        respondError(res, {
          name: 'Get Ownership Error',
          message: err.message,
        }),
      );
  },
);

router.post(
  '/:id/owner',
  auth,
  checkPermissions(UserRole.Admin),
  (req, res) => {
    const { id: projectId } = req.params;
    const { userId } = req.body;
    grantOwnership(projectId, userId)
      .catch(() => createOwnership(projectId, userId, true))
      .then(async (data) => {
        const user = await getUserById(userId);
        const project = await getProjectById(projectId);
        sendMail({
          to: user.email,
          subject: `Ownership granted: ${project.name}`,
          html: `<p>Congratulations! Your ownership for
          <a href="${CLIENT_URL}/repo/${project.urlName}">
            <b>${project.name}</b></a>
          has been accepted. You are now able to edit and
          post updates to <b>${project.name}</b>.</p>`,
        });
        return data;
      })
      .then((data) => {
        respondSuccess(res, data, 201);
      })
      .catch((err) => {
        console.error(err);
        respondError(res, {
          name: 'Grant Ownership Error',
          message: err.message,
        });
      });
  },
);

router.delete(
  '/:id/owner',
  auth,
  checkPermissions(UserRole.Admin),
  (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    removeOwnership(id, userId)
      .then(async (wasOwner) => {
        const user = await getUserById(userId);
        const project = await getProjectById(id);
        sendMail({
          to: user.email,
          subject: `Ownership ${wasOwner ? 'removed' : 'request declined'}: ${project.name}`,
          html: `<p>Your ownership${wasOwner ? '' : ' request'} for
          <a href="${CLIENT_URL}/repo/${project.urlName}">
            <b>${project.name}</b></a> has been ${wasOwner ? 'removed' : 'declined'}.
          Please contact a Repo admin if this you believe this decision was
          made in error.</p>`,
        });
        return wasOwner;
      })
      .then((data) => {
        respondSuccess(res, data, 201);
      })
      .catch((err) =>
        respondError(res, {
          name: 'Get Ownership Error',
          message: err.message,
        }),
      );
  },
);

router.patch('/:id/owner', auth, (req, res) => {
  const { id } = req.params;
  const userId = res.locals.userId;
  createOwnership(id, userId)
    .then((data) => {
      getAdmins().then(async (admins) => {
        const user = await getUserById(userId);
        const project = await getProjectById(id);
        admins.forEach((admin) =>
          sendMail({
            to: admin.email,
            subject: `Ownership request pending: ${project.name}`,
            html: `<p>User <b>${user.name}</b> (id: ${user.id}) is
            requesting ownership of <b>${project.name}</b> (id: ${project.id})</p>
            <p>Review the request: <a href="${CLIENT_URL}/repo/${project.urlName}">
            ${project.name}</a></p>`,
          }),
        );
      });
      return data;
    })
    .then((data) => {
      respondSuccess(res, data, 201);
    })
    .catch((err) =>
      respondError(res, {
        name: 'Update Ownership Error',
        message: err.message,
      }),
    );
});

router.get('/:id/links', (req, res) => {
  const { id } = req.params;
  getRoleplayLinksByProjectId(id)
    .then((data) => {
      respondSuccess(res, data);
    })
    .catch((err) =>
      respondError(res, {
        name: 'Get Links Error',
        message: err.message,
      }),
    );
});

router.post(
  '/',
  auth,
  validateProject,
  async (req: Request, res: Response<ResponseData<unknown>>) => {
    const project: RoleplayProject = res.locals.project;
    const userId = res.locals.userId;
    const user = await getUserById(userId);
    createProject(user, project)
      .then((data) => {
        respondSuccess(res, data, 201);
      })
      .catch((err) =>
        respondError(res, {
          name: 'Create Project Error',
          message: err.message,
        }),
      );
  },
);

router.patch(
  '/:id',
  auth,
  validateProject,
  checkOwnership,
  (req: Request, res: Response<ResponseData<unknown>>) => {
    const { id } = req.params;
    const project: RoleplayProject = res.locals.project;
    updateProject(id, project)
      .then((data) => {
        respondSuccess(res, data);
      })
      .catch((err) =>
        respondError(res, {
          name: 'Update Project Error',
          message: err.message,
        }),
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
      .then((data) => {
        respondSuccess(res, data);
      })
      .catch((err) =>
        respondError(res, {
          name: 'Delete Project Error',
          message: err.message,
        }),
      );
  },
);

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
