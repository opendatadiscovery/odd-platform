import { generatePath } from 'react-router-dom';

export const BASE_PATH = '/data-modelling';

export function dataModellingPath() {
  return generatePath(BASE_PATH);
}
