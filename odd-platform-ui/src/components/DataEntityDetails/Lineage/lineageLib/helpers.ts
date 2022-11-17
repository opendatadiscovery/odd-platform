import { TransformMatrix } from '@visx/zoom/lib/types';

export const getTransform = (transform: TransformMatrix): string =>
  `matrix(${transform.scaleX}, ${transform.skewX}, ${transform.skewY}, ${transform.scaleY}, ${transform.translateX}, ${transform.translateY})`;
