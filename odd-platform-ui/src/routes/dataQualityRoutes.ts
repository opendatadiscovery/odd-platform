const DataQualityRoutes = {
  BASE_PATH: 'data-quality',
} as const;

export function dataQualityPath() {
  return DataQualityRoutes.BASE_PATH;
}
