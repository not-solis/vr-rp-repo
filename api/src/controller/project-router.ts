import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  RoleplayProject,
  updateProject,
} from '../model/project-model';
import { getOwnersByProjectId } from '../model/owners-model';
import { getRoleplayLinksByProjectId } from '../model/roleplay-links-model';
import { auth, getAuthUser } from './auth-router';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const { CLIENT_URL = 'http://localhost:3000' } = process.env;

const MAX_QUERY = 1000;
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
    asc !== 'false',
    active === 'true',
  )
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => res.status(500).send(error));
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  getProjectById(id)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => res.status(500).send(error));
});

router.get('/:id/owners', (req, res) => {
  const { id } = req.params;
  getOwnersByProjectId(id)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => res.status(500).send(error));
});

router.get('/:id/links', (req, res) => {
  const { id } = req.params;
  getRoleplayLinksByProjectId(id)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => res.status(500).send(error));
});

router.post('/', auth, (req, res) => {
  const project = req.body as RoleplayProject;
  const user = getAuthUser(req);
  createProject(user, project)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => res.status(500).send(error));
});

router.patch('/', auth, (req, res) => {
  const project = req.body as RoleplayProject;
  const user = getAuthUser(req);
  const { owners = [] } = project;

  // TODO: proper owners auth w/query!
  if (!owners.some((owner) => user.user_id === owner.user_id)) {
    res
      .status(401)
      .send({ message: 'User is not authorized to modify this project' });
  }

  updateProject(req.body as RoleplayProject)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => res.status(500).send(error));
});

export { router as projectRouter };
