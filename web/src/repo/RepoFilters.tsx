import {
  Box,
  Button,
  FormControl,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import { RoleplayProjectProps, RoleplayStatus } from '../model/RoleplayProject';

interface FilterProps {
  nameFilter: string;
  setNameFilter: (name: string) => void;
  tagFilters: string[];
  setTagFilters: (tags: string[]) => void;
}

export const RepoFilters = (props: FilterProps) => {
  const { nameFilter, setNameFilter, tagFilters, setTagFilters } = props;
  const theme = useTheme();
  const [name, setName] = useState(nameFilter || '');
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
          gap: '12px',
        }}
      >
        <TextField
          label='Name'
          variant='outlined'
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        {tagFilters && tagFilters.length > 0 && (
          <div>
            {tagFilters.map((t) => (
              <div>{t}</div>
            ))}
          </div>
        )}
        <FormControl style={{ minWidth: '80px' }}>
          {/* <InputLabel id='status-label'>Status</InputLabel>
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
          </Select> */}
        </FormControl>

        <Button
          style={{
            backgroundColor: 'blue',
            color: theme.palette.text.primary,
          }}
          variant='contained'
          onClick={applyFilters}
        >
          Apply Filters
        </Button>
      </FormGroup>
    </Box>
  );
};
