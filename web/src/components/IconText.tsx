import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TextFieldProps, Tooltip, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { BlurrableTextField } from './BlurrableTextField';

interface IconTextProps {
  text?: string;
  url?: string;
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
  containerStyle?: React.CSSProperties;
  component?: JSX.Element;
}

export const IconText = (props: IconTextProps) => {
  const {
    text,
    url,
    tooltip,
    tooltipPlacement,
    icon,
    iconPrefix,
    iconPadding,
    containerStyle = {},
    component,
  } = props;

  if (!text && !component) {
    return null;
  }

  let textElement = (
    <div
      style={{
        display: 'flex',
        alignItems: component ? 'center' : 'flex-start',
        ...containerStyle,
      }}
    >
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
      {component || (text && <Typography variant='body1'>{text}</Typography>)}
    </div>
  );

  if (url) {
    textElement = <Link to={url}>{textElement}</Link>;
  }
  return textElement;
};
