export const TABLES = {
  BOTTLES: 'bottle_instances',
  WINES: 'wines',
  SPACES: 'spaces',
  SPACE_MEMBERS: 'space_members',
  CONSUMPTIONS: 'consumptions',
} as const;

export const ERROR_MESSAGES = {
  AUTH_REQUIRED: 'You must be logged in to perform this action',
  FETCH_FAILED: (entity: string) => `Failed to fetch ${entity}`,
  ADD_FAILED: (entity: string) => `Failed to add ${entity}`,
  UPDATE_FAILED: (entity: string) => `Failed to update ${entity}`,
  DELETE_FAILED: (entity: string) => `Failed to delete ${entity}`,
  SEARCH_FAILED: (entity: string) => `Failed to search ${entity}`,
  INVALID_DATA: 'Invalid data provided',
} as const;

export const STORAGE_KEYS = {
  CURRENT_SPACE_ID: 'currentSpaceId',
} as const;
