import type { MenuDesignTokens } from '@primeuix/themes/types/menu';

export const menu: MenuDesignTokens = {
  colorScheme: {
    light: {
      root: {
        background: 'var(--page-bg)',
        borderColor: 'var(--page-bg)',
        borderRadius: '14px',
      },
      // PrimeNG uses the focus tokens for hover too, so these are the hover colors.
      item: {
        focusBackground: 'var(--orange-50)',
        focusColor: 'var(--charcoal-900)',
        icon: { focusColor: 'var(--charcoal-900)' },
      },
    },
  },
};
