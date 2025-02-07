import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Add, Check, Close, Delete, Upload } from '@mui/icons-material';
import {
  Button,
  CardMedia,
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { BlurrableTextField } from '../components/BlurrableTextField';
import { IconText } from '../components/IconText';
import { StringEnumSelector } from '../components/StringEnumSelector';
import { TagChip } from '../components/TagChip';
import { TagTextField } from '../components/TagTextField';
import { VisuallyHiddenInput } from '../components/VisuallyHiddenInput';
import { useAuth } from '../context/AuthProvider';
import { useSnackbar } from '../context/SnackbarProvider';
import { REACT_APP_MAX_IMAGE_SIZE } from '../Env';
import {
  RoleplayApplicationProcess,
  RoleplayEntryProcess,
  RoleplayLink,
  RoleplayProject,
} from '../model/RoleplayProject';
import { queryServer } from '../model/ServerResponse';
import { User, UserRole } from '../model/User';

import './RoleplayProjectSidebar.css';

interface RoleplayProjectSidebarProps {
  isOpen: boolean;
  isEditing?: boolean;
  toggleOpen: () => void;
  project: RoleplayProject;
  setEditProject: (project: RoleplayProject) => void;
  imageFile?: File;
  setImageFile: (file: File) => void;
  openOwnershipDialog: () => void;
}

export const RoleplayProjectSidebar = (props: RoleplayProjectSidebarProps) => {
  const queryClient = useQueryClient();
  const { isAuthenticated, user, hasPermission } = useAuth();
  const { createSnackbar, createErrorSnackbar } = useSnackbar();
  const {
    isOpen,
    isEditing = false,
    toggleOpen,
    project,
    setEditProject,
    imageFile,
    setImageFile,
    openOwnershipDialog,
  } = props;
  const {
    id,
    owner,
    name,
    imageUrl = '',
    tags = [],
    setting = '',
    runtime = '',
    started,
    isMetaverse = false,
    entryProcess = '',
    applicationProcess = '',
    hasSupportingCast = false,
    isQuestCompatible = false,
    discordUrl = '',
    otherLinks = [],
  } = project;

  const refetchProject = () => {
    queryClient.refetchQueries({
      queryKey: ['project'],
    });
  };

  const { data: pendingOwners = [] } = useQuery({
    enabled: hasPermission(UserRole.Admin) && !owner,
    queryKey: ['project', 'pendingOwners'],
    queryFn: () =>
      queryServer<User[]>(`/projects/${id}/owner/pending`, {
        queryParams: { pending: 'true' },
        useAuth: true,
      }),
  });

  const becomeOwner = () => {
    if (!user) {
      console.error('User is not authenticated.');
      return;
    }

    acceptOwnershipRequest(user)();
  };

  const removeOwner = () => {
    if (!owner) {
      console.error('No owner to remove.');
      return;
    }

    rejectOwnershipRequest(owner)();
  };

  const acceptOwnershipRequest = (user: User) => () => {
    queryServer(`projects/${id}/owner`, {
      method: 'POST',
      body: { userId: user.id },
      isJson: true,
      useAuth: true,
    })
      .then(() =>
        createSnackbar({
          title: 'Success',
          content: 'Ownership request accepted!',
          severity: 'success',
        }),
      )
      .catch((err) => {
        console.error(err);
        createErrorSnackbar(err);
      })
      .finally(refetchProject);
  };

  const rejectOwnershipRequest = (user: User) => () => {
    queryServer(`projects/${id}/owner`, {
      method: 'DELETE',
      body: { userId: user.id },
      isJson: true,
      useAuth: true,
    })
      .then(() =>
        createSnackbar({
          title: 'Success',
          content: 'Ownership request rejected.',
          severity: 'success',
        }),
      )
      .catch((err) => {
        console.error(err);
        createErrorSnackbar(err);
      })
      .finally(refetchProject);
  };

  const sidebarLinks = [];
  if (isEditing || discordUrl) {
    sidebarLinks.push(
      <IconText
        key='Discord'
        text='Discord'
        tooltip='Discord'
        tooltipPlacement='left'
        icon='discord'
        iconPrefix='fab'
        url={isEditing ? '' : discordUrl}
        containerStyle={{ width: '100%' }}
        component={
          isEditing ? (
            <BlurrableTextField
              label='Discord URL'
              variant='standard'
              size='small'
              value={discordUrl ?? ''}
              type='url'
              onChange={(e) =>
                setEditProject({ ...project, discordUrl: e.target.value })
              }
              style={{ width: '74%' }}
            />
          ) : undefined
        }
      />,
    );
  }
  otherLinks?.forEach((link, i) => {
    const { label = '', url = '' } = link;
    sidebarLinks.push(
      <IconText
        key={i}
        text={label}
        tooltip={isEditing ? '' : label}
        tooltipPlacement='left'
        icon='link'
        url={isEditing ? '' : url}
        containerStyle={{ width: '100%' }}
        component={
          isEditing ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  width: '100%',
                }}
              >
                <BlurrableTextField
                  label='Label'
                  variant='standard'
                  size='small'
                  value={label}
                  onChange={(e) => {
                    otherLinks[i].label = e.target.value;
                    setEditProject({ ...project, otherLinks: otherLinks });
                  }}
                  style={{ width: '60%' }}
                />
                <BlurrableTextField
                  label='URL'
                  variant='standard'
                  size='small'
                  value={url}
                  type='url'
                  onChange={(e) => {
                    otherLinks[i].url = e.target.value;
                    setEditProject({ ...project, otherLinks: otherLinks });
                  }}
                  style={{ width: '100%' }}
                />
              </div>
              <IconButton
                size='large'
                onClick={() => {
                  otherLinks.splice(i, 1);
                  setEditProject({ ...project, otherLinks: otherLinks });
                }}
              >
                <Delete style={{ fontSize: 24 }} />
              </IconButton>
            </div>
          ) : undefined
        }
      />,
    );
  });

  const metaverseText =
    isMetaverse != null || isEditing
      ? `${isMetaverse ? 'In' : 'Not in'} the Metaverse`
      : '';
  const suppCastText =
    hasSupportingCast != null || isEditing
      ? `Supporting Cast positions ${hasSupportingCast ? '' : 'not '}available`
      : '';
  const questCompatibleText =
    isQuestCompatible != null || isEditing
      ? `${isQuestCompatible ? '' : 'Not '}Quest compatible`
      : '';

  return (
    <div id='project-sidebar' className={isOpen ? '' : 'closed'}>
      <div style={{ width: '100%', height: '100%' }}>
        <div
          id='project-sidebar-container'
          className='scrollable-y hidden-scrollbar'
        >
          <div id='project-sidebar-content'>
            {(imageUrl || imageFile) && (
              <CardMedia
                component='img'
                image={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
                alt={`${name} icon`}
              />
            )}
            {isEditing && (
              <IconButton
                style={{
                  alignSelf: 'flex-end',
                  borderRadius: 8,
                  display: 'flex',
                  gap: 4,
                }}
                role={undefined}
                component='label'
              >
                <Typography>Upload Image</Typography>
                <Upload />
                <VisuallyHiddenInput
                  type='file'
                  accept='image/*'
                  onChange={(event) => {
                    const { files } = event.currentTarget;
                    if (files && files.length > 0) {
                      const file = files[0];
                      if (file.size > REACT_APP_MAX_IMAGE_SIZE) {
                        createSnackbar({
                          title: 'Input Error',
                          severity: 'error',
                          content:
                            'Image is too large! Max upload size is 1MB.',
                        });
                      } else {
                        setImageFile(file);
                      }
                    }
                  }}
                />
              </IconButton>
            )}

            {isEditing ? (
              <TagTextField
                tags={tags || []}
                label='Tags'
                variant='outlined'
                fullWidth
                addTag={(tag) => {
                  if (!tags.includes(tag)) {
                    setEditProject({ ...project, tags: [...tags, tag] });
                  }
                }}
                style={{ width: '100%' }}
                size='small'
                onTagClick={(tag) =>
                  setEditProject({
                    ...project,
                    tags: tags.filter((t) => t !== tag),
                  })
                }
              />
            ) : (
              tags &&
              tags.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 6,
                  }}
                >
                  {tags.map((t) => (
                    <TagChip key={t} label={t} />
                  ))}
                </div>
              )
            )}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: isEditing ? 12 : 4,
                width: '100%',
              }}
            >
              {isAuthenticated &&
                hasPermission(UserRole.Admin) &&
                (owner ? (
                  <Button
                    color='error'
                    variant='outlined'
                    onClick={removeOwner}
                    style={{ borderRadius: 6, marginBottom: 8 }}
                  >
                    Remove Owner
                  </Button>
                ) : (
                  <Button
                    color='warning'
                    variant='outlined'
                    onClick={becomeOwner}
                    style={{ borderRadius: 6, marginBottom: 8 }}
                  >
                    Become Owner
                  </Button>
                ))}
              {owner ? (
                <IconText
                  tooltip={'Owner'}
                  tooltipPlacement='left'
                  text={owner.name}
                  icon='user'
                />
              ) : (
                isAuthenticated &&
                !isEditing &&
                (hasPermission(UserRole.Admin) ? (
                  <div>
                    <Typography paddingBottom={0.5}>
                      Ownership requests: {pendingOwners.length === 0 && 'None'}
                    </Typography>
                    <Stack paddingLeft={2}>
                      {pendingOwners.map((user) => (
                        <Stack
                          key={user.name}
                          direction='row'
                          alignItems='center'
                          gap={1}
                        >
                          <Typography paddingRight={1}>{user.name}</Typography>
                          <IconButton
                            size='small'
                            color='error'
                            onClick={rejectOwnershipRequest(user)}
                          >
                            <Close />
                          </IconButton>
                          <IconButton
                            size='small'
                            color='success'
                            onClick={acceptOwnershipRequest(user)}
                          >
                            <Check />
                          </IconButton>
                        </Stack>
                      ))}
                    </Stack>
                  </div>
                ) : (
                  <Button
                    color='plain'
                    variant='outlined'
                    onClick={openOwnershipDialog}
                    style={{ borderRadius: 6, marginBottom: 8 }}
                  >
                    Request Ownership
                  </Button>
                ))
              )}

              <IconText
                tooltip='Runtime'
                tooltipPlacement='left'
                text={runtime}
                icon='clock'
                iconPrefix='far'
                containerStyle={{ width: '100%' }}
                component={
                  isEditing ? (
                    <BlurrableTextField
                      label='Runtime'
                      variant='standard'
                      size='small'
                      value={runtime}
                      onChange={(e) =>
                        setEditProject({ ...project, runtime: e.target.value })
                      }
                      style={{ width: '100%' }}
                    />
                  ) : undefined
                }
              />

              <IconText
                tooltip='Date started'
                tooltipPlacement='left'
                text={started?.toLocaleDateString(undefined, {
                  dateStyle: 'long',
                })}
                icon='calendar'
                iconPrefix='far'
                containerStyle={{ width: '100%' }}
                component={
                  isEditing ? (
                    <DatePicker
                      label='Date started'
                      defaultValue={started && dayjs(started)}
                      format='MMMM Do, YYYY'
                      onChange={(val) =>
                        setEditProject({ ...project, started: val?.toDate() })
                      }
                      slotProps={{
                        textField: {
                          size: 'small',
                          variant: 'standard',
                        },
                        inputAdornment: {
                          style: { transform: 'translate(-8px, -3px)' },
                        },
                      }}
                    />
                  ) : undefined
                }
              />

              <IconText
                tooltip='Setting'
                tooltipPlacement='left'
                text={setting}
                icon='earth-americas'
                containerStyle={{ width: '100%' }}
                component={
                  isEditing ? (
                    <BlurrableTextField
                      label='Setting'
                      variant='standard'
                      size='small'
                      value={setting}
                      multiline
                      onChange={(e) =>
                        setEditProject({ ...project, setting: e.target.value })
                      }
                      style={{ width: '100%' }}
                    />
                  ) : undefined
                }
              />

              <IconText
                tooltip={'Entry Process'}
                tooltipPlacement='left'
                text={entryProcess}
                icon='door-open'
                component={
                  isEditing ? (
                    <StringEnumSelector
                      enumType={RoleplayEntryProcess}
                      includeEmptyValue
                      label='Entry Process'
                      value={entryProcess}
                      size='small'
                      variant='standard'
                      onChange={(e) =>
                        setEditProject({
                          ...project,
                          entryProcess: e.target.value as RoleplayEntryProcess,
                        })
                      }
                      slotProps={{ root: { style: { minWidth: 69 } } }}
                    />
                  ) : undefined
                }
              />

              <IconText
                tooltip={'Application Process'}
                tooltipPlacement='left'
                text={applicationProcess}
                icon='clipboard'
                iconPrefix='far'
                component={
                  isEditing ? (
                    <StringEnumSelector
                      enumType={RoleplayApplicationProcess}
                      includeEmptyValue
                      label='Application Process'
                      value={applicationProcess}
                      size='small'
                      variant='standard'
                      onChange={(e) =>
                        setEditProject({
                          ...project,
                          applicationProcess: e.target
                            .value as RoleplayApplicationProcess,
                        })
                      }
                      slotProps={{ root: { style: { minWidth: 69 } } }}
                    />
                  ) : undefined
                }
              />

              <IconText
                tooltip='Metaverse'
                tooltipPlacement='left'
                text={metaverseText}
                icon='globe'
                component={
                  isEditing ? (
                    <FormControlLabel
                      value={isMetaverse}
                      control={
                        <Checkbox
                          checked={isMetaverse}
                          onChange={(e) =>
                            setEditProject({
                              ...project,
                              isMetaverse: e.currentTarget.checked,
                            })
                          }
                          style={{ padding: 0, paddingRight: 8 }}
                        />
                      }
                      label={metaverseText}
                      style={{ margin: 0, paddingTop: 4 }}
                    />
                  ) : undefined
                }
              />

              <IconText
                tooltip={'Supporting Cast'}
                tooltipPlacement='left'
                text={suppCastText}
                icon='handshake'
                component={
                  isEditing ? (
                    <FormControlLabel
                      value={hasSupportingCast}
                      control={
                        <Checkbox
                          checked={hasSupportingCast}
                          onChange={(e) =>
                            setEditProject({
                              ...project,
                              hasSupportingCast: e.currentTarget.checked,
                            })
                          }
                          style={{ padding: 0, paddingRight: 8 }}
                        />
                      }
                      label={suppCastText}
                      style={{ margin: 0, paddingTop: 4 }}
                    />
                  ) : undefined
                }
              />

              <IconText
                tooltip={'Quest Compatibility'}
                tooltipPlacement='left'
                text={questCompatibleText}
                icon='meta'
                iconPrefix='fab'
                component={
                  isEditing ? (
                    <FormControlLabel
                      value={isQuestCompatible}
                      control={
                        <Checkbox
                          checked={isQuestCompatible}
                          onChange={(e) =>
                            setEditProject({
                              ...project,
                              isQuestCompatible: e.currentTarget.checked,
                            })
                          }
                          style={{ padding: 0, paddingRight: 8 }}
                        />
                      }
                      label={questCompatibleText}
                      style={{ margin: 0, paddingTop: 4 }}
                    />
                  ) : undefined
                }
              />
            </div>

            {sidebarLinks.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: isEditing ? 12 : 4,
                  width: '100%',
                }}
              >
                {sidebarLinks}
              </div>
            )}

            {isEditing && (
              <IconButton
                size='large'
                onClick={() => {
                  otherLinks.push({} as RoleplayLink);
                  setEditProject({ ...project, otherLinks: otherLinks });
                }}
                style={{ borderRadius: 10, padding: 8 }}
              >
                <Add style={{ fontSize: 24 }} />{' '}
                <Typography style={{ paddingLeft: 8, paddingRight: 4 }}>
                  Add other link
                </Typography>
              </IconButton>
            )}
          </div>
        </div>
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
