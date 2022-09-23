import { FileData } from '../../common-utilities/interfaces/shared';

import Button from './button';

export default class FileChooser extends Button {
  /**
   *
   * @param root0
   * @param root0.filepath
   */
  async upload_document({ filepath }: FileData) {
    const [file_chooser] = await Promise.all([
      this.context.waitForEvent('filechooser'),
      this.custom_element.click(),
    ]);

    await file_chooser.setFiles(filepath);
  }
}
