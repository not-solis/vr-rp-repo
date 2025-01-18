import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CardMedia } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { RefObject } from 'react';

import { IconText } from '../components/IconText';
import { TextTag } from '../components/TextTag';
import { useAuth } from '../context/AuthProvider';
import { RoleplayLink, RoleplayProject } from '../model/RoleplayProject';
import { User } from '../model/User';
import './RoleplayProjectSidebar.css';

interface RoleplayProjectSidebarProps {
  isOpen: boolean;
  toggleOpen: () => void;
  project: RoleplayProject;
}

export const RoleplayProjectSidebar = (props: RoleplayProjectSidebarProps) => {
  const { user, isAuthenticated } = useAuth();
  const { isOpen, toggleOpen, project } = props;
  const {
    id,
    imageUrl,
    tags,
    setting,
    isMetaverse,
    entryProcess,
    applicationProcess,
    hasSupportingCast,
    isQuestCompatible,
    discordUrl,
  } = project;

  const {
    data: owners,
    error: ownersError,
    isLoading: isOwnersLoading,
  } = useQuery({
    queryKey: ['projectOwners'],
    queryFn: () =>
      fetch(`http://localhost:3001/projects/${id}/owners`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then<User[]>((json) =>
          json.data.map((user: any) => ({
            id: user.id,
            name: user.name,
            discordId: user.discord_id,
          })),
        ),
  });

  const {
    data: otherLinks,
    error: otherLinksError,
    isLoading: isOtherLinksLoading,
  } = useQuery({
    queryKey: ['projectLinks'],
    queryFn: () =>
      fetch(`http://localhost:3001/projects/${id}/links`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then<RoleplayLink[]>((json) => json.data),
  });

  const sidebarLinks = [];
  if (discordUrl) {
    sidebarLinks.push(
      <IconText
        key={'Discord'}
        text={'Discord'}
        tooltip={'Discord'}
        tooltipPlacement='left'
        icon={'discord'}
        iconPrefix='fab'
        url={discordUrl}
      />,
    );
  }
  if (!isOtherLinksLoading && !otherLinksError && otherLinks) {
    otherLinks.forEach((link) =>
      sidebarLinks.push(
        <IconText
          key={link.url}
          text={link.label}
          tooltip={link.label}
          tooltipPlacement='left'
          icon={'link'}
          url={link.url}
        />,
      ),
    );
  }

  return (
    <div className={`project-sidebar${isOpen ? '' : ' closed'}`}>
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
              <TextTag key={t} tag={t} />
            ))}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 4,
          }}
        >
          {!ownersError && !isOwnersLoading && owners && owners.length > 0 && (
            <IconText
              tooltip={'Owners'}
              tooltipPlacement='left'
              text={owners.map((o) => o.name).join(', ')}
              icon={'user'}
            />
          )}
          {setting && (
            <IconText
              tooltip={'Setting'}
              tooltipPlacement='left'
              text={setting}
              icon={'earth-americas'}
            />
          )}
          <IconText
            tooltip={'Metaverse'}
            tooltipPlacement='left'
            text={`${isMetaverse ? 'In' : 'Not in'} the Metaverse`}
            icon={'globe'}
          />
          <IconText
            tooltip={'Entry Process'}
            tooltipPlacement='left'
            text={entryProcess}
            icon={'door-open'}
          />
          <IconText
            tooltip={'Application Process'}
            tooltipPlacement='left'
            text={applicationProcess}
            icon={'clipboard'}
            iconPrefix='far'
          />
          <IconText
            tooltip={'Supporting Cast'}
            tooltipPlacement='left'
            text={`Support cast positions ${
              hasSupportingCast ? '' : 'un'
            }available`}
            icon={'handshake'}
          />
          <IconText
            tooltip={'Quest Compatibility'}
            tooltipPlacement='left'
            text={`${isQuestCompatible ? '' : 'Not '}Quest compatible`}
            icon={'meta'}
            iconPrefix='fab'
          />
        </div>

        {sidebarLinks.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 4,
            }}
          >
            {sidebarLinks}
          </div>
        )}

        {/* TODO: Add authenticated edit button */}
        {user && owners && owners.some((owner) => owner.id === user.id) && (
          <button>HIT ME</button>
        )}

        <div
          id='sidebar-toggle'
          className='disabled-text-interaction'
          onClick={toggleOpen}
        >
          <FontAwesomeIcon
            height={4}
            fixedWidth={true}
            style={{
              fontSize: 22,
            }}
            icon={['fas', isOpen ? 'angles-right' : 'angles-left']}
          />
        </div>
      </div>
    </div>
  );
};
