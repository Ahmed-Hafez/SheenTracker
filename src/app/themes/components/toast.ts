import type { ToastDesignTokens } from '@primeuix/themes/types/toast';

/** A plain white sheet like every other card; only the icon carries the status color. */
const SHADOW = '0 8px 24px rgb(29 29 27 / 0.14), 0 2px 6px rgb(29 29 27 / 0.08)';

const neutral = {
  background: 'var(--white)',
  borderColor: 'var(--charcoal-100)',
  color: 'var(--charcoal-900)',
  detailColor: 'var(--charcoal-800)',
  shadow: SHADOW,
  closeButton: {
    hoverBackground: 'rgb(29 29 27 / 0.08)',
    focusRing: { color: 'var(--orange-500)', shadow: 'none' },
  },
};

export const toast: ToastDesignTokens = {
  root: { width: '21rem', borderRadius: 'var(--radius-lg)', borderWidth: '1px' },
  content: { padding: '0.875rem 1rem', gap: '0.75rem' },
  text: { gap: '0.25rem' },
  summary: { fontWeight: '600', fontSize: '0.875rem' },
  detail: { fontWeight: '400', fontSize: '0.8125rem' },
  colorScheme: {
    light: {
      success: neutral,
      info: neutral,
      warn: neutral,
      error: neutral,
      secondary: neutral,
      contrast: neutral,
    },
  },
};
