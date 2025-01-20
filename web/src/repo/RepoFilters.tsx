import { Add } from '@mui/icons-material';
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
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
          addTag={addTagFilter}
          style={{ width: 500 }}
          size='small'
          tags={tagFilters}
          onTagClick={removeTagFilter}
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

        <Link
          href='/repo/new'
          style={{ marginLeft: 'auto', textDecoration: 'none' }}
        >
          <IconButton
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 8,
            }}
          >
            <Add />
            <Typography variant='body1'>Add New</Typography>
          </IconButton>
        </Link>

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
