import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const PrimeNG_Preset = definePreset(Aura, {
  semantic: {
    primary: {
      50: 'var(--orange-50)',
      100: 'var(--orange-50)',
      200: 'var(--orange-300)',
      300: 'var(--orange-300)',
      400: 'var(--orange-500)',
      500: 'var(--orange-500)',
      600: 'var(--orange-700)',
      700: 'var(--orange-700)',
      800: 'var(--orange-900)',
      900: 'var(--orange-900)',
      950: 'var(--orange-900)',
    },
    colorScheme: {
      light: {
        surface: {
          0: 'var(--white)',
          50: 'var(--charcoal-50)',
          100: 'var(--charcoal-100)',
          200: 'var(--charcoal-100)',
          300: 'var(--charcoal-400)',
          400: 'var(--charcoal-400)',
          500: 'var(--charcoal-600)',
          600: 'var(--charcoal-600)',
          700: 'var(--charcoal-800)',
          800: 'var(--charcoal-800)',
          900: 'var(--charcoal-900)',
          950: 'var(--charcoal-900)',
        },
        primary: {
          color: 'var(--orange-500)',
          contrastColor: 'var(--white)',
          hoverColor: 'var(--orange-700)',
          activeColor: 'var(--orange-900)',
        },
        highlight: {
          background: 'var(--orange-50)',
          focusBackground: 'var(--orange-300)',
          color: 'var(--orange-700)',
          focusColor: 'var(--orange-900)',
        },
      },
    },
  },
  components: {
    toggleswitch: {
      colorScheme: {
        light: {
          root: {
            borderColor: 'var(--orange-500)',
            hoverBackground: 'var(--orange-700)',
            checkedBackground: 'var(--orange-500)',
            checkedHoverBackground: 'var(--orange-700)',
          },
          handle: {
            background: 'var(--charcoal-600)',
            color: 'var(--charcoal-600)',
          },
        },
      },
    },
    datepicker: {
      colorScheme: {
        light: {
          date: {
            selectedBackground: 'var(--orange-500)',
            rangeSelectedBackground: 'var(--orange-50)',
            rangeSelectedColor: 'var(--charcoal-900)',
            hoverBackground: 'var(--orange-300)',
          },
        },
      },
    },
    datatable: {
      colorScheme: {
        light: {
          root: {
            borderColor: 'var(--charcoal-600)',
          },
          headerCell: {
            background: 'var(--page-bg)',
            color: 'var(--charcoal-900)',
            padding: '0.5rem 1rem',
            borderColor: 'var(--charcoal-100)',
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
          }
        },
      },
    },
  },
});
