import './Repo.css';
import { RoleplayProject } from '../components/RoleplayProject';
import { getProjects } from '../api/data';
import { useQuery } from 'react-query';

export const Repo = () => {
  const {
    data: projects,
    error,
    isLoading,
  } = useQuery('projects', getProjects);

  projects?.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());

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
