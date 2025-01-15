import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  TextField,
  useTheme,
} from '@mui/material';
import { useState } from 'react';

import { TextTag } from '../components/TextTag';

interface FilterProps {
  nameFilter: string;
  setNameFilter: (name: string) => void;
  tagFilters: string[];
  addTagFilter: (tag: string) => void;
  removeTagFilter: (tag: string) => void;
  showActiveOnly: boolean;
  setShowActiveOnly: (showActiveOnly: boolean) => void;
}

export const RepoFilters = (props: FilterProps) => {
  const {
    nameFilter,
    setNameFilter,
    tagFilters,
    addTagFilter,
    removeTagFilter,
    showActiveOnly,
    setShowActiveOnly,
  } = props;
  const theme = useTheme();
  const [name, setName] = useState(nameFilter || '');
  const [tempTag, setTempTag] = useState('');
  // const [status, setStatus] = useState(filters.status);

  const applyFilters = () => {
    setNameFilter(name);
  };

  return (
    <Box>
      <FormGroup
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <TextField
          label='Name'
          variant='outlined'
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            setNameFilter(name);
          }}
          value={name}
          size='small'
        />
        <TextField
          label='Tags'
          variant='outlined'
          onChange={(e) => setTempTag(e.target.value)}
          onBlur={() => {
            if (tempTag) {
              addTagFilter(tempTag.toLowerCase());
              setTempTag('');
            }
          }}
          value={tempTag}
          style={{ minWidth: 500, textOverflow: 'inherit' }}
          size='small'
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 6,
                    }}
                  >
                    {tagFilters &&
                      tagFilters.length > 0 &&
                      tagFilters.map((t) => (
                        <TextTag
                          tag={t}
                          variant='body1'
                          interactive
                          onClick={() => removeTagFilter(t)}
                          style={{ paddingTop: 0, paddingBottom: 0 }}
                        />
                      ))}
                  </div>
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
            />
          }
          label='Show Active Only'
          labelPlacement='start'
          slotProps={{
            typography: {
              variant: 'body1',
            },
          }}
        />

        {/* <FormControl style={{ minWidth: '80px' }}>
          <InputLabel id='status-label'>Status</InputLabel>
          <Select
            labelId='status-label'
            value={status ?? 0}
            label='Status'
            autoWidth
            onChange={(e) =>
              setStatus((e.target.value as RoleplayStatus) || undefined)
            }
          >
            <MenuItem value={0}>Any</MenuItem>
            <MenuItem value={RoleplayStatus.Active}>Active</MenuItem>
            <MenuItem value={RoleplayStatus.Inactive}>Inactive</MenuItem>
            <MenuItem value={RoleplayStatus.Upcoming}>Upcoming</MenuItem>
            <MenuItem value={RoleplayStatus.Hiatus}>Hiatus</MenuItem>
          </Select>
        </FormControl> */}

        {/* <Button
          type='submit'
          style={{
            backgroundColor: 'blue',
            color: theme.palette.text.primary,
          }}
          variant='contained'
          onClick={applyFilters}
        >
          Apply Filters
        </Button> */}
      </FormGroup>
    </Box>
  );
};
