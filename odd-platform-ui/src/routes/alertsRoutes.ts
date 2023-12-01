const BASE_PATH = 'alerts';
export const AlertsRoutes = {
  BASE_PATH,
  ALL_PATH: `${BASE_PATH}/all`,
  MY_PATH: `${BASE_PATH}/my`,
  DEPENDENTS_PATH: `${BASE_PATH}/dependents`,
} as const;
