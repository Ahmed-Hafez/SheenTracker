import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const PrimeNG_Preset = definePreset(Aura, {
  components: {
    toggleswitch: {
      colorScheme: {
        light: {
          root: {
            borderColor: 'var(--orange-500)',
            hoverBackground: 'var(--orange-600)',
            checkedBackground: 'var(--orange-500)',
            checkedHoverBackground: 'var(--orange-600)',
          },
          handle: {
            background: 'var(--charcoal-600)',
            color: 'var(--charcoal-600)',
          },
        },
      },
    },
  },
});
