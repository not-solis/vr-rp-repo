import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, Tooltip, Typography } from '@mui/material';

interface IconTextProps {
  text: string;
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
  } = props;
  let linkElement = (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      {icon && (
        <FontAwesomeIcon
          height={4}
          fixedWidth={true}
          style={{ fontSize: 16, paddingTop: 4 }}
          icon={[iconPrefix ?? 'fas', icon]}
        />
      )}
      <Typography
        variant='body1'
        style={{ paddingLeft: icon ? iconPadding ?? 12 : 0 }}
      >
        {text}
      </Typography>
    </div>
  );

  if (url) {
    linkElement = <Link href={url}>{linkElement}</Link>;
  }

  if (tooltip) {
    linkElement = (
      <Tooltip
        title={tooltip}
        placement={tooltipPlacement ?? 'top'}
        enterDelay={50}
        leaveDelay={100}
        slotProps={{
          popper: {
            modifiers: [{ name: 'offset', options: { offset: [0, -6] } }],
          },
        }}
      >
        {linkElement}
      </Tooltip>
    );
  }
  return linkElement;
};
