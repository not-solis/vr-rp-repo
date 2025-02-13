import { RoleplayProject } from './RoleplayProject';

export interface RoleplayEvent {
  isConfirmed: boolean;
  isDefaultEnd: boolean;
  startDate: Date;
  endDate: Date;
  project: RoleplayProject;
}
