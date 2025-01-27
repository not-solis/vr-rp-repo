import { RoleplayProject } from './RoleplayProject';
import { User } from './User';

export interface Update {
  id: string;
  user: User;
  project?: RoleplayProject;
  text: string;
  created: Date;
}
