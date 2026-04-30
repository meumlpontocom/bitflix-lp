import * as migration_20260429_220628_initial from './20260429_220628_initial';
import * as migration_20260430_pages_globals from './20260430_pages_globals';

export const migrations = [
  {
    up: migration_20260429_220628_initial.up,
    down: migration_20260429_220628_initial.down,
    name: '20260429_220628_initial'
  },
  {
    up: migration_20260430_pages_globals.up,
    down: migration_20260430_pages_globals.down,
    name: '20260430_pages_globals'
  },
];
