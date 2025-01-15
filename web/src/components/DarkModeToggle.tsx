import { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import Toggle from 'react-toggle';

import 'react-toggle/style.css';

export const DarkModeToggle = () => {
  const systemPrefersDark = useMediaQuery(
    { query: '(prefers-color-scheme: dark)' },
    undefined,
    (isSystemDark) => setIsDark(isSystemDark),
  );
  const [isDark, setIsDark] = useState(systemPrefersDark);

  return (
    <Toggle
      checked={isDark}
      onChange={(event: { target: any }) => setIsDark(event.target.checked)}
      icons={{ checked: '🌙', unchecked: '🔆' }}
      aria-label='Dark mode toggle'
    />
  );
};
