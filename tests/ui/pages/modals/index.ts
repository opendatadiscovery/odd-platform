import { Pages } from '../index';

import AddOwnerModal from './add-owner-modal';
// inject-import-modal dont delete comment

export class Modals {
  constructor(
    private readonly pages: Pages,

    readonly add_owner = new AddOwnerModal(pages),
  ) {}
}
