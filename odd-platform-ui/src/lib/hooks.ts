/**
 * Find out dynamically size of scrollbar width of client's browser.
 * For Chrome default is 15px
 * @param {number} width - default scrollbar width if hook failed.
 * @returns {string} scrollbar width or default value if calculated value for scrollbar is 0.
 */
export const useScrollBarWidth = (width = 15) => {
  const scrollDiv = document.createElement('div');
  scrollDiv.style.overflow = 'scroll';
  document.body.appendChild(scrollDiv);
  const scrollbarWidth = `${
    scrollDiv.offsetWidth - scrollDiv.clientWidth || width
  }px`;
  document.body.removeChild(scrollDiv);
  return scrollbarWidth;
};
