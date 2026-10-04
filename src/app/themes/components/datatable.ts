import type { DataTableDesignTokens } from '@primeuix/themes/types/datatable';

export const datatable: DataTableDesignTokens = {
  colorScheme: {
    light: {
      root: {
        borderColor: 'var(--charcoal-600)',
      },
      headerCell: {
        background: '#f9f8f7',
        color: 'var(--charcoal-900)',
        padding: '0.5rem 1rem',
        borderColor: '#eceae8',
        hoverBackground: 'var(--page-bg)',
      },
      header: {
        borderColor: 'var(--charcoal-600)',
        borderWidth: '1px',
        sm: {
          padding: '0.5rem 1rem',
        },
      },
      row: {
        hoverBackground: 'var(--charcoal-50)',
      },
      bodyCell: {
        padding: '0.75rem 1rem',
        borderColor: 'var(--charcoal-100)',
      },
      sortIcon: {
        color: 'var(--charcoal-400)',
        hoverColor: 'var(--orange-500)',
        size: '0.75rem',
      },
      columnTitle: {
        fontWeight: '400',
      },
    },
  },
};
