import {
  ArrowDropDown,
  Cancel,
  Delete,
  Edit,
  Save,
  Send,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Button,
  CircularProgress,
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
import { useWindowWidth } from '@react-hook/window-size';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';

import { RoleplayProjectSidebar } from './RoleplayProjectSidebar';
import { APP_KEYWORDS, APP_TITLE } from '../App';
import { TagChip } from '../components/TagChip';
import { ThemedMarkdown } from '../components/ThemedMarkdown';
import { UpdateComponent } from '../components/UpdateComponent';
import { useAuth } from '../context/AuthProvider';
import { useSnackbar } from '../context/SnackbarProvider';
import {
  RoleplayProject,
  RoleplayLink,
  RoleplayStatus,
  mapProject,
} from '../model/RoleplayProject';
import { PageData, queryServer } from '../model/ServerResponse';
import { postUpdate, Update } from '../model/Update';
import { UserRole } from '../model/User';

import './RoleplayProjectPage.css';

/**
 * Pixel width under which to stack updates under roleplay info.
 */
const UPDATE_STACK_TRESHOLD = 1660;
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
  const windowWidth = useWindowWidth({ wait: 30 });
  const [isEditing, setEditing] = useState(isNew);
  const [imageFile, setImageFile] = useState<File>();
  const [isPreviewDescription, setPreviewDescription] = useState(false);
  const [isErrorDialogOpen, setErrorDialogOpen] = useState(false);
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isOwnershipDialogOpen, setOwnershipDialogOpen] = useState(false);
  const [isAdminInfoAlertOpen, setAdminInfoAlertOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement>();
  const isMenuOpen = !!menuAnchorEl;
  const statusTagRef = useRef<HTMLDivElement>(null);
  const [updateText, setUpdateText] = useState('');
  const [editProject, setEditProject] = useState<Partial<RoleplayProject>>(
    {} as RoleplayProject,
  );
  const [isSidebarOpen, setSidebarOpen] = useState(
    windowWidth > SIDEBAR_START_OPEN_WIDTH,
  );
  const { user, isAuthenticated } = useAuth();
  const { createSnackbar, createErrorSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { urlName } = useParams();
  const queryClient = useQueryClient();

  if (isNew && !isEditing) {
    // No empty new page.
    navigate('/repo');
  }

  const stackUpdates = windowWidth < UPDATE_STACK_TRESHOLD;

  const refetchProject = () => {
    queryClient.refetchQueries({
      queryKey: ['project'],
    });
  };

  const refetchUpdates = () => {
    queryClient.refetchQueries({
      queryKey: ['project', 'updates'],
    });
  };

  const {
    data: projectData,
    error,
    isLoading,
  } = useQuery({
    enabled: !isNew,
    queryKey: ['project', urlName],
    queryFn: () =>
      queryServer<RoleplayProject>(`/projects/name/${urlName}`)
        .then((project) => {
          if (!project) {
            throw new Error(`No project by name ${urlName}`);
          }
          if (!project.owner) {
            setAdminInfoAlertOpen(true);
          }
          return project;
        })
        .then(clearNulls),
    select: mapProject,
  });

  if (error) {
    navigate('/repo');
  }

  const id = projectData?.id;

  const { data: otherLinks, isLoading: otherLinksLoading } = useQuery({
    enabled: !isNew && id !== undefined,
    queryKey: ['project', 'links', urlName],
    queryFn: () => queryServer<RoleplayLink[]>(`/projects/${id}/links`),
  });

  const { data: updates, isLoading: updatesLoading } = useQuery({
    enabled: !isNew && id !== undefined,
    queryKey: ['project', 'updates', urlName],
    queryFn: () => {
      return queryServer<PageData<Update>>('/updates', {
        queryParams: { projectId: id! },
      }).then((pageData) => {
        return pageData?.data?.map((update) => {
          const { created, ...rest } = update;
          return { created: new Date(created), ...rest };
        });
      });
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
    tags = [],
    description = '',
    shortDescription = '',
    owner,
    status,
  } = project;

  const canEdit =
    isAuthenticated &&
    (isNew || user?.role == UserRole.Admin || owner?.id === user?.id);

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
            maxRows={24}
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

  const deleteProject = () => {
    queryServer(`/projects/${id}`, {
      method: 'DELETE',
      useAuth: true,
    })
      .then(() => {
        navigate('/repo');
        createSnackbar({
          title: 'Success',
          content: 'Project successfully deleted!',
          severity: 'success',
        });
      })
      .catch((err) => {
        console.error(err);
        createErrorSnackbar(err);
      })
      .finally(() => setErrorDialogOpen(false));
  };

  const saveProject = async () => {
    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);

      await queryServer<string>(`/projects/image/${id ?? ''}`, {
        method: 'POST',
        body: formData,
        useAuth: true,
      })
        .then((imageUrl) => (project.imageUrl = imageUrl))
        .catch(createErrorSnackbar);
    }

    if (isNew) {
      queryServer<string>('/projects', {
        method: 'POST',
        body: project,
        isJson: true,
        useAuth: true,
      })
        .then((urlName) => {
          setEditing(false);
          navigate(`/repo/${urlName}`);
          createSnackbar({
            title: 'Success',
            content: 'Project successfully saved!',
            severity: 'success',
          });
        })
        .catch((err) => {
          console.error(err);
          createErrorSnackbar(err);
        });
    } else {
      queryServer(`/projects/${id}`, {
        method: 'PATCH',
        body: project,
        isJson: true,
        useAuth: true,
      })
        .then((newUrlName) => {
          if (newUrlName !== urlName) {
            navigate(`/repo/${newUrlName}`);
          } else {
            refetchProject();
          }
          setEditing(false);
          createSnackbar({
            title: 'Success',
            content: 'Project successfully saved!',
            severity: 'success',
          });
        })
        .catch((err) => {
          console.error(err);
          createErrorSnackbar(err);
        });
    }
  };

  const requestOwnership = () => {
    queryServer(`/projects/${id}/owner`, {
      method: 'PATCH',
      useAuth: true,
    })
      .then(() =>
        createSnackbar({
          title: 'Success',
          content: 'Request submitted!',
          severity: 'success',
        }),
      )
      .catch((err) => {
        console.error(err);
        createErrorSnackbar(err);
      })
      .finally(() => setOwnershipDialogOpen(false));
  };

  const openStatusMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    setMenuAnchorEl(e.currentTarget);
  };

  const closeStatusMenu = () => setMenuAnchorEl(undefined);

  const updatePanel = (
    <div id='project-update-panel'>
      <Typography variant='h2'>Updates</Typography>
      <Stack id='project-updates'>
        {canEdit && (
          <Stack paddingRight={4}>
            <TextField
              value={updateText}
              onChange={(e) => setUpdateText(e.target.value.substring(0, 2048))}
              fullWidth
              multiline
              minRows={4}
              maxRows={8}
              helperText='For major updates! Posts are visible to everyone.'
              slotProps={{
                input: { style: { borderRadius: 8 } },
              }}
            />
            <Stack direction='row' justifyContent='flex-end' marginTop={-2}>
              <IconButton
                style={{
                  borderRadius: 8,
                }}
                onClick={() =>
                  postUpdate({
                    text: updateText,
                    projectId: id,
                    onSuccess: () => {
                      refetchUpdates();
                      setUpdateText('');
                    },
                    onFailure: (error) => {
                      createSnackbar({
                        title: error.name,
                        severity: 'error',
                        content: error.message,
                      });
                    },
                  })
                }
              >
                <Typography>Post</Typography>
                <Send style={{ paddingLeft: 8 }} />
              </IconButton>
            </Stack>
          </Stack>
        )}

        <div
          className={stackUpdates ? '' : 'scrollable-y hidden-scrollbar'}
          style={{ flexGrow: 1, minHeight: 0 }}
        >
          <Stack gap={2} paddingTop={2} paddingBottom={2}>
            {updatesLoading ? (
              <CircularProgress />
            ) : (
              updates?.map((update) => (
                <UpdateComponent key={update.id} update={update} fullWidth />
              ))
            )}
          </Stack>
        </div>
      </Stack>
    </div>
  );

  const metaName = isNew ? 'New RP Project' : projectData?.name;
  const metaDescription = isNew
    ? 'Create a new roleplay project in the Repo!'
    : projectData?.shortDescription;

  return (
    <div id='project-page'>
      <Helmet>
        <title>{`${metaName} | ${APP_TITLE}`}</title>
        <meta title={`${metaName} | ${APP_TITLE}`} />
        <meta property='og:title' content={metaName} />
        <meta name='keywords' content={APP_KEYWORDS.concat(tags).join(', ')} />
        <meta property='og:image' content={projectData?.imageUrl} />
        <meta property='og:image:alt' content={`${metaName} icon`} />
        <meta property='og:description' content={metaDescription} />
      </Helmet>
      <div id='project-content' className={!isSidebarOpen ? 'closed' : ''}>
        <div id='project-info-container'>
          <div id='project-info' className='scrollable-y hidden-scrollbar'>
            <Grow in={isAdminInfoAlertOpen && !isEditing} unmountOnExit>
              <Alert
                onClose={() => setAdminInfoAlertOpen(false)}
                severity='info'
                style={{
                  maxWidth:
                    stackUpdates && canEdit ? 'calc(100% - 240px)' : '100%',
                }}
              >
                <AlertTitle>Note:</AlertTitle>
                <Stack spacing={0.8}>
                  <Typography variant='body1'>
                    This project is missing an owner. Some information may be
                    either missing or inaccurate.
                  </Typography>
                  <Typography variant='body1'>
                    If you are an admin of this project, you can request
                    ownership in the project info sidebar.
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
                      setEditProject({
                        ...project,
                        name: e.currentTarget.value,
                      })
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
            {!isEditing && stackUpdates && updatePanel}
          </div>
          {!isEditing && !stackUpdates && updatePanel}
          <div id='edit-action-buttons'>
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
                <>
                  <IconButton
                    style={{
                      borderRadius: 8,
                    }}
                    color='error'
                    onClick={() => setErrorDialogOpen(true)}
                  >
                    <Delete style={{ paddingRight: 8 }} />
                    <Typography>Delete</Typography>
                  </IconButton>
                  <IconButton
                    style={{
                      borderRadius: 8,
                    }}
                    onClick={startEdit}
                  >
                    <Edit style={{ paddingRight: 8 }} />
                    <Typography>Edit</Typography>
                  </IconButton>
                </>
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
        id='delete-roleplay-dialog'
        open={isErrorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
        aria-labelledby='delete-roleplay-dialog-title'
        aria-describedby='delete-roleplay-dialog-description'
      >
        <DialogTitle id='delete-roleplay-dialog-title'>
          Delete {name}?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id='delete-roleplay-dialog-description'>
            Doing so will remove {name} from the Repo. This action is
            irreversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color='plain'
            onClick={() => setErrorDialogOpen(false)}
            autoFocus
          >
            Back
          </Button>
          <Button color='error' onClick={deleteProject}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
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
            This request will be reviewed by a Repo admin. Make sure you're
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
