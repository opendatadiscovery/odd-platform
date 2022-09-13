import { Pages } from '../index';

import AddOwnerModal from './add-owner-modal';
import AddTagModal from "./add-tag-modal";
import EditTagModal from "./edit-tag-modal";
import DeleteTagModal from "./delete-tag-modal";
// inject-import-modal dont delete comment

export class Modals {
  constructor(
    private readonly pages: Pages,

    readonly add_owner = new AddOwnerModal(pages),
    readonly add_tag = new AddTagModal(pages),
    readonly edit_tag = new EditTagModal(pages),
    readonly delete_tag = new DeleteTagModal(pages)
  ) {}
}
