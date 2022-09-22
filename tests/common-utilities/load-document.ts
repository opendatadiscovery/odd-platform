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
   */
  private static prepare_local_file_version(document_name: string, worker_id: string): FileData {
    const GENERATED_FILE_POSTFIX = uuidv4().substring(0, 6);
    const { name, ext, dir } = path.parse(document_name);
    let documents_path = ext === '.xlsx' ? './testData/excel/' : './testData/docs/';

    if (dir) {
      documents_path = documents_path.concat(dir + '/');
    }

    const source_file_name = name + ext;
    const destination_file_name = name + '_' + GENERATED_FILE_POSTFIX + worker_id + ext;
    const source_file_path = documents_path + source_file_name;
    const destination_file_path = this.root + destination_file_name;

    fs.copyFileSync(source_file_path, destination_file_path);

    return {
      filepath: path.resolve(destination_file_path),
      filename_with_extension: destination_file_name,
      filename_without_extension: path.parse(destination_file_name).name,
      extension: ext,
    };
  }

  /**
   *
   */
  static load(document_name: string, worker_id: string): FileData {
    return DocumentLoader.prepare_local_file_version(document_name, worker_id);
  }

  /**
   * Download a file from response and store in ./dist/
   */
  static save(response: AxiosResponse, filename_without_extension?: string): FileData {
    const document_name: string = this.get_file_name(
      response.headers['content-disposition'] as string,
    );
    const { name, ext, base } = path.parse(document_name);
    const filepath =
      this.root + (filename_without_extension || name + CommonUtils.unique_identifier()) + ext;

    writeFileSync(filepath, response.data as DataView);

    return {
      filepath: path.resolve(filepath),
      filename_with_extension: base,
      filename_without_extension: name,
      extension: ext,
    };
  }

  /**
   * Grabs the file name from 'content-disposition' header
   * @param disposition
   * @returns
   */
  private static get_file_name(disposition: string): string {
    const utf8_filename_regex = /filename\*=UTF-8''([\w%\-.]+)(?:; ?|$)/gi;
    const ascii_filename_regex = /^filename=(["']?)(.*?[^\\])\1(["']?)(?:; ?|$)/gi;

    // @ts-ignore
    let filename: string = null;

    if (utf8_filename_regex.test(disposition)) {
      // @ts-ignore
      filename = decodeURIComponent(utf8_filename_regex.exec(disposition)[1]);
    } else {
      const filename_start = disposition.toLowerCase().indexOf('filename=');

      if (filename_start >= 0) {
        const partial_disposition = disposition.slice(filename_start);
        const matches = ascii_filename_regex.exec(partial_disposition);

        if (matches != null && matches[2]) {
          filename = matches[2];
        }
      }
    }

    return filename;
  }
}
