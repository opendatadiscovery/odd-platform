import { Pages } from '../index';

import AddOwnerModal from './add-owner-modal';
import AddTagModal from './add-tag-modal';
import DeleteTagModal from './delete-tag-modal';
import EditTagModal from './edit-tag-modal';
// inject-import-modal dont delete comment

export class Modals {
  constructor(
    private readonly pages: Pages,

    readonly addOwner = new AddOwnerModal(pages),
    readonly addTag = new AddTagModal(pages),
    readonly editTag = new EditTagModal(pages),
    readonly deleteTag = new DeleteTagModal(pages),
  ) {}
}
