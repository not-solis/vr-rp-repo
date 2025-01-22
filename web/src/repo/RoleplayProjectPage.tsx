import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Cancel,
  Edit,
  Save,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Button,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grow,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';

import { RoleplayEditView } from './RoleplayEditView';
import { RoleplayProjectSidebar } from './RoleplayProjectSidebar';
import { IconText } from '../components/IconText';
import { TagChip } from '../components/TagChip';
import { ThemedMarkdown } from '../components/ThemedMarkdown';
import { useAuth } from '../context/AuthProvider';
import { useEnv } from '../context/EnvProvider';
import { useSnackbar } from '../context/SnackbarProvider';
import {
  remapRoleplayProject,
  RoleplayProject,
  RoleplayLink,
} from '../model/RoleplayProject';
import { ResponseData } from '../model/ServerResponse';
import { User, UserRole } from '../model/User';

import './RoleplayProjectPage.css';

const SIDEBAR_START_OPEN_WIDTH = 800;

interface RoleplayProjectPageProps {
  isNew?: boolean;
}

function clearNulls<T>(obj: T): T {
  if (obj) {
    Object.keys(obj).forEach((k) => {
      if (obj[k as keyof T] === null) {
        delete obj[k as keyof T];
      }
    });
  }

  return obj;
}

export const RoleplayProjectPage = (props: RoleplayProjectPageProps) => {
  const { isNew = false } = props;
  const { serverBaseUrl } = useEnv();
  const [isEditing, setEditing] = useState(isNew);
  const [isPreviewDescription, setPreviewDescription] = useState(false);
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isOwnershipDialogOpen, setOwnershipDialogOpen] = useState(false);
  const [isAdminInfoAlertOpen, setAdminInfoAlertOpen] = useState(false);
  const [editProject, setEditProject] = useState<Partial<RoleplayProject>>(
    {} as RoleplayProject,
  );
  const [isSidebarOpen, setSidebarOpen] = useState(
    window.screen.width > SIDEBAR_START_OPEN_WIDTH,
  );
  const { user, isAuthenticated } = useAuth();
  const { createSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  if (isNew && !isEditing) {
    // No empty new page.
    navigate('/repo');
  }

  const refetchProject = () => {
    queryClient.refetchQueries({
      queryKey: ['project'],
    });
  };

  const {
    data: projectData,
    error,
    isLoading,
  } = useQuery({
    enabled: !isNew,
    queryKey: ['project'],
    queryFn: () =>
      fetch(`${serverBaseUrl}/projects/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((json) => {
          const project = json.data;
          const remappedProject = remapRoleplayProject(project);
          if (!remappedProject.owner) {
            setAdminInfoAlertOpen(true);
          }
          return remappedProject;
        })
        .then(clearNulls),
  });

  // const { data: owners, isLoading: ownersLoading } = useQuery({
  //   enabled: !isNew,
  //   queryKey: ['project', 'owners'],
  //   queryFn: () =>
  //     fetch(`${serverBaseUrl}/projects/${id}/owners`, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     })
  //       .then((res) => res.json())
  //       .then<User[]>((json) =>
  //         json.data.map((user: any) =>
  //           clearNulls({
  //             id: user.id,
  //             name: user.name,
  //             discordId: user.discord_id,
  //           }),
  //         ),
  //       ),
  // });

  const { data: otherLinks, isLoading: otherLinksLoading } = useQuery({
    enabled: !isNew,
    queryKey: ['project', 'links'],
    queryFn: () => {
      return fetch(`${serverBaseUrl}/projects/${id}/links`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then<ResponseData<RoleplayLink[]>>((res) => res.json())
        .then((json) => json.data)
        .then(clearNulls);
    },
  });

  if (error) {
    return <div>Error loading page.</div>;
  }

  if (isLoading && !isNew) {
    return <LinearProgress />;
  }

  if (!projectData && !isNew) {
    // ID is invalid
    navigate('/repo');
    return null;
  }

  const project = isEditing
    ? editProject
    : { ...projectData, otherLinks: otherLinks ?? [] };
  const { name = '', description = '', shortDescription = '', owner } = project;

  const canEdit =
    isAuthenticated && (user?.role == UserRole.Admin || owner?.id === user?.id);

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

  const onSaveButtonClick = () => {
    if (isNew) {
      setSaveDialogOpen(true);
    } else {
      saveProject();
    }
  };

  const saveProject = () => {
    if (isNew) {
      fetch(`${serverBaseUrl}/projects`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(project),
        credentials: 'include',
      })
        .then((res) => {
          if (res.status === 200) {
            res.json().then((json) => {
              setEditing(false);
              navigate(`/repo/${json.id}`);
              createSnackbar({
                title: 'Success',
                content: 'Project successfully saved!',
                severity: 'success',
                autoHideDuration: 3000,
              });
            });
          } else {
            res.json().then((json: ResponseData<unknown>) => {
              createSnackbar({
                title: 'Validation Error',
                content: json.errors ?? [],
                severity: 'error',
              });
            });
          }
        })
        .catch((e) => console.error(e));
    } else {
      fetch(`${serverBaseUrl}/projects/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
        body: JSON.stringify(project),
        credentials: 'include',
      })
        .then((res) => {
          if (res.status === 200) {
            refetchProject();
            setEditing(false);
            createSnackbar({
              title: 'Success',
              content: 'Project successfully saved!',
              severity: 'success',
              autoHideDuration: 3000,
            });
          } else {
            res.json().then((json: ResponseData<unknown>) => {
              createSnackbar({
                title: 'Validation Error',
                content: json.errors ?? [],
                severity: 'error',
              });
            });
          }
        })
        .catch((e) => console.error(e));
    }
  };

  const requestOwnership = () => {
    fetch(`${serverBaseUrl}/projects/${id}/owner`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(project),
      credentials: 'include',
    })
      .then((res) => {
        if (res.status === 200) {
          createSnackbar({
            title: 'Success',
            content: 'Request submitted!',
            severity: 'success',
            autoHideDuration: 3000,
          });
        } else {
          res.json().then((json: ResponseData<unknown>) => {
            createSnackbar({
              title: 'Error',
              content: json.errors ?? [],
              severity: 'error',
            });
          });
        }
      })
      .then(() => setOwnershipDialogOpen(false));
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
          <Grow in={isAdminInfoAlertOpen} unmountOnExit>
            <Alert
              onClose={() => setAdminInfoAlertOpen(false)}
              severity='info'
              style={{ width: 'calc(100% - 240px)' }}
            >
              <AlertTitle>Note:</AlertTitle>
              <Stack spacing={0.8}>
                <Typography variant='body1'>
                  This project was added to the Repo by a Myriad admin. Some
                  information may be either missing or inaccurate.
                </Typography>
                <Typography variant='body1'>
                  If you are an admin of this project, you can request ownership
                  in the project info sidebar.
                </Typography>
              </Stack>
            </Alert>
          </Grow>
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
                  onClick={onSaveButtonClick}
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
        openOwnershipDialog={() => setOwnershipDialogOpen(true)}
      />

      <Dialog
        id='save-roleplay-dialog'
        open={isSaveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        aria-labelledby='save-roleplay-dialog-title'
        aria-describedby='save-roleplay-dialog-description'
      >
        <DialogTitle id='save-roleplay-dialog-title'>Confirm save?</DialogTitle>
        <DialogContent>
          <DialogContentText id='save-roleplay-dialog-description'>
            You will be saved as the owner of this project. You will be able to
            make edits later if you want.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color='plain' onClick={() => setSaveDialogOpen(false)}>
            Disagree
          </Button>
          <Button
            color='plain'
            onClick={() => {
              setSaveDialogOpen(false);
              saveProject();
            }}
            autoFocus
          >
            Agree
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        id='request-ownership-dialog'
        open={isOwnershipDialogOpen}
        onClose={() => setOwnershipDialogOpen(false)}
        aria-labelledby='request-ownership-dialog-title'
        aria-describedby='request-ownership-dialog-description'
      >
        <DialogTitle id='request-ownership-dialog-title'>
          Request ownership of {name}?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id='request-ownership-dialog-description'>
            {`The owner is a representative of project admin. Make sure you're authorized to represent the project before submitting a request.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color='plain' onClick={() => setOwnershipDialogOpen(false)}>
            No
          </Button>
          <Button color='plain' onClick={requestOwnership} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
