import { CardMedia, Drawer, Typography, useTheme } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { remapRoleplayProject } from '../model/RoleplayProject';
import './RoleplayProjectPage.css';
import { useEffect, useRef, useState } from 'react';

export const RoleplayProjectPage = () => {
  const [isSidebarExpanded, setSidebarExpanded] = useState(true);
  const theme = useTheme();
  const { id } = useParams();
  const {
    data: project,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: () =>
      fetch(`http://localhost:3001/projects/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((json) => {
          const project = json.data;
          return remapRoleplayProject(project);
        }),
  });

  if (error) {
    return <div>Error loading page.</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!project) {
    // ID is invalid
    window.location.href = '/';
    return null;
  }

  project.imageUrl = 'https://media1.tenor.com/m/QQiopAKBLyUAAAAd/miber.gif'; // DELETE

  const { name, owners, description, shortDescription, imageUrl } = project;

  let descriptionElement;
  if (description) {
    descriptionElement = <Typography variant='h5'>{description}</Typography>;
  } else if (shortDescription) {
    descriptionElement = (
      <>
        <Typography
          style={{
            fontStyle: 'italic',
            paddingTop: 0,
          }}
          color='textSecondary'
          variant='body2'
        >
          (no description provided, using short description)
        </Typography>
        <Typography variant='body1'>{shortDescription}</Typography>
      </>
    );
  } else {
    descriptionElement = (
      <Typography
        style={{
          fontStyle: 'italic',
          paddingTop: 0,
        }}
        color='textSecondary'
        variant='body2'
      >
        (no description provided)
      </Typography>
    );
  }

  const toggleSidebar = () => setSidebarExpanded(!isSidebarExpanded);

  return (
    <div className='project-page'>
      <div className={`project-info${isSidebarExpanded ? '' : ' closed'}`}>
        <Typography variant='h1' fontWeight='bold'>
          {project.name}
        </Typography>
        {descriptionElement}
      </div>
      <div className={`project-sidebar${isSidebarExpanded ? '' : ' closed'}`}>
        <div style={{ padding: '20px' }}>
          {imageUrl && (
            <CardMedia component='img' image={imageUrl} alt={`${name} icon`} />
          )}
        </div>
        <div
          id='sidebar-toggle'
          className='disabled-text-interaction'
          onClick={toggleSidebar}
        >
          <Typography
            variant='h5'
            style={{ marginLeft: '4px', marginBottom: '4px' }}
          >
            {isSidebarExpanded ? '>>>' : '<<<'}
          </Typography>
        </div>
      </div>
    </div>
  );
};
