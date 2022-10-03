/**
 * Entry point for common api checks
 */

import { AxiosResponse } from 'axios';
import { expect } from 'chai';

export const DO_NOT_CHECK_STATUS = -1;

export const isStatusOk = (response: AxiosResponse, status = 200): void => {
  if (status === DO_NOT_CHECK_STATUS) return;

  const statusMsg = `Received status is [${response.status}] but EXPECTED status is ${status}.\n`;
  const requestMsg = `Request:\n ${response.request.path} Method: ${response.request.method}\n`;

  let resp = JSON.stringify(response.data, null, 2);

  if (resp.length > 1000)
    resp = `${resp.substring(0, 100)} \n[Long response(${
      resp.length
    }). First 100 characters shown]`;

  const responseMsg = `Response:\n ${resp}\n`;

  expect(response.status).to.equal(status, statusMsg + requestMsg + responseMsg);
};
