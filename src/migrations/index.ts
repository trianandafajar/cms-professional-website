import * as migration_20260608_071946 from './20260608_071946'
import * as migration_20260609_033000_add_ticket_attendees from './20260609_033000_add_ticket_attendees'

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
]
