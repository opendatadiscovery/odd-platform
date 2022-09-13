import ManagementPage from './management-page';
import Button from "../../elements/button";
import List from "../../elements/list";
import DeleteTagModal from "../modals/delete-tag-modal";

const SELECTORS = {
    create_tag: `button:has-text("Create Tag")`,
    tag_line_root: 'div[class*="MuiGrid-root MuiGrid-container css-1d3bbye"]',
    tag_line_item: 'div[class*="MuiGrid-root MuiGrid-container sc-jOhDuK kJYgmA css-1d3bbye"]',
    tag_line_item_name: '.MuiTypography-root.MuiTypography-body1.MuiTypography-noWrap.css-i5qci1',
    tag_string: 'div.infinite-scroll-component > div',
    tag_important_mark: '.MuiTypography-root.MuiTypography-body1.css-1q3quq',
    tag_edit: `div.infinite-scroll-component > div:last-child button:has-text("Edit")`,
    tag_delete: `div.infinite-scroll-component > div:last-child button:has-text("Delete")`

};

export default class TagsPage extends ManagementPage {

    deleteTagModal = new DeleteTagModal(this.pages)

    get create_tag() {
        return new Button(this.page, SELECTORS.create_tag);
    }

    get tags_list() {
        return new List(this.page, SELECTORS.tag_line_root, SELECTORS.tag_line_item);
    }

    async get_all_tags(){
        let all_tags = []
        const tag_line_count = await this.page.locator(SELECTORS.tag_line_item_name).count();
        for (let i=0; i < tag_line_count; i++) {
            const tag_name = await this.page.locator(SELECTORS.tag_line_item_name).nth(i).innerText();
            all_tags.push(tag_name);
        }
        return all_tags;
    }

    async isContain(array1, array2) {
        array2.every((element) => array1.includes(element));
    }

    get tag_is_important() {
        return new List(this.page, SELECTORS.tag_line_item, SELECTORS.tag_important_mark)
    }

    async is_tag_visible(name: string) {
        return await this.page.locator(SELECTORS.tag_string, {hasText: name}).isVisible();

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
        await this.page.locator(SELECTORS.tag_string, {hasText: name}).locator('button', {hasText: 'Edit'}).click();
    }

    async open_delete_modal(name: string) {
        await this.page.locator(SELECTORS.tag_string, {hasText: name}).locator('button', {hasText: 'Delete'}).click();
    }

    async is_tag_important(name: string){
        return await this.page.locator(SELECTORS.tag_string, {hasText: name}).locator(SELECTORS.tag_important_mark, {hasText: 'important'}).isVisible();
    }

    async delete_tag(name: string | Array<string> ) {
        if (typeof name === 'string') {
            await this.open_delete_modal(name);
            await this.deleteTagModal.delete_tag_confirm;
        }

    }

}
