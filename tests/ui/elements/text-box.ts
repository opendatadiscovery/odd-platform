import CustomElement from './custom-element';

export default class TextBox extends CustomElement {
  /**
   *
   */
  async inner_text() {
    await this.wait_for_element_to_be_visible();

    return this.custom_element.innerText();
  }

  /**
   *  Selects the target text inside text box
   *
   * @param text_to_select string which should be selected
   */
  async select_text(text_to_select: string): Promise<void> {
    await this.context.mouse.down();
    await this.custom_element.evaluate(
      (element, { text_to_select }) => {
        let element_text: string;

        if (
          typeof element.textContent === 'string' &&
          document.createRange &&
          window.getSelection
        ) {
          element_text = element.textContent.replace(/(?:\r\n|\r|\n)/g, '').replace(/\s\s+/g, ' ');
        }

        const start_index = element_text.indexOf(text_to_select);

        set_selection_range(element, start_index, start_index + text_to_select.length);

        /**
         *
         * @param node
         */
        function get_text_nodes_in(node: Node): ChildNode[] & Node[] {
          const text_nodes: ChildNode[] & Node[] = [];

          if (node.nodeType === 3) {
            if (is_text_node_and_content_no_empty(node)) {
              text_nodes.push(node);
            }
          } else {
            const children = node.childNodes;

            for (let i = 0, len = children.length; i < len; ++i) {
              if (is_text_node_and_content_no_empty(children[i])) {
                text_nodes.push(...get_text_nodes_in(children[i]));
              }
            }
          }

          return text_nodes;
        }

        /**
         *
         * @param el
         * @param start
         * @param end
         */
        function set_selection_range(el: Node, start: number, end: number) {
          if (document.createRange && window.getSelection) {
            const range = document.createRange();

            range.selectNodeContents(el);

            const text_nodes = get_text_nodes_in(el);
            let found_start = false;
            let char_count = 0;
            let end_char_count;

            for (let i = 0, text_node: Node; (text_node = text_nodes[i++]); ) {
              end_char_count = char_count + text_node.textContent.trimStart().length;

              if (
                !found_start &&
                start >= char_count &&
                (start < end_char_count || (start === end_char_count && i === text_nodes.length))
              ) {
                range.setStart(text_node, start - char_count);
                found_start = true;
              }
              if (found_start && end <= end_char_count) {
                range.setEnd(text_node, end - char_count);
                break;
              }
              char_count = end_char_count;
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
        function is_text_node_and_content_no_empty(node: Node) {
          return node.textContent.trim().length > 0;
        }
      },
      { text_to_select },
    );
    const bounding_box = await this.custom_element.boundingBox();

    await this.context.mouse.move(bounding_box.x, bounding_box.y);
    await this.context.mouse.up();
  }

  /**
   *
   */
  async get_highlighted_text() {
    return (await this.custom_element.locator('[class*="highlighted"]').allInnerTexts()).join('');
  }

  /**
   *
   */
  async focus() {
    await this.custom_element.click();
  }
}
