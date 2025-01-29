import { Add, Close, Remove } from '@mui/icons-material';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  FormControlLabel,
  IconButton,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { BlurrableTextField } from '../components/BlurrableTextField';
import { StringEnumSelector } from '../components/StringEnumSelector';
import { TagTextField } from '../components/TagTextField';
import {
  RoleplayApplicationProcess,
  RoleplayEntryProcess,
  RoleplayLink,
  RoleplayProject,
  RoleplayStatus,
} from '../model/RoleplayProject';

import './RoleplayEditView.css';

interface RoleplayEditViewProps {
  isOpen: boolean;
  close: () => void;
  isNew: boolean;
  project?: RoleplayProject;
}

export const RoleplayEditView = (props: RoleplayEditViewProps) => {
  const { isOpen, close, project: propsProject = {}, isNew } = props;
  const [project, setProject] = useState<Partial<RoleplayProject>>(
    structuredClone(propsProject),
  );
  const [errorState, setErrorState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setProject(structuredClone(propsProject));
  }, [isOpen]);

  const {
    name,
    setting,
    shortDescription,
    description,
    tags = [],
    status,
    entryProcess,
    applicationProcess,
    isMetaverse,
    hasSupportingCast,
    isQuestCompatible,
    discordUrl,
    otherLinks = [],
  } = project;

  const addOtherLinkButton = (
    <IconButton
      id='add-other-link-button'
      size='small'
      onClick={() => {
        otherLinks.push({} as RoleplayLink);
        setProject({ ...project, otherLinks: otherLinks });
      }}
    >
      <Add />
    </IconButton>
  );

  return (
    <Dialog
      open={isOpen}
      onClose={close}
      fullWidth
      maxWidth='lg'
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          // const formData = new FormData(event.currentTarget);
          // console.log(Object.fromEntries((formData as any).entries()));
          // const formData = new FormData(event.currentTarget);
          // const formJson = Object.fromEntries((formData as any).entries());
          // const email = formJson.email;
          // console.log(email);
          // close();
        },
        className: 'hidden-scrollbar',
      }}
    >
      <div id='edit-view'>
        <BlurrableTextField
          autoFocus
          required
          label='Name'
          variant='outlined'
          onChange={(e) => setProject({ ...project, name: e.target.value })}
          value={name}
          size='small'
        />
        <BlurrableTextField
          label='Setting'
          variant='outlined'
          onChange={(e) => setProject({ ...project, setting: e.target.value })}
          value={setting}
          size='small'
          className='flex-wrap-break'
          style={{ gridColumn: 'span 2' }}
        />

        <div
          style={{
            backgroundColor: 'black',
            gridArea: 'span 4 / span 2',
          }}
        />

        <TextField
          label='Short Description'
          variant='outlined'
          multiline
          rows={6}
          onChange={(e) =>
            setProject({ ...project, shortDescription: e.target.value })
          }
          value={shortDescription}
          size='small'
          slotProps={{
            htmlInput: {
              className: 'hidden-scrollbar',
            },
          }}
          style={{
            gridColumn: '1 / span 2',
            gridRow: 'span 3',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            gridRow: 'span 3',
          }}
        >
          <StringEnumSelector
            enumType={RoleplayStatus}
            includeEmptyValue
            label='Status'
            value={status}
            onChange={(e) =>
              setProject({
                ...project,
                status: e.target.value as RoleplayStatus,
              })
            }
          />
          <StringEnumSelector
            enumType={RoleplayEntryProcess}
            includeEmptyValue
            label='Entry Process'
            value={entryProcess}
            onChange={(e) =>
              setProject({
                ...project,
                entryProcess: e.target.value as RoleplayEntryProcess,
              })
            }
          />
          <StringEnumSelector
            enumType={RoleplayApplicationProcess}
            includeEmptyValue
            label='Application Process'
            value={applicationProcess}
            onChange={(e) =>
              setProject({
                ...project,
                applicationProcess: e.target
                  .value as RoleplayApplicationProcess,
              })
            }
          />
        </div>

        <TagTextField
          tags={tags}
          addTag={(tag) => {
            if (!tags.includes(tag)) {
              setProject({ ...project, tags: [...tags, tag] });
            }
          }}
          onTagClick={(tag) =>
            setProject({ ...project, tags: tags.filter((t) => t !== tag) })
          }
          label='Tags'
          variant='outlined'
          size='small'
          style={{
            gridColumn: '1 / span 2',
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 4,
            gridColumn: 'span 2',
            padding: '0 8px',
          }}
        >
          <FormControlLabel
            value={isMetaverse}
            control={
              <Checkbox
                checked={isMetaverse}
                onChange={(e) =>
                  setProject({
                    ...project,
                    isMetaverse: e.currentTarget.checked,
                  })
                }
                style={{ padding: 0 }}
              />
            }
            label='Metaverse'
            labelPlacement='top'
            style={{ margin: 0, textWrap: 'nowrap' }}
            slotProps={{
              typography: {
                fontSize: 14,
              },
            }}
          />
          <FormControlLabel
            value={hasSupportingCast}
            control={
              <Checkbox
                checked={hasSupportingCast}
                onChange={(e) =>
                  setProject({
                    ...project,
                    hasSupportingCast: e.currentTarget.checked,
                  })
                }
                style={{ padding: 0 }}
              />
            }
            label='Has Supporting Cast'
            labelPlacement='top'
            style={{ margin: 0, textWrap: 'nowrap' }}
            slotProps={{
              typography: {
                fontSize: 14,
              },
            }}
          />
          <FormControlLabel
            value={isQuestCompatible}
            control={
              <Checkbox
                checked={isQuestCompatible}
                onChange={(e) =>
                  setProject({
                    ...project,
                    isQuestCompatible: e.currentTarget.checked,
                  })
                }
                style={{ padding: 0 }}
              />
            }
            label='Quest Compatible'
            labelPlacement='top'
            style={{ margin: 0, textWrap: 'nowrap' }}
            slotProps={{
              typography: {
                fontSize: 14,
              },
            }}
          />
        </div>

        <TextField
          label='Description'
          variant='outlined'
          multiline
          rows={16}
          onChange={(e) =>
            setProject({ ...project, description: e.target.value })
          }
          value={description}
          size='small'
          slotProps={{
            htmlInput: { className: 'hidden-scrollbar' },
          }}
          style={{
            gridRow: 'span 7',
            gridColumnStart: 1,
            gridColumnEnd: -1,
          }}
        />

        <BlurrableTextField
          label='Discord URL'
          variant='outlined'
          onChange={(e) =>
            setProject({ ...project, discordUrl: e.target.value })
          }
          value={discordUrl ?? ''}
          type='url'
          size='small'
          style={{ gridColumnStart: 1 }}
        />

        <>
          {otherLinks?.map((other, i) => (
            <>
              <BlurrableTextField
                label='Label'
                variant='outlined'
                onChange={(e) => {
                  const otherLink = otherLinks[i];
                  otherLink.label = e.target.value;
                  setProject({ ...project, otherLinks: otherLinks });
                }}
                value={other.label}
                size='small'
                style={{ gridColumnStart: 1 }}
              />
              <BlurrableTextField
                label='URL'
                variant='outlined'
                onChange={(e) => {
                  const otherLink = otherLinks[i];
                  otherLink.url = e.target.value;
                  setProject({ ...project, otherLinks: otherLinks });
                }}
                value={other.url}
                type='url'
                size='small'
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: -12,
                }}
              >
                <IconButton
                  id='remove-other-link-button'
                  size='small'
                  onClick={() => {
                    otherLinks.splice(i, 1);
                    setProject({
                      ...project,
                      otherLinks: otherLinks,
                    });
                  }}
                >
                  <Remove />
                </IconButton>
                {i === otherLinks.length - 1 && addOtherLinkButton}
              </div>
            </>
          ))}
        </>

        {otherLinks.length === 0 && (
          <div
            style={{ display: 'flex', alignItems: 'center', marginLeft: -12 }}
          >
            {addOtherLinkButton}
          </div>
        )}

        <DialogActions style={{ gridColumnEnd: -1, paddingRight: 0 }}>
          {/* <Button onClick={handleClose}>Cancel</Button> */}
          <Button id='edit-view-submit' variant='outlined' type='submit'>
            Save
          </Button>
        </DialogActions>
      </div>
      <IconButton id='edit-close-button' size='small' onClick={close}>
        <Close />
      </IconButton>
    </Dialog>
  );
};
