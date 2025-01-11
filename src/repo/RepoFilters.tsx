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
  filters: Partial<RoleplayProjectProps>;
  applyFilters: (props: Partial<RoleplayProjectProps>) => void;
}

export const RepoFilters = (props: FilterProps) => {
  const { filters, applyFilters } = props;
  const theme = useTheme();
  const [nameFilter, setNameFilter] = useState(filters.name || '');
  const [status, setStatus] = useState(filters.status);

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
          onChange={(e) => setNameFilter(e.target.value)}
          value={nameFilter}
        />
        <FormControl style={{ minWidth: '80px' }}>
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
        </FormControl>

        <Button
          style={{
            backgroundColor: 'blue',
            color: theme.palette.text.primary,
          }}
          variant='contained'
          onClick={() => applyFilters({ name: nameFilter, status: status })}
        >
          Apply Filters
        </Button>
      </FormGroup>
    </Box>
  );
};
