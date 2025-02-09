import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip, Typography } from '@mui/material';
import { HTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

export interface IconTextProps {
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
  isEditing?: boolean;
  component?: ReactNode;
  editComponent?: ReactNode;
}

export const IconText = (
  props: IconTextProps & HTMLAttributes<HTMLDivElement>,
) => {
  const {
    text,
    url,
    tooltip,
    tooltipPlacement,
    icon,
    iconPrefix,
    iconPadding,
    containerStyle = {},
    isEditing = false,
    component,
    editComponent,
    ...divProps
  } = props;

  const showEditComponent = !!(isEditing && editComponent);
  if (!text && !component && !showEditComponent) {
    return null;
  }

  let textElement = (
    <div
      style={{
        display: 'flex',
        alignItems: showEditComponent ? 'center' : 'flex-start',
        ...containerStyle,
      }}
      {...divProps}
    >
      {icon && (
        <Tooltip
          title={tooltip}
          placement={tooltipPlacement ?? 'top'}
          enterDelay={400}
          leaveDelay={100}
          slotProps={{
            popper: {
              modifiers: [{ name: 'offset', options: { offset: [0, -6] } }],
            },
          }}
        >
          <FontAwesomeIcon
            width={20}
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
      {component ||
        (isEditing
          ? editComponent
          : text && <Typography variant='body1'>{text}</Typography>)}
    </div>
  );

  if (url) {
    textElement = (
      <Link className='icon-text-link' to={url}>
        {textElement}
      </Link>
    );
  }
  return textElement;
};
