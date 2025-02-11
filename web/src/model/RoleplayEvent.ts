import { RoleplayProject } from './RoleplayProject';

export interface RoleplayEvent {
  isConfirmed: boolean;
  startDate: Date;
  endDate: Date;
  project: RoleplayProject;
}
