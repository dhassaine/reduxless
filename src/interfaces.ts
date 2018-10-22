export interface Validators {
  [index: string]: (...args: any[]) => { valid: boolean; errors: any[] };
}

type MountPoint = string;

interface MountPointsToValues {
  [keys: string]: any;
}

export interface Store {
  set: (mountPoint: MountPoint, value: any) => void;
  setAll: (mountPointsToValues: MountPointsToValues) => void;
  get: (mountPoint: MountPoint) => any;
  getAll: (mountPoints: MountPoint[]) => MountPointsToValues;
  withMutations: (fn: ((mutableStore: Store) => void)) => void;
  addUpdateIntercept: (fn: () => any) => void;
  ping: () => void;
  subscribe: (fn: () => any) => () => void;
  syncToLocations?: string[];
  useHash?: boolean;
  syncedLocationToStore?: boolean;
}
