import { AxiosResponse } from 'axios';
import fs, { writeFileSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import CommonUtils from './common-utils';
import { FileData } from './interfaces/shared';

export default class DocumentLoader {
  static readonly root: string = './dist/';

  /**
   *
   * @param documentName
   * @param workerId
   */
  private static prepareLocalFileVersion(documentName: string, workerId: string): FileData {
    const GENERATED_FILE_POSTFIX = uuidv4().substring(0, 6);
    const { name, ext, dir } = path.parse(documentName);
    let documentsPath = ext === '.xlsx' ? './testData/excel/' : './testData/docs/';

    if (dir) {
      documentsPath = documentsPath.concat(`${dir}/`);
    }

    const sourceFileName = name + ext;
    const destinationFileName = `${name}_${GENERATED_FILE_POSTFIX}${workerId}${ext}`;
    const sourceFilePath = documentsPath + sourceFileName;
    const destinationFilePath = this.root + destinationFileName;

    fs.copyFileSync(sourceFilePath, destinationFilePath);

    return {
      filepath: path.resolve(destinationFilePath),
      filenameWithExtension: destinationFileName,
      filenameWithoutExtension: path.parse(destinationFileName).name,
      extension: ext,
    };
  }

  /**
   *
   * @param documentName
   * @param workerId
   */
  static load(documentName: string, workerId: string): FileData {
    return DocumentLoader.prepareLocalFileVersion(documentName, workerId);
  }

  /**
   * Download a file from response and store in ./dist/
   *
   * @param response
   * @param filenameWithoutExtension
   */
  static save(response: AxiosResponse, filenameWithoutExtension?: string): FileData {
    const documentName: string = this.getFileName(
      response.headers['content-disposition'] as string,
    );
    const { name, ext, base } = path.parse(documentName);
    const filepath =
      this.root + (filenameWithoutExtension || name + CommonUtils.uniqueIdentifier()) + ext;

    writeFileSync(filepath, response.data as DataView);

    return {
      filepath: path.resolve(filepath),
      filenameWithExtension: base,
      filenameWithoutExtension: name,
      extension: ext,
    };
  }

  /**
   * Grabs the file name from 'content-disposition' header
   *
   * @param disposition
   * @returns
   */
  private static getFileName(disposition: string): string {
    const utf8FilenameRegex = /filename\*=UTF-8''([\w%\-.]+)(?:; ?|$)/gi;
    const asciiFilenameRegex = /^filename=(["']?)(.*?[^\\])\1(["']?)(?:; ?|$)/gi;

    let filename: string = null;

    if (utf8FilenameRegex.test(disposition)) {
      filename = decodeURIComponent(utf8FilenameRegex.exec(disposition)[1]);
    } else {
      const filenameStart = disposition.toLowerCase().indexOf('filename=');

      if (filenameStart >= 0) {
        const partialDisposition = disposition.slice(filenameStart);
        const matches = asciiFilenameRegex.exec(partialDisposition);

        if (matches != null && matches[2]) {
          filename = matches[2];
        }
      }
    }

    return filename;
  }
}
