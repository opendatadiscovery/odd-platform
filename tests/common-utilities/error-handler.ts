import { errors } from '@playwright/test';

export default class ErrorHandler {
  private readonly err;

  constructor(err: string | errors.TimeoutError | undefined) {
    if (err instanceof errors.TimeoutError) {
      this.err = err;
    } else {
      console.log(`Unknown error type has been provided\n${err}`);
    }
  }

  /**
   * Prints the error
   */
  printError() {
    if (this.err.message.includes('networkidle')) {
      console.log(
        `${this.err}\n"networkidle" - consider operation to be finished when there are no network connections for at least 500 ms.`,
      );
    }
  }
}
