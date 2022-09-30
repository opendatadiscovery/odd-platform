import Button from '../../elements/button';
import List from '../../elements/list';
import DeleteTagModal from '../modals/delete-tag-modal';
import ManagementPage from './management-page';

const SELECTORS = {
  create_tag: `button:has-text("Create Tag")`,
  tag_line_root: '.infinite-scroll-component',
  tag_line_item: 'p[title]',
  tag_line_item_name: '.MuiTypography-body1.MuiTypography-noWrap',
  tag_string: tag_name => `div .infinite-scroll-component > div:has-text("${tag_name}")`,
  tag_important_mark: 'p.MuiTypography-root.MuiTypography-body1.css-1q3quq',
};
export default class TagsPage extends ManagementPage {
  deleteTagModal = new DeleteTagModal(this.pages);

  get create_tag() {
    return new Button(this.page, SELECTORS.create_tag);
  }

  get tags_list() {
    return new List(this.page, SELECTORS.tag_line_root, SELECTORS.tag_line_item);
  }

  async get_all_tags() {
    const all_tags = [];
    const tag_line_count = await this.page.locator(SELECTORS.tag_line_item_name).count();
    for (let i = 0; i < tag_line_count; i++) {
      const tag_name = await this.page.locator(SELECTORS.tag_line_item_name).nth(i).innerText();
      all_tags.push(tag_name);
    }
    return all_tags;
  }

  async is_tag_visible(name: string) {
    return this.page.locator(SELECTORS.tag_string(name)).isVisible();
  }

  async is_tag_invisible(name: string) {
    return this.page.locator(SELECTORS.tag_string(name)).isHidden();
  }

  async add_tag(name: string) {
    await this.create_tag.click();
    await this.pages.modals.add_tag.tag_name_field.fill(name);
    await this.pages.modals.add_tag.add_new_tag.click();
  }

  async add_important_tag(name: string) {
    await this.create_tag.click();
    await this.pages.modals.add_tag.tag_name_field.fill(name);
    await this.pages.modals.add_tag.check_important(0);
    await this.pages.modals.add_tag.add_new_tag.click();
  }

  async edit_tag(name: string) {
    await this.page
      .locator(SELECTORS.tag_string(name))
      .locator('button', { hasText: 'Edit' })
      .click();
  }

  async open_delete_modal(name: string) {
    await this.page
      .locator(SELECTORS.tag_string(name))
      .locator('button', { hasText: 'Delete' })
      .click();
  }

  async is_tag_important(name: string) {
    return this.page
      .locator(SELECTORS.tag_string(name))
      .locator(SELECTORS.tag_important_mark, { hasText: 'important' })
      .isVisible();
  }

  async wait_until_tag_invisible(tag_name: string | Array<string>) {
    if (typeof tag_name === 'string') {
      await this.page.waitForSelector(SELECTORS.tag_string(tag_name), { state: 'hidden' });
    } else {
      const tags = Array.from(tag_name);
      for (const tag of tags) {
        await this.page.waitForSelector(SELECTORS.tag_string(tag), { state: 'hidden' });
      }
    }
  }

  async wait_until_tag_visible(tag_name: string | Array<string>) {
    if (typeof tag_name === 'string') {
      await this.page.waitForSelector(SELECTORS.tag_string(tag_name), { state: 'visible' });
    } else {
      const tags = Array.from(tag_name);
      for (const tag of tags) {
        await this.page.waitForSelector(SELECTORS.tag_string(tag), { state: 'visible' });
      }
    }
  }
}
