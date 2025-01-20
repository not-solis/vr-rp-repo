import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Cancel,
  Edit,
  Save,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import {
  Button,
  CardMedia,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';

import { RoleplayEditView } from './RoleplayEditView';
import { RoleplayProjectSidebar } from './RoleplayProjectSidebar';
import { IconText } from '../components/IconText';
import { TagChip } from '../components/TagChip';
import { ThemedMarkdown } from '../components/ThemedMarkdown';
import { useAuth } from '../context/AuthProvider';
import { useEnv } from '../context/EnvProvider';
import {
  remapRoleplayProject,
  RoleplayProject,
  RoleplayLink,
} from '../model/RoleplayProject';
import { User, UserRole } from '../model/User';

import './RoleplayProjectPage.css';

const SIDEBAR_START_OPEN_WIDTH = 800;

interface RoleplayProjectPageProps {
  isNew?: boolean;
}

export const RoleplayProjectPage = (props: RoleplayProjectPageProps) => {
  const { isNew } = props;
  const { serverBaseUrl } = useEnv();
  const [isEditing, setEditing] = useState(isNew);
  const [isPreviewDescription, setPreviewDescription] = useState(false);
  const [editProject, setEditProject] = useState<Partial<RoleplayProject>>(
    {} as RoleplayProject,
  );
  const [isSidebarOpen, setSidebarOpen] = useState(
    window.screen.width > SIDEBAR_START_OPEN_WIDTH,
  );
  const { user, isAuthenticated } = useAuth();
  const { id } = useParams();

  if (isNew && !isEditing) {
    // No empty new page.
    window.location.href = '/repo';
  }

  const {
    data: projectData,
    error,
    isLoading,
  } = useQuery({
    enabled: !isNew,
    queryKey: ['projects'],
    queryFn: () =>
      fetch(`${serverBaseUrl}/projects/${id}`, {
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

  const { data: owners, isLoading: ownersLoading } = useQuery({
    enabled: !isNew,
    queryKey: ['projectOwners'],
    queryFn: () =>
      fetch(`${serverBaseUrl}/projects/${id}/owners`, {
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

  const { data: otherLinks, isLoading: otherLinksLoading } = useQuery({
    enabled: !isNew,
    queryKey: ['projectLinks'],
    queryFn: () =>
      fetch(`${serverBaseUrl}/projects/${id}/links`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then<RoleplayLink[]>((json) => json.data),
  });

  if (error) {
    return <div>Error loading page.</div>;
  }

  if (isLoading && !isNew) {
    return <div>Loading...</div>;
  }

  if (!projectData && !isNew) {
    // ID is invalid
    window.location.href = '/repo';
    return null;
  }

  const project = isEditing
    ? editProject
    : { ...projectData, owners: owners ?? [], otherLinks: otherLinks ?? [] };

  const canEdit =
    user?.role == UserRole.Admin ||
    (owners && owners.some((owner) => owner.id === user?.id));

  const { name, description, shortDescription } = project;

  const previewButton = (
    <IconButton
      style={{ position: 'absolute', top: 5, right: 8 }}
      onClick={() => setPreviewDescription(!isPreviewDescription)}
    >
      {isPreviewDescription ? <VisibilityOff /> : <Visibility />}
    </IconButton>
  );

  let descriptionElement;
  if (isEditing) {
    descriptionElement = (
      <>
        <TextField
          label='Short Description'
          value={shortDescription}
          multiline
          minRows={2}
          onChange={(e) =>
            setEditProject({
              ...project,
              shortDescription: e.currentTarget.value.substring(0, 512),
            })
          }
          style={{ width: 600, maxWidth: 'calc(100% - 240px)' }}
          helperText='Max length: 512 characters'
        />
        {isPreviewDescription ? (
          <Typography
            variant='text'
            style={{
              position: 'relative',
              border: '1px solid var(--mui-palette-divider)',
              borderRadius: 4,
              minHeight: 50,
              paddingLeft: 12,
            }}
          >
            <ThemedMarkdown>{description}</ThemedMarkdown>
            {previewButton}
          </Typography>
        ) : (
          <TextField
            label='Description'
            value={description}
            multiline
            minRows={8}
            fullWidth
            onChange={(e) =>
              setEditProject({
                ...project,
                description: e.currentTarget.value,
              })
            }
            slotProps={{
              input: {
                endAdornment: previewButton,
              },
            }}
          />
        )}
      </>
    );
  } else if (description) {
    descriptionElement = (
      <Typography variant='text'>
        <ThemedMarkdown>{description}</ThemedMarkdown>
      </Typography>
    );
  } else if (shortDescription) {
    descriptionElement = (
      <>
        <Typography variant='subtitle1'>
          (no description provided, using short description)
        </Typography>
        <Typography variant='body1'>{shortDescription}</Typography>
      </>
    );
  } else {
    descriptionElement = (
      <Typography variant='subtitle1'>(no description provided)</Typography>
    );
  }

  const startEdit = () => {
    setEditing(true);
    setEditProject(structuredClone(project));
  };

  const cancelEdit = () => {
    setEditing(false);
    setPreviewDescription(false);
  };

  const saveProject = () => {
    cancelEdit();
  };

  const metaName = isNew ? 'New RP Project' : projectData?.name;
  const metaDescription = isNew
    ? 'Create a new roleplay project in the Repo'
    : projectData?.shortDescription;

  return (
    <div id='project-page'>
      <Helmet>
        <title>{metaName}</title>
        <meta title={metaName} />
        <meta property='og:title' content={metaName} />
        <meta property='og:image' content={projectData?.imageUrl} />
        <meta property='og:image:alt' content={`${metaName} icon`} />
        <meta property='og:description' content={metaDescription} />
      </Helmet>
      <div
        id='project-info-container'
        className='scrollable-y hidden-scrollbar'
      >
        <div id='project-info' className={!isSidebarOpen ? 'closed' : ''}>
          {isEditing ? (
            <TextField
              required
              label='Name'
              value={name}
              onChange={(e) =>
                setEditProject({ ...project, name: e.currentTarget.value })
              }
              style={{ width: 'calc(100% - 240px)' }}
              sx={{
                '.MuiInputLabel-shrink': {
                  fontSize: '1.6rem !important',
                  lineHeight: '1.1em !important',
                },
                '.MuiOutlinedInput-root': {
                  fieldset: {
                    fontSize: '1.6rem',
                  },
                },
              }}
              slotProps={{
                input: {
                  style: { font: 'var(--mui-font-h1)' },
                },
                inputLabel: {
                  style: {
                    font: 'var(--mui-font-h1)',
                    lineHeight: 1.55,
                  },
                },
              }}
            />
          ) : (
            <Typography variant='title'>{name}</Typography>
          )}
          {descriptionElement}
          {!isLoading &&
            !ownersLoading &&
            !otherLinksLoading &&
            canEdit &&
            (isEditing ? (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  display: 'flex',
                  gap: 8,
                }}
              >
                <IconButton
                  style={{
                    borderRadius: 8,
                  }}
                  onClick={() => {
                    console.log('Save', project);
                    cancelEdit();
                  }}
                >
                  <Save style={{ paddingRight: 8 }} />
                  <Typography>Save</Typography>
                </IconButton>
                <IconButton
                  style={{
                    borderRadius: 8,
                  }}
                  onClick={cancelEdit}
                >
                  <Cancel style={{ paddingRight: 8 }} />
                  <Typography>Cancel</Typography>
                </IconButton>
              </div>
            ) : (
              <IconButton
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  borderRadius: 8,
                }}
                onClick={startEdit}
              >
                <Edit style={{ paddingRight: 8 }} />
                <Typography>Edit</Typography>
              </IconButton>
            ))}
        </div>
      </div>

      {/* <RoleplayEditView
        isNew={true}
        close={() => setEditing(false)}
        isOpen={isEditing}
        project={project}
      /> */}

      <RoleplayProjectSidebar
        isOpen={isSidebarOpen}
        isEditing={isEditing}
        toggleOpen={() => setSidebarOpen(!isSidebarOpen)}
        project={project as RoleplayProject}
        setEditProject={setEditProject}
      />
    </div>
  );
};
