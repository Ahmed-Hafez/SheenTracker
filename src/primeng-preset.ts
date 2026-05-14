import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const PrimeNG_Preset = definePreset(Aura, {
  components: {
    accordion: {
      root: {
        transitionDuration: '0.2s',
      },
      panel: {
        borderWidth: '0',
        borderColor: 'transparent',
      },
      header: {
        color: '#1E3A8A',
        hoverColor: '#1E3A8A',
        activeColor: '#1E3A8A',
        background: '#fff',
        hoverBackground: '#EFF6FF',
        activeBackground: '#EFF6FF',
        activeHoverBackground: '#EFF6FF',
        borderRadius: '8px',
        padding: '1rem 1rem',
        fontWeight: '600',
      },
      content: {
        padding: '1rem 1.25rem 1.5rem 1.25rem',
      },
    },
    textarea: {
      colorScheme: {
        light: {
          root: {
            background: 'transparent',
            borderColor: '#F3F4F5',
            hoverBorderColor: '#6B7280',
            focusBorderColor: '#3B82F6',
            color: '#1A1A1A',
            
          },
        },
      },
      root: {
        borderRadius: '8px',
        paddingX: '0.875rem',
        paddingY: '0.625rem',
      },
    },
    inputtext: {
      colorScheme: {
        light: {
          root: {
            background: 'transparent',
            borderColor: '#F3F4F5',
            hoverBorderColor: '#6B7280',
            focusBorderColor: '#3B82F6',
          },
        },
      },
      root: {
        borderRadius: '8px',
        paddingX: '0.875rem',
        paddingY: '0.625rem',
      },
    },
    button: {
      colorScheme: {
        light: {
          root: {
            primary: {
              background: '#2563EB',
              hoverBackground: '#1D4ED8',
              activeBackground: '#1E40AF',
              borderColor: '#2563EB',
              hoverBorderColor: '#1D4ED8',
              color: '#ffffff',
            },
            secondary: {
              background: '#ffffff',
              hoverBackground: '#EFF6FF',
              activeBackground: '#DBEAFE',
              borderColor: '#2563EB',
              hoverBorderColor: '#1D4ED8',
              color: '#2563EB',
            },
          },
        },
      },
      root: {
        borderRadius: '8px',
        paddingX: '1.25rem',
        paddingY: '0.625rem',
      },
    },
    breadcrumb: {
      colorScheme: {
        light: {
          root: {
            background: '#FAFAFA',
          },
        },
      },
    },
    avatar: {
      colorScheme: {
        light: {
          root: {
            color: '#94A3B8',
            width: '2.5rem',
            height: '2.5rem',
          },
        },
      },
    },
    progressspinner: {
      colorScheme: {
        light: {
          root: {
            colorOne: '#2563EB',
            colorTwo: '#2563EB',
            colorThree: '#2563EB',
            colorFour: '#2563EB',
          },
        },
      },
    },

    select: {
      colorScheme: {
        light: {
          root: {
            background: 'white',
            borderColor: 'transparent',
            hoverBorderColor: '#6B7280',
            focusBorderColor: '#3B82F6',
          },
        },
      },
      root: {
        borderRadius: '8px',
        paddingX: '0.875rem',
        paddingY: '0.625rem',
      },
    },

    tooltip: {
      colorScheme: {
        light: {
          root: {
            background: '#ffffff',
            color: '#1E3A8A',
          },
        },
      },
    },
  },

  semantic: {
    colorScheme: {
      light: {
        primary: {
          color: '#3B82F6',
          inverseColor: '#ffffff',
          hoverColor: '#2563EB',
          activeColor: '#1D4ED8',
        },
        surface: {
          0: '#ffffff',
          50: '{zinc.50}',
          100: '{zinc.100}',
          200: '{zinc.200}',
          300: '{zinc.300}',
          400: '{zinc.400}',
          500: '{zinc.500}',
          600: '{zinc.600}',
          700: '{zinc.700}',
          800: '{zinc.800}',
          900: '{zinc.900}',
          950: '{zinc.950}',
        },
        highlight: {
          background: '{zinc.950}',
          focusBackground: '{zinc.700}',
          color: '#ffffff',
          focusColor: '#ffffff',
        },
        formField: {
          hoverBorderColor: '{primary.color}',
        },
        root: {
          background: '{surface.0}',
          color: '{surface.700}',
        },
        subtitle: {
          color: '{surface.500}',
        },
      },
    },
  },
});
