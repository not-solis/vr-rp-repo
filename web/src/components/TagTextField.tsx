import { InputAdornment, TextFieldProps } from '@mui/material';

import { BlurrableTextField } from './BlurrableTextField';
import { TextTag } from './TextTag';

export const TagTextField = (
  props: {
    tags: string[];
    onTagClick: (tag: string) => () => void;
  } & TextFieldProps,
) => {
  const { tags = [], onTagClick } = props;
  return (
    <BlurrableTextField
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
                {tags.length > 0 &&
                  tags.map((t) => (
                    <TextTag
                      key={t}
                      tag={t}
                      variant='body1'
                      interactive
                      onClick={onTagClick(t)}
                      style={{ paddingTop: 0, paddingBottom: 0 }}
                    />
                  ))}
              </div>
            </InputAdornment>
          ),
        },
      }}
      {...props}
    />
  );
};
