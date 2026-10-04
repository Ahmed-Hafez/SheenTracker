import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { toggleswitch } from './components/toggleswitch';
import { datepicker } from './components/datepicker';
import { datatable } from './components/datatable';
import { select } from './components/select';
import { tabs } from './components/tabs';
import { inputtext } from './components/inputtext';
import { inputgroup } from './components/inputgroup';
import { textarea } from './components/textarea';
import { breadcrumb } from './components/breadcrumb';
import { listbox } from './components/listbox';
import { menu } from './components/menu';
import { semantic } from './semantic';

export const PrimeNG_Preset = definePreset(Aura, {
  semantic,
  components: {
    toggleswitch,
    datepicker,
    datatable,
    select,
    tabs,
    inputtext,
    inputgroup,
    textarea,
    breadcrumb,
    listbox,
    menu,
  },
});
