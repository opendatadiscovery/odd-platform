import { generatePath } from 'react-router-dom';
import { BASE_PATH } from './dataModelling';

export function relationshipsPath() {
  return generatePath(`${BASE_PATH}/relationships`);
}
