import { REACT_APP_SERVER_BASE_URL } from '../Env';
import { RoleplayProject } from './RoleplayProject';
import { ResponseData } from './ServerResponse';
import { User } from './User';

export interface Update {
  id: string;
  user: User;
  project?: RoleplayProject;
  text: string;
  created: Date;
}

interface PostUpdateProps<T> {
  text: string;
  projectId?: string;
  onSuccess: (data?: T) => void;
  onFailure: (errors: string[]) => void;
}

export function postUpdate<T>(update: PostUpdateProps<T>) {
  const { text, projectId, onSuccess, onFailure } = update;
  if (text) {
    const url = new URL('/updates', REACT_APP_SERVER_BASE_URL);
    if (projectId) {
      url.searchParams.append('projectId', projectId);
    }
    fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ text }),
      credentials: 'include',
    })
      .then<ResponseData<T>>((res) => res.json())
      .then((json) => {
        if (json.success) {
          onSuccess(json.data);
        } else if (json.errors) {
          onFailure(json.errors);
        }
      });
  }
}
