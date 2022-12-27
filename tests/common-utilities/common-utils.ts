import waitUntil, {
  Options,
  Predicate,
  PredicateReturnValue,
  TimeoutError,
} from 'async-wait-until';
import faker from 'faker';
import path from 'path';
import crypto = require('crypto');

import { configuration } from '../config/configuration';

export default class CommonUtils {
  /**
   *
   */
  static uniqueIdentifier() {
    return crypto.randomUUID().substring(0, 6);
  }

  /**
   *
   * @param filepath
   */
  static extractFilenameFromPath(filepath: string) {
    const { name, ext } = path.parse(filepath);

    return `${name}${ext}`;
  }

  /**
   *
   * @param root0
   * @param root0.dimensions
   * @param root0.content
   * @param root0.templates
   */
  static generateDimensionalArrayWithData({
    dimensions,
  }: {
    dimensions: number;
    content?: string[];
    templates?: string[];
  }) {
    const arr = [];

    for (let i = 0; i < dimensions; i++) {
      arr[i] = new Array(dimensions).fill(faker.random.word());
    }

    arr.push([`id: ${CommonUtils.uniqueIdentifier()}`]);

    return arr;
  }

  /**
   *
   * @param cb
   * @param root0
   * @param root0.timeout
   * @param root0.intervalBetweenAttempts
   * @param root0.timeoutMessage
   */
  static async waitUntil<T extends Record<keyof T, unknown> | PredicateReturnValue>(
    cb: Predicate<T>,
    {
      timeout = configuration.timeout,
      intervalBetweenAttempts = 2000,
      timeoutMessage,
    }: Options & { timeoutMessage?: string } = {},
  ) {
    try {
      return await waitUntil(cb, {
        timeout,
        intervalBetweenAttempts,
      });
    } catch {
      throw new Error(
        timeoutMessage ? `${timeoutMessage}. Timeout: ${timeout}` : new TimeoutError().stack,
      );
    }
  }
}
