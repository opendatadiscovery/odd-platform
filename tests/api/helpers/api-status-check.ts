/**
 * Copyright (c) 2021 Evisort.
 * Entry point for common api checks
 */

import { AxiosResponse } from 'axios';
import { expect } from 'chai';

export const DO_NOT_CHECK_STATUS = -1;

export const status_is_ok = (response: AxiosResponse, status = 200): void => {
  if (status === DO_NOT_CHECK_STATUS) return;

  const status_msg = `Received status is [${response.status}] but EXPECTED status is ${status}.\n`;
  const request_msg = `Request:\n ${response.request.path} Method: ${response.request.method}\n`;

  let resp = JSON.stringify(response.data, null, 2);

  if (resp.length > 1000)
    resp = `${resp.substring(0, 100)} \n[Long response(${
      resp.length
    }). First 100 characters shown]`;

  const response_msg = `Response:\n ${resp}\n`;

  expect(response.status).to.equal(status, status_msg + request_msg + response_msg);
};
