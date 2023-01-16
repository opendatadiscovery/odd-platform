import {
  type DataQualityTestExpectation,
  DataSetFieldTypeTypeEnum,
} from 'generated-sources';
import capitalize from 'lodash/capitalize';
import { type Theme } from '@mui/material';
import { type EventType } from 'lib/interfaces';
import { format } from 'date-fns';
import lowerCase from 'lodash/lowerCase';

export const isComplexField = (fieldType: DataSetFieldTypeTypeEnum) =>
  [
    DataSetFieldTypeTypeEnum.STRUCT,
    DataSetFieldTypeTypeEnum.LIST,
    DataSetFieldTypeTypeEnum.MAP,
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

function sliceBothSidesOfBoldedWord(str: string, wordsToLeave: number) {
  const reg = /<b>(.*?)<\/b>/g;

  const boldedWord = str.match(reg)?.[0] || '';
  const exactWord = boldedWord.slice(3, -4);
  const splitted = str.split(boldedWord);

  const wordsBeforeExactWord = splitted[0].trim().split(' ').slice(-wordsToLeave);
  const wordsCountBeforeExactWord = splitted[0].trim().split(' ').length;
  const stringBeforeExactWord = wordsBeforeExactWord.join(' ');
  const wordsAfterExactWord = splitted[1].trim().split(' ').slice(0, wordsToLeave);
  const wordsCountAfterExactWord = splitted[1].trim().split(' ').length;
  const stringAfterExactWord = wordsAfterExactWord.join(' ');

  let startEllipsis = '...';
  let endEllipsis = '...';

  if (wordsCountBeforeExactWord - wordsToLeave <= 0) startEllipsis = '';
  if (wordsCountAfterExactWord - wordsToLeave <= 0) endEllipsis = '';

  return {
    before: `${startEllipsis}${stringBeforeExactWord}`,
    exactWord,
    after: `${stringAfterExactWord}${endEllipsis}`,
  };
}
