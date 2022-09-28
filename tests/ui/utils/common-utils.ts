import { Options, Predicate, PredicateReturnValue } from 'async-wait-until';

import CommonUtils from '../../common-utilities/common-utils';
import { configuration } from '../../config/configuration';

export default class UiCommonUtils {
  /**
   *
   * @param cb
   * @param options
   */
  static async wait_until<T extends Record<keyof T, unknown> | PredicateReturnValue>(
    cb: Predicate<T>,
    options: Options = { timeout: configuration.timeout, intervalBetweenAttempts: 15000 },
  ) {
    return CommonUtils.wait_until(cb, options);
  }
}
