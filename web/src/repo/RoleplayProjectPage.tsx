import {
  CardMedia,
  Drawer,
  Link,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import {
  remapRoleplayProject,
  RoleplayProjectProps,
} from '../model/RoleplayProject';
import './RoleplayProjectPage.css';
import { useEffect, useRef, useState } from 'react';
import { TextTag } from '../components/TextTag';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';

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
          return remapRoleplayProject(project) as RoleplayProjectProps;
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

  const {
    name,
    owners,
    tags,
    description,
    shortDescription,
    imageUrl,
    setting,
    entryProcess,
    applicationProcess,
    isMetaverse,
    hasSupportingCast,
    isQuestCompatible,
    discordUrl,
  } = project;

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
  const sidebarInfoElement = (
    label: string,
    value: string | undefined,
    icon: IconName,
    iconPrefix: IconPrefix = 'fas'
  ) => (
    <Tooltip
      title={label}
      placement='left'
      enterDelay={50}
      leaveDelay={100}
      slotProps={{
        popper: {
          modifiers: [{ name: 'offset', options: { offset: [0, -6] } }],
        },
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <FontAwesomeIcon
          width={20}
          icon={[iconPrefix, icon]}
          style={{ paddingTop: 4 }}
        />
        <Typography variant='body2' style={{ paddingTop: 0, paddingLeft: 12 }}>
          {value}
        </Typography>
      </div>
    </Tooltip>
  );

  return (
    <div className='project-page'>
      <div className={`project-info${isSidebarExpanded ? '' : ' closed'}`}>
        <Typography variant='h1' fontWeight='bold'>
          {project.name}
        </Typography>
        {descriptionElement}
      </div>
      <div className={`project-sidebar${isSidebarExpanded ? '' : ' closed'}`}>
        <div id='project-sidebar-content'>
          {imageUrl && (
            <CardMedia component='img' image={imageUrl} alt={`${name} icon`} />
          )}

          {tags && tags.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 6,
              }}
            >
              {tags.map((t) => (
                <TextTag tag={t} />
              ))}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {owners &&
              owners.length > 0 &&
              sidebarInfoElement('Owners', owners.join(', '), 'user')}
            {sidebarInfoElement('Setting', setting, 'earth-americas')}
            {sidebarInfoElement(
              'Metaverse',
              `${isMetaverse ? 'In' : 'Not in'} the Metaverse`,
              'globe'
            )}
            {sidebarInfoElement('Entry Process', entryProcess, 'door-open')}
            {sidebarInfoElement(
              'Application Process',
              applicationProcess,
              'clipboard',
              'far'
            )}
            {sidebarInfoElement(
              'Supporting Cast',
              `Support cast positions ${
                hasSupportingCast ? '' : 'un'
              }available`,
              'handshake'
            )}
            {sidebarInfoElement(
              'Quest Compatibility',
              `${isQuestCompatible ? '' : 'Not '}Quest compatible`,
              'meta',
              'fab'
            )}
          </div>

          {discordUrl && (
            <Link
              href={discordUrl}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <FontAwesomeIcon width={20} icon={['fab', 'discord']} />
              <Typography variant='body2' style={{ paddingLeft: 6 }}>
                Discord
              </Typography>
            </Link>
          )}

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
    </div>
  );
};
