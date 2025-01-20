import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Add, Delete, Upload } from '@mui/icons-material';
import {
  CardMedia,
  Checkbox,
  FormControlLabel,
  IconButton,
  styled,
  Typography,
} from '@mui/material';

import { BlurrableTextField } from '../components/BlurrableTextField';
import { IconText } from '../components/IconText';
import { StringEnumSelector } from '../components/StringEnumSelector';
import { TagChip } from '../components/TagChip';
import { TagTextField } from '../components/TagTextField';
import { useAuth } from '../context/AuthProvider';
import {
  RoleplayApplicationProcess,
  RoleplayEntryProcess,
  RoleplayLink,
  RoleplayProject,
} from '../model/RoleplayProject';
import './RoleplayProjectSidebar.css';

interface RoleplayProjectSidebarProps {
  isOpen: boolean;
  isEditing?: boolean;
  toggleOpen: () => void;
  project: RoleplayProject;
  setEditProject: (project: RoleplayProject) => void;
}

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export const RoleplayProjectSidebar = (props: RoleplayProjectSidebarProps) => {
  const { user, isAuthenticated } = useAuth();
  const {
    isOpen,
    isEditing = false,
    toggleOpen,
    project,
    setEditProject,
  } = props;
  const {
    owners = [],
    imageUrl,
    tags = [],
    setting,
    isMetaverse,
    entryProcess,
    applicationProcess,
    hasSupportingCast,
    isQuestCompatible,
    discordUrl,
    otherLinks = [],
  } = project;

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
        containerStyle={{ width: '95%' }}
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

  const metaverseText = `${isMetaverse ? 'In' : 'Not in'} the Metaverse`;
  const suppCastText = `Supporting Cast positions ${hasSupportingCast ? '' : 'not '}available`;
  const questCompatibleText = `${isQuestCompatible ? '' : 'Not '}Quest compatible`;

  return (
    <div className={`project-sidebar ${isOpen ? '' : ' closed'}`}>
      <div
        className='scrollable-y hidden-scrollbar'
        style={{ width: '100%', height: '100%' }}
      >
        <div id='project-sidebar-content'>
          {imageUrl && (
            <CardMedia component='img' image={imageUrl} alt={`${name} icon`} />
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
                    setEditProject({
                      ...project,
                      imageUrl: URL.createObjectURL(file),
                    });
                  }
                }}
              />
            </IconButton>
          )}

          {isEditing ? (
            <TagTextField
              tags={tags}
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
            {owners && owners.length > 0 && (
              <IconText
                tooltip={'Owners'}
                tooltipPlacement='left'
                text={owners.map((o) => o.name).join(', ')}
                icon={'user'}
              />
            )}
            <IconText
              tooltip='Setting'
              tooltipPlacement='left'
              text={setting}
              icon={'earth-americas'}
              containerStyle={{ width: '95%' }}
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
              icon={'door-open'}
              component={
                isEditing ? (
                  <StringEnumSelector
                    enumType={RoleplayEntryProcess}
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
              icon={'clipboard'}
              iconPrefix='far'
              component={
                isEditing ? (
                  <StringEnumSelector
                    enumType={RoleplayApplicationProcess}
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
              icon={'globe'}
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
              icon={'handshake'}
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
              icon={'meta'}
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
  );
};
