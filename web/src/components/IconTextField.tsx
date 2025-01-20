import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TextFieldProps, Tooltip } from '@mui/material';

import { BlurrableTextField } from './BlurrableTextField';

interface IconTextProps {
  tooltip?: string;
  tooltipPlacement?:
    | 'bottom-end'
    | 'bottom-start'
    | 'bottom'
    | 'left-end'
    | 'left-start'
    | 'left'
    | 'right-end'
    | 'right-start'
    | 'right'
    | 'top-end'
    | 'top-start'
    | 'top';
  icon?: IconName;
  iconPrefix?: IconPrefix;
  iconPadding?: number | string;
  component?: JSX.Element;
}

export const IconTextField = (props: IconTextProps & TextFieldProps) => {
  const {
    tooltip,
    tooltipPlacement,
    icon,
    iconPrefix,
    iconPadding,
    ...restProps
  } = props;
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {icon && (
        <Tooltip
          title={tooltip}
          placement={tooltipPlacement ?? 'top'}
          enterDelay={150}
          leaveDelay={100}
          slotProps={{
            popper: {
              modifiers: [{ name: 'offset', options: { offset: [0, -6] } }],
            },
          }}
        >
          <FontAwesomeIcon
            height={4}
            fixedWidth={true}
            style={{
              fontSize: 16,
              paddingTop: 4,
              paddingRight: icon ? (iconPadding ?? 12) : 0,
            }}
            icon={[iconPrefix ?? 'fas', icon]}
          />
        </Tooltip>
      )}
      <BlurrableTextField {...restProps} />
    </div>
  );
};
