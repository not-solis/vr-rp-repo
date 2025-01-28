import { RoleplayProject } from './RoleplayProject';
import { queryServer, ResponseError } from './ServerResponse';
import { User } from './User';

export interface Update {
  id: string;
  user: User;
  project?: RoleplayProject;
  text: string;
  created: Date;
}

interface PostUpdateProps {
  text: string;
  projectId?: string;
  onSuccess: (data?: string) => void;
  onFailure: (error: ResponseError) => void;
}

export function postUpdate(update: PostUpdateProps) {
  const { text, projectId, onSuccess, onFailure } = update;
  if (text) {
    queryServer<string>('/updates', {
      method: 'POST',
      body: { text },
      isJson: true,
      queryParams: projectId ? { projectId } : {},
      useAuth: true,
    })
      .then(onSuccess)
      .catch(onFailure);
  }
}
