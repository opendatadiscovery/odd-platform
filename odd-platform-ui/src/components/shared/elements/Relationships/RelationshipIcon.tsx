import React from 'react';
import type { FC } from 'react';

interface RelationshipIconProps {
  type?: string;
}

export const RelationshipIcon: FC<RelationshipIconProps> = ({ type }) => {
  switch (type) {
    case 'ONE_TO_ZERO_OR_ONE':
      return (
        <svg
          width='280'
          height='18'
          viewBox='0 0 280 18'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M0 8H264H280' stroke='#97A0AF' strokeWidth='2' />
          <circle cx='240' cy='8' r='7' fill='white' stroke='#97A0AF' strokeWidth='2' />
          <path d='M16 0V16' stroke='#97A0AF' strokeWidth='2' />
          <path d='M264 0V16' stroke='#97A0AF' strokeWidth='2' />
        </svg>
      );
    case 'ONE_TO_ONE_OR_MORE':
      return (
        <svg
          width='280'
          height='18'
          viewBox='0 0 280 18'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M0 9H264M280 9H264M264 9L280 1M264 9L280 16.5'
            stroke='#97A0AF'
            strokeWidth='2'
          />
          <path d='M16 1V17' stroke='#97A0AF' strokeWidth='2' />
          <path d='M264 1V17' stroke='#97A0AF' strokeWidth='2' />
        </svg>
      );
    case 'ONE_TO_ZERO_OR_MORE':
      return (
        <svg
          width='280'
          height='18'
          viewBox='0 0 280 18'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M0 9H264M280 9H264M264 9L280 1M264 9L280 16.5'
            stroke='#97A0AF'
            strokeWidth='2'
          />
          <circle cx='240' cy='9' r='7' fill='white' stroke='#97A0AF' strokeWidth='2' />
          <path d='M16 1V17' stroke='#97A0AF' strokeWidth='2' />
        </svg>
      );
    case 'ONE_TO_EXACTLY_ONE':
      return (
        <svg
          width='280'
          height='18'
          viewBox='0 0 280 18'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M0 8H264H280' stroke='#97A0AF' strokeWidth='2' />
          <path d='M32 0V16' stroke='#97A0AF' strokeWidth='2' />
          <path d='M248 0V16' stroke='#97A0AF' strokeWidth='2' />
        </svg>
      );
    case 'ONE_TO_ZERO_ONE_OR_MORE':
      return (
        <svg
          width='280'
          height='18'
          viewBox='0 0 280 18'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M0 9H264M280 9H264M264 9L280 1M264 9L280 16.5'
            stroke='#97A0AF'
            strokeWidth='2'
          />
          <path d='M265 1V17' stroke='#97A0AF' strokeWidth='2' />
          <circle cx='240' cy='9' r='7' fill='white' stroke='#97A0AF' strokeWidth='2' />
          <path d='M16 1V17' stroke='#97A0AF' strokeWidth='2' />
        </svg>
      );
    default:
      return <>{type}</>;
  }
};
