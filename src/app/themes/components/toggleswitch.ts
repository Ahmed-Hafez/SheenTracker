import type { ToggleSwitchDesignTokens } from '@primeuix/themes/types/toggleswitch';

export const toggleswitch: ToggleSwitchDesignTokens = {
  colorScheme: {
    light: {
      root: {
        background: '#e3e1de',
        borderColor: 'transparent',
        hoverBackground: '#e3e1de',
        checkedBackground: 'var(--orange-700)',
        checkedHoverBackground: 'var(--orange-900)',
      },
      handle: {
        background: 'var(--white)',
        color: 'var(--white)',
        hoverBackground: 'var(--white)',
        hoverColor: 'var(--white)',
      },
    },
  },
};
