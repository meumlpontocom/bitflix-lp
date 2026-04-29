import * as migration_20260429_220628_initial from './20260429_220628_initial';

export const migrations = [
  {
    up: migration_20260429_220628_initial.up,
    down: migration_20260429_220628_initial.down,
    name: '20260429_220628_initial'
  },
];
