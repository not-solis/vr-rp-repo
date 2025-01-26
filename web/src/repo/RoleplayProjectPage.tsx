import {
  ArrowDropDown,
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grow,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';

import { RoleplayProjectSidebar } from './RoleplayProjectSidebar';
import { TagChip } from '../components/TagChip';
import { ThemedMarkdown } from '../components/ThemedMarkdown';
import { useAuth } from '../context/AuthProvider';
import { useEnv } from '../context/EnvProvider';
import { useSnackbar } from '../context/SnackbarProvider';
import {
  remapRoleplayProject,
  RoleplayProject,
  RoleplayLink,
  RoleplayStatus,
} from '../model/RoleplayProject';
import { ResponseData } from '../model/ServerResponse';
import { UserRole } from '../model/User';

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
  const [imageFile, setImageFile] = useState<File>();
  const [isPreviewDescription, setPreviewDescription] = useState(false);
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isOwnershipDialogOpen, setOwnershipDialogOpen] = useState(false);
  const [isAdminInfoAlertOpen, setAdminInfoAlertOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement>();
  const isMenuOpen = !!menuAnchorEl;
  const statusTagRef = useRef<HTMLDivElement>(null);
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
        .then(clearNulls)
        .catch(() => navigate('/repo')),
  });

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

  if (isNew && !editProject.status) {
    editProject.status = RoleplayStatus.Active;
  }

  const project = isEditing
    ? editProject
    : { ...projectData, otherLinks: otherLinks ?? [] };
  const {
    name = '',
    description = '',
    shortDescription = '',
    owner,
    status,
  } = project;

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
    setImageFile(undefined);
  };

  const onSaveButtonClick = () => {
    if (isNew) {
      setSaveDialogOpen(true);
    } else {
      saveProject();
    }
  };

  const saveProject = async () => {
    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);

      await fetch(`${serverBaseUrl}/projects/image/${id ?? ''}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      }).then(async (res) => {
        if (res.status === 201) {
          await res.json().then((json: ResponseData<string>) => {
            project.imageUrl = json.data;
          });
        } else {
          await res.json().then((json: ResponseData<string>) => {
            createSnackbar({
              title: 'Image Upload Error',
              content: json.errors ?? [],
              severity: 'error',
              autoHideDuration: 6000,
            });
          });
        }
      });
    }

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
              });
            });
          } else {
            res.json().then((json: ResponseData<unknown>) => {
              createSnackbar({
                title: 'Validation Error',
                content: json.errors ?? [],
                severity: 'error',
                autoHideDuration: 5000,
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
            });
          } else {
            res.json().then((json: ResponseData<unknown>) => {
              createSnackbar({
                title: 'Validation Error',
                content: json.errors ?? [],
                severity: 'error',
                autoHideDuration: 5000,
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
          });
        } else {
          res.json().then((json: ResponseData<unknown>) => {
            createSnackbar({
              title: 'Error',
              content: json.errors ?? [],
              severity: 'error',
              autoHideDuration: 5000,
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

  const openStatusMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    setMenuAnchorEl(e.currentTarget);
  };

  const closeStatusMenu = () => setMenuAnchorEl(undefined);

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
        className={`scrollable-y hidden-scrollbar ${!isSidebarOpen ? 'closed' : ''}`}
      >
        <div id='project-info'>
          <Grow in={isAdminInfoAlertOpen && !isEditing} unmountOnExit>
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
          <Stack direction='row' gap={4} alignItems='center'>
            {isEditing ? (
              <>
                <TextField
                  required
                  label='Name'
                  value={name}
                  onChange={(e) =>
                    setEditProject({ ...project, name: e.currentTarget.value })
                  }
                  style={{ width: 'calc(500px)' }}
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
                <Menu
                  open={isMenuOpen}
                  onClose={closeStatusMenu}
                  anchorEl={menuAnchorEl}
                >
                  {Object.entries(RoleplayStatus).map(([k, v]) => (
                    <MenuItem
                      onClick={() => {
                        setEditProject({ ...project, status: k });
                        closeStatusMenu();
                      }}
                      key={k}
                      value={v as string}
                    >
                      <TagChip
                        label={v}
                        className={v.toLowerCase()}
                        style={{ fontSize: 20, padding: '0 6px' }}
                      />
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              <>
                <Typography variant='title'>{name}</Typography>
              </>
            )}
            <TagChip
              label={status || 'Unknown'}
              className={status?.toLowerCase() || 'inactive'}
              style={{ fontSize: 26, padding: '2px 8px' }}
              ref={statusTagRef}
              onClick={isEditing ? openStatusMenu : undefined}
              onDelete={isEditing ? () => {} : undefined}
              deleteIcon={
                <ArrowDropDown
                  style={{
                    pointerEvents: 'none',
                    fontSize: 24,
                    color: 'white',
                  }}
                />
              }
            />
          </Stack>
          {descriptionElement}
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              display: 'flex',
              gap: 8,
            }}
          >
            {!isLoading &&
              !otherLinksLoading &&
              canEdit &&
              (isEditing ? (
                <>
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
                </>
              ) : (
                <IconButton
                  style={{
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
        imageFile={imageFile}
        setImageFile={setImageFile}
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
            As the owner of {name}, you will be able to edit it later.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color='plain' onClick={() => setSaveDialogOpen(false)}>
            Back
          </Button>
          <Button
            color='plain'
            onClick={() => {
              setSaveDialogOpen(false);
              saveProject();
            }}
            autoFocus
          >
            Save
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
            This request will be reviewed by a Myriad admin. Make sure you're
            authorized to represent the project before submitting a request.
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
