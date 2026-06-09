import * as migration_20260608_071946 from './20260608_071946';
import * as migration_20260609_033000_add_ticket_attendees from './20260609_033000_add_ticket_attendees';
import * as migration_20260609_041000_ticket_design_presets from './20260609_041000_ticket_design_presets';
import * as migration_20260609_060601 from './20260609_060601';

export const migrations = [
  {
    up: migration_20260608_071946.up,
    down: migration_20260608_071946.down,
    name: '20260608_071946',
  },
  {
    up: migration_20260609_033000_add_ticket_attendees.up,
    down: migration_20260609_033000_add_ticket_attendees.down,
    name: '20260609_033000_add_ticket_attendees',
  },
  {
    up: migration_20260609_041000_ticket_design_presets.up,
    down: migration_20260609_041000_ticket_design_presets.down,
    name: '20260609_041000_ticket_design_presets',
  },
  {
    up: migration_20260609_060601.up,
    down: migration_20260609_060601.down,
    name: '20260609_060601'
  },
];
