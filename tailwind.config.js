/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        orange: {
          50: 'var(--orange-50)',
          300: 'var(--orange-300)',
          500: 'var(--orange-500)',
          700: 'var(--orange-700)',
          900: 'var(--orange-900)',
        },
        charcoal: {
          50: 'var(--charcoal-50)',
          100: 'var(--charcoal-100)',
          400: 'var(--charcoal-400)',
          600: 'var(--charcoal-600)',
          800: 'var(--charcoal-800)',
          900: 'var(--charcoal-900)',
        },
        success: 'var(--success)',
        'success-bg': 'var(--success-bg)',
        warning: 'var(--warning)',
        'warning-bg': 'var(--warning-bg)',
        danger: 'var(--danger)',
        'danger-bg': 'var(--danger-bg)',
        info: 'var(--info)',
        'info-bg': 'var(--info-bg)',
        white: 'var(--white)',
        page: 'var(--page-bg)',
        card: 'var(--card-bg)',
        sidebar: 'var(--sidebar-bg)',
        topbar: 'var(--topbar-bg)',

        primary: 'var(--orange-500)',
        'primary-hover': 'var(--orange-700)',
        secondary: 'var(--charcoal-600)',
        'secondary-hover': 'var(--charcoal-800)',

        reset: 'var(--charcoal-100)',
        'reset-hover': 'var(--charcoal-400)',
        'search-container': 'var(--charcoal-50)',
        'label-color': 'var(--charcoal-400)',
        'danger-hover': 'var(--danger)',
      },
      spacing: {
        xs: 'var(--space-xs)',
        sm: 'var(--space-sm)',
        md: 'var(--space-md)',
        lg: 'var(--space-lg)',
        xl: 'var(--space-xl)',
        '2xl': 'var(--space-2xl)',
        '3xl': 'var(--space-3xl)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      maxWidth: {
        content: 'var(--content-max-w)',
      },
      width: {
        sidebar: 'var(--sidebar-width)',
      },
      height: {
        topbar: 'var(--topbar-height)',
      },
    },
  },
  plugins: [require('tailwindcss-primeui')],
};
