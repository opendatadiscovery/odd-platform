import { FileData } from '../../common-utilities/interfaces/shared';

import Button from './button';

export default class FileChooser extends Button {
  /**
   *
   * @param root0
   * @param root0.filepath
   */
  async uploadDocument({ filepath }: FileData) {
    const [fileChooser] = await Promise.all([
      this.context.waitForEvent('filechooser'),
      this.customElement.click(),
    ]);

    await fileChooser.setFiles(filepath);
  }
}
