import { Autocomplete, TextField, TextFieldProps } from '@mui/material';

import { TagChip } from './TagChip';

export const TagTextField = (
  props: {
    tags: string[];
    addTag: (tag: string) => void;
    onTagClick: (tag: string) => void;
    setTags?: (tags: string[]) => void;
    fullWidth?: boolean;
  } & TextFieldProps,
) => {
  const { tags = [], addTag, onTagClick, fullWidth, ...restProps } = props;
  return (
    <Autocomplete
      clearIcon={false}
      options={[]}
      fullWidth={fullWidth}
      multiple
      value={tags}
      freeSolo
      onChange={(event, values, reason) => {
        if (reason === 'createOption') {
          addTag(values[values.length - 1]);
        }
      }}
      renderTags={(values, props) => {
        return values.map((t, index) => {
          const tagProps = props({ index });
          const { key, className, ...restProps } = tagProps;
          return (
            <TagChip
              key={key}
              label={t}
              {...restProps}
              className={className + ' tag interactable'}
              style={{ height: 24 }}
              onClick={() => onTagClick(t)}
              onDelete={undefined}
            />
          );
        });
      }}
      renderInput={(params) => <TextField {...params} {...restProps} />}
    />
  );
};
