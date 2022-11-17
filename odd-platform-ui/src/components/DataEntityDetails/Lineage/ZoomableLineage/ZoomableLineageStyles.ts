import styled from 'styled-components';

export const Container = styled('svg')<{ $isDragging: boolean }>(
  ({ theme, $isDragging }) => ({
    cursor: $isDragging ? 'grabbing' : 'grab',
  })
);
// const RootSvg = styled.svg<{ isDragging: boolean } & SVGProps<SVGSVGElement>>`
//   cursor: ${props => (props.isDragging ? 'grabbing' : 'grab')};
//   @keyframes spin {
//     0% {
//       transform: rotate(0deg);
//     }
//     100% {
//       transform: rotate(359deg);
//     }
//   }
//
//   .lineageExpandLoading {
//     transform-box: fill-box;
//     transform-origin: 50% 50%;
//     animation: spin 2s linear infinite;
//   }
// `;
