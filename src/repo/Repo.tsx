import { DarkModeToggle } from '../components/DarkModeToggle';
import {
  RoleplayApplicationProcess,
  RoleplayEntryProcess,
  RoleplayProjectProps,
  RoleplayStatus,
} from '../model/RoleplayProject';
import './Repo.css';
import { RoleplayProject } from '../components/RoleplayProject';
import { getProjects } from '../api/data';
import { useQuery } from 'react-query';

export const Repo = () => {
  const {
    data: projects,
    error,
    isLoading,
  } = useQuery('projects', () =>
    getProjects().then((p) =>
      [...p].sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
    )
  );

  if (isLoading) {
    return <div>Loading repo...</div>;
  }

  return (
    <div className='project-container'>
      {projects?.map((p) => (
        <RoleplayProject key={p.name} {...p} />
      ))}
    </div>
  );
};
