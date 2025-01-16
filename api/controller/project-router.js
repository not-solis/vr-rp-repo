import {Router} from 'express';
import { getProjects, getProjectById } from '../model/project-model.js';
import { getOwnersByProjectId } from '../model/owners-model.js';
import { getRoleplayLinksByProjectId } from '../model/roleplay-links-model.js';

const projectRouter = Router();

projectRouter.get('/', (req, res) => {
  const { start, limit, sortBy, name, tags, asc, active } = req.query;
  getProjects(
    start && parseInt(start),
    limit && parseInt(limit),
    sortBy,
    name,
    tags ? tags.split('|') : [],
    asc !== 'false',
    active === 'true'
  )
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => res.status(500).send(error));
});

projectRouter.get('/:id', (req, res) => {
  const { id } = req.params;
  getProjectById(id)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => res.status(500).send(error));
});

projectRouter.get('/:id/owners', (req, res) => {
  const { id } = req.params;
  getOwnersByProjectId(id)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => res.status(500).send(error));
});

projectRouter.get('/:id/links', (req, res) => {
  const { id } = req.params;
  getRoleplayLinksByProjectId(id)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => res.status(500).send(error));
});

export {projectRouter};