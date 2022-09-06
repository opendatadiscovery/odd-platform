/* eslint-disable @typescript-eslint/naming-convention */
import waitUntil, {
  Options,
  Predicate,
  PredicateReturnValue,
  TimeoutError,
} from 'async-wait-until';
import faker from 'faker';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { configuration } from '../config/configuration';

export default class CommonUtils {
  /**
   *
   */
  static unique_identifier() {
    return uuidv4().substring(0, 6);
  }

  /**
   *
   */
  static extract_filename_from_path(filepath: string) {
    const { name, ext } = path.parse(filepath);

    return `${name}${ext}`;
  }

  /**
   *
   */
  static generate_dimensional_array_with_data({
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

    arr.push([`id: ${CommonUtils.unique_identifier()}`]);

    return arr;
  }

  /**
   *
   */
  static async wait_until<T extends Record<keyof T, unknown> | PredicateReturnValue>(
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
