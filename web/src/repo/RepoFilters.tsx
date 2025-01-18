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

import { BlurrableTextField } from '../components/BlurrableTextField';
import { TagTextField } from '../components/TagTextField';
import './RepoFilters.css';

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

  const applyFilters = () => {
    setNameFilter(name);
  };

  return (
    <Box id='filter-bar'>
      <FormGroup id='repo-filters'>
        <BlurrableTextField
          label='Name'
          variant='outlined'
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            setNameFilter(name);
          }}
          value={name}
          size='small'
        />
        <TagTextField
          label='Tags'
          variant='outlined'
          onChange={(e) => setTempTag(e.target.value)}
          onBlur={() => {
            if (tempTag) {
              addTagFilter(tempTag.toLowerCase().trim());
              setTempTag('');
            }
          }}
          value={tempTag}
          style={{ minWidth: 500, textOverflow: 'inherit' }}
          size='small'
          tags={tagFilters}
          onTagClick={(t) => () => removeTagFilter(t)}
        />

        {/* <FormControl style={{ minWidth: '80px' }}>
          <InputLabel id='status-label'>Status</InputLabel>
          <Select
            labelId='status-label'
            value={status ?? 0}
            label='Status'
            size='small'
            onChange={(e) => setStatus(e.target.value as RoleplayStatus)}
          >
            <MenuItem value={RoleplayStatus.Unknown}>Any</MenuItem>
            <MenuItem value={RoleplayStatus.Active}>Active</MenuItem>
            <MenuItem value={RoleplayStatus.Inactive}>Inactive</MenuItem>
            <MenuItem value={RoleplayStatus.Upcoming}>Upcoming</MenuItem>
            <MenuItem value={RoleplayStatus.Hiatus}>Hiatus</MenuItem>
          </Select>
        </FormControl> */}

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
