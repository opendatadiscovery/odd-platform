import CustomElement from './custom-element';

export default class TextBox extends CustomElement {
  /**
   *
   */
  async innerText() {
    await this.waitForElementToBeVisible();

    return this.customElement.innerText();
  }

  /**
   *  Selects the target text inside text box
   *
   * @param textToSelect string which should be selected
   */
  async selectText(textToSelect: string): Promise<void> {
    await this.context.mouse.down();
    await this.customElement.evaluate(
      (element, { textToSelect }) => {
        let elementText: string;

        if (
          typeof element.textContent === 'string' &&
          document.createRange &&
          window.getSelection
        ) {
          elementText = element.textContent.replace(/(?:\r\n|\r|\n)/g, '').replace(/\s\s+/g, ' ');
        }

        const startIndex = elementText.indexOf(textToSelect);

        setSelectionRange(element, startIndex, startIndex + textToSelect.length);

        /**
         *
         * @param node
         */
        function getTextNodesIn(node: Node): ChildNode[] & Node[] {
          const textNodes: ChildNode[] & Node[] = [];

          if (node.nodeType === 3) {
            if (isTextNodeAndContentNotEmpty(node)) {
              textNodes.push(node);
            }
          } else {
            const children = node.childNodes;

            for (let i = 0, len = children.length; i < len; ++i) {
              if (isTextNodeAndContentNotEmpty(children[i])) {
                textNodes.push(...getTextNodesIn(children[i]));
              }
            }
          }

          return textNodes;
        }

        /**
         *
         * @param el
         * @param start
         * @param end
         */
        function setSelectionRange(el: Node, start: number, end: number) {
          if (document.createRange && window.getSelection) {
            const range = document.createRange();

            range.selectNodeContents(el);

            const textNodes = getTextNodesIn(el);
            let foundStart = false;
            let charCount = 0;
            let endCharCount;

            for (let i = 0, textNode: Node; (textNode = textNodes[i++]); ) {
              endCharCount = charCount + textNode.textContent.trimStart().length;

              if (
                !foundStart &&
                start >= charCount &&
                (start < endCharCount || (start === endCharCount && i === textNodes.length))
              ) {
                range.setStart(textNode, start - charCount);
                foundStart = true;
              }
              if (foundStart && end <= endCharCount) {
                range.setEnd(textNode, end - charCount);
                break;
              }
              charCount = endCharCount;
            }

            const sel = window.getSelection();

            sel.removeAllRanges();
            sel.addRange(range);
          }
        }

        /**
         *
         * @param node
         */
        function isTextNodeAndContentNotEmpty(node: Node) {
          return node.textContent.trim().length > 0;
        }
      },
      { textToSelect },
    );
    const boundingBox = await this.customElement.boundingBox();

    await this.context.mouse.move(boundingBox.x, boundingBox.y);
    await this.context.mouse.up();
  }

  /**
   *
   */
  async getHighlightedText() {
    return (await this.customElement.locator('[class*="highlighted"]').allInnerTexts()).join('');
  }

  /**
   *
   */
  async focus() {
    await this.customElement.click();
  }

  /**
   * Checks if the text is visible
   */
  async isVisible(): Promise<boolean> {
    await this.customElement.waitFor({ state: 'visible' });
    return this.customElement.isVisible();
  }

  /**
   * Checks if the text is hidden
   */
  async isHidden(): Promise<boolean> {
    await this.customElement.waitFor({ state: 'hidden' });
    return this.customElement.isHidden();
  }
}
