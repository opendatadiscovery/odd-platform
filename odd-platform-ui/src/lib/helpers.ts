import capitalize from 'lodash/capitalize';
import { type Theme } from '@mui/material';
import type { EventType } from 'lib/interfaces';
import { format } from 'date-fns';
import lowerCase from 'lodash/lowerCase';
import {
  DataSetFieldTypeTypeEnum,
  MetadataFieldType,
  type DataQualityTestExpectation,
  type MetadataField,
} from 'generated-sources';

export const isComplexField = (fieldType: DataSetFieldTypeTypeEnum) =>
  [
    DataSetFieldTypeTypeEnum.STRUCT,
    DataSetFieldTypeTypeEnum.LIST,
    DataSetFieldTypeTypeEnum.MAP,
    DataSetFieldTypeTypeEnum.UNION,
  ].includes(fieldType);

export const stringFormatted = (
  value: string,
  splitter: '_' | '.',
  capitalizing:
    | 'all'
    | 'firstLetterOfString'
    | 'firstLetterOfEveryWord'
    | 'disabled'
    | 'uncapitalizing',
  removePrefix?: boolean
) => {
  const capitalizeBy = (str: string, idx: number) => {
    if (capitalizing === 'all') return str.toUpperCase();
    if (capitalizing === 'firstLetterOfEveryWord') return capitalize(str);
    if (capitalizing === 'firstLetterOfString' && idx === 0) return capitalize(str);
    if (capitalizing === 'uncapitalizing') return lowerCase(str);

    return str;
  };

  return value
    .split(splitter)
    .slice(removePrefix ? 1 : 0)
    .map(capitalizeBy)
    .join(' ');
};

export const formatDate = (date: number, dateFormat: string) => format(date, dateFormat);
export const toDate = (dateToCast: number): Date => new Date(dateToCast);
export const toTimestamp = (dateToCast: Date): number => dateToCast.getTime();

export const setActivityBackgroundColor = (
  theme: Theme,
  eventType?: EventType
): string => {
  switch (eventType) {
    case 'created':
      return theme.palette.activityEvent.created;
    case 'assigned':
      return theme.palette.activityEvent.created;
    case 'updated':
      return theme.palette.activityEvent.updated;
    case 'deleted':
      return theme.palette.activityEvent.deleted;
    default:
      return '';
  }
};

export const hasDataQualityTestExpectations = (
  expectations?: DataQualityTestExpectation
) => expectations && Object.keys(expectations).some(key => expectations[key]);

export const pseudoRandNum = (function xoshiro128p() {
  let a = Date.now();
  let b = Date.now();
  let c = Date.now();
  let d = Date.now();
  return () => {
    /* eslint-disable no-bitwise */
    const t = b << 9;
    const r = a + d;
    c ^= a;
    d ^= b;
    b ^= c;
    a ^= d;
    c ^= t;
    d = (d << 11) | (d >>> 21);
    return (r >>> 0) / 4294967296;
  };
})();

export const createUrl = (endpoint: string | undefined) =>
  endpoint
    ? `${window.location.protocol}//${window.location.host}${endpoint}`
    : `${window.location.protocol}//${window.location.host}`;

export const getEllipsisTextByWidth = (
  el: SVGTextElement | SVGTSpanElement | null,
  text: string | undefined,
  width: number
) => {
  if (!el || !text) return;
  if (!document.body.contains(el)) return;

  if (typeof el.getSubStringLength !== 'undefined') {
    el.textContent = text;
    let len = text.length;
    // eslint-disable-next-line no-plusplus
    while (el.getSubStringLength(0, len--) > width) {
      el.textContent = `${text.slice(0, len)}...`;
    }
  } else if (typeof el.getComputedTextLength !== 'undefined') {
    while (el.getComputedTextLength() > width) {
      text = text.slice(0, -1);
      el.textContent = `${text}...`;
    }
  } else {
    while (el.getBBox().width > width) {
      text = text.slice(0, -1);
      el.textContent = `${text}...`;
    }
  }
};

type CSSOptions = Pick<
  CSSStyleDeclaration,
  'fontFamily' | 'fontSize' | 'fontWeight' | 'lineHeight' | 'visibility' | 'display'
>;

function getCreatedElWidth(text: string, options?: CSSOptions) {
  const el = document.createElement('div');
  const textContent = document.createTextNode(text);
  el.appendChild(textContent);

  el.style.fontFamily = options?.fontFamily || 'Roboto';
  el.style.fontSize = options?.fontSize || '14px';
  el.style.fontWeight = options?.fontWeight || '400';
  el.style.lineHeight = options?.lineHeight || '20px';
  el.style.visibility = options?.visibility || 'hidden';
  el.style.display = options?.display || 'initial';

  document.body.appendChild(el);

  const width = el.offsetWidth;

  el?.parentNode?.removeChild(el);

  return width;
}

export function sliceStringByWidth(
  str: string,
  width: number,
  options?: CSSOptions
): string {
  if (!str) return '';

  const ellipsis = '...';
  const splitted = str.split(' ');
  const fitWordStart = splitted.findIndex(el => el.includes('<b>'));
  const firWordEnd = splitted.findIndex(el => el.includes('</b>'));

  let resultString: string[] = [];
  if (fitWordStart === firWordEnd) {
    resultString.push(splitted[fitWordStart]);
  } else {
    resultString.push(splitted[fitWordStart], splitted[firWordEnd]);
  }

  let elWidth = 0;
  let counter = 1;

  while (elWidth <= width) {
    resultString = [
      splitted[fitWordStart - counter],
      ...resultString,
      splitted[firWordEnd + counter],
    ];

    if (
      splitted[fitWordStart - counter] === undefined &&
      splitted[firWordEnd + counter] === undefined
    ) {
      break;
    }

    counter += 1;
    elWidth = getCreatedElWidth(resultString.join(' '), options);
  }

  if (splitted[fitWordStart - counter]) {
    resultString = [ellipsis, ...resultString];
  }
  if (splitted[firWordEnd + counter]) {
    resultString = [...resultString, ellipsis];
  }

  return resultString.join(' ');
}

export function getMetadataValue(
  field: MetadataField,
  value: string,
  formatMetadataTime: (date: number) => string
): string {
  let metadataVal;

  try {
    switch (field.type) {
      case MetadataFieldType.BOOLEAN:
        metadataVal = value === 'true' ? 'Yes' : 'No';
        break;
      case MetadataFieldType.DATETIME:
        metadataVal = formatMetadataTime(new Date(value).getTime());
        break;
      case MetadataFieldType.ARRAY:
        metadataVal = JSON.parse(value).join(', ');
        break;
      case MetadataFieldType.JSON:
        metadataVal = JSON.stringify(JSON.parse(value), null, 2);
        break;
      default:
        metadataVal = value;
    }
  } catch {
    metadataVal = value;
  }

  return metadataVal;
}

export const mapKeysToValue = <K extends string, V>(keys: K[], value: V) =>
  Object.fromEntries(keys.map(key => [key, value])) as { [key in K]: V };

export const bytesToKb = (bytes: number) => Math.ceil(bytes / 1000);
export const bytesToMb = (bytes: number) => Math.ceil(bytes / 1000000);

export function isImageFile(fileName: string): boolean {
  const imageExtensions = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'bmp',
    'webp',
    'svg',
    'tif',
    'tiff',
  ];
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  return imageExtensions.includes(extension);
}

export async function asyncPool(
  concurrency: number,
  iterable: number[],
  iteratorFn: (item: number, iterable: number[]) => Promise<void>
) {
  const retries = [];
  const executing = new Set();

  // eslint-disable-next-line no-restricted-syntax
  for await (const item of iterable) {
    const currentTask = Promise.resolve().then(() => iteratorFn(item, iterable));

    retries.push(currentTask);
    executing.add(currentTask);

    const clean = () => executing.delete(currentTask);
    currentTask.then(clean).catch(clean);
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  return Promise.all(retries);
}

export function pluralize(count: number, text: string, pluralText: string) {
  return `${count} ${count === 1 ? text : pluralText}`;
}
