import { Router } from 'express';
import { getProjects, getProjectById } from '../model/project-model';
import { getOwnersByProjectId } from '../model/owners-model';
import { getRoleplayLinksByProjectId } from '../model/roleplay-links-model';

const MAX_QUERY = 1000;
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

export { router as projectRouter };
