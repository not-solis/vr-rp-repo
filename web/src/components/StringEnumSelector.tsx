import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
} from '@mui/material';

interface StringEnumSelectorProps {
  enumType: Record<string, string>;
  label?: string;
  includeEmptyValue?: boolean;
}

export const StringEnumSelector = (
  props: StringEnumSelectorProps & SelectProps,
) => {
  const { enumType, label, style, includeEmptyValue, ...restProps } = props;
  const labelId = `${label?.toLowerCase().replace(' ', '-')}-label`;

  const select = (
    <Select labelId={labelId} label={label} size='small' {...restProps}>
      {includeEmptyValue && (
        <MenuItem value={''}>
          <em>-</em>
        </MenuItem>
      )}
      {Object.entries(enumType).map(([k, v]) => (
        <MenuItem key={k} value={v as string}>
          {v}
        </MenuItem>
      ))}
    </Select>
  );

  return restProps.variant === 'outlined' ? (
    <FormControl style={style}>
      <InputLabel size='small' id={labelId}>
        {label}
      </InputLabel>
      {select}
    </FormControl>
  ) : (
    select
  );
};
