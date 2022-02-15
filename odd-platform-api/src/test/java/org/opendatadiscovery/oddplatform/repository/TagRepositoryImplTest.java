package org.opendatadiscovery.oddplatform.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.TagDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Integration tests for TagRepository")
class TagRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private TagRepository tagRepository;
    @Autowired
    private DataEntityRepository dataEntityRepository;

    @Test
    @DisplayName("Creates tag pojo, expecting tag pojo in db")
    void testCreateTagPojo() {
        final TagPojo tag = new TagPojo()
            .setName(UUID.randomUUID().toString())
            .setImportant(true);

        final TagPojo expectedTagPojo = tagRepository.create(tag);

        assertThat(expectedTagPojo).isNotNull();
        assertThat(expectedTagPojo.getImportant())
            .isEqualTo(tag.getImportant());
        assertThat(expectedTagPojo.getName()).isNotNull()
            .isEqualTo(tag.getName());
    }

    /**
     * Test case: Bulk creation of tags
     * Expected result: 1. All saved tags have ids 2. Saved tags have same names as Input bunch of tags
     */
    @Test
    @DisplayName("Bulk creation of tag pojos, expecting all tags created successfully ")
    void testBulkCreateTag() {
        final int numberOfTestTags = 3;
        final List<TagPojo> testTagsList = createTestTagList(numberOfTestTags);
        final List<String> testTagsListNames = testTagsList.stream().map(TagPojo::getName).toList();

        final List<TagPojo> actualTagsList = tagRepository.bulkCreate(testTagsList);

        assertThat(actualTagsList).isNotEmpty()
            .extracting(TagPojo::getId).doesNotContainNull();
        assertThat(actualTagsList)
            .extracting(TagPojo::getName)
            .containsAll(testTagsListNames);
    }

    /**
     * Test case: Retrieves all required tags by name
     * Expected result:
     * 1.Retrieved list of tags is not empty
     * 2. All retrieved tags have same names as input list of tags
     */
    @Test
    @DisplayName("Retrieves several tags by names")
    void testGetTagsByListNames() {
        final int numberOfTestTags = 3;
        final List<TagPojo> testTagsList = createTestTagList(numberOfTestTags);
        final List<TagPojo> expectedTagsList = tagRepository.bulkCreate(testTagsList);
        final List<String> expectedTagsListNames = expectedTagsList.stream().map(TagPojo::getName).toList();

        final List<TagPojo> actualTagsList = tagRepository.listByNames(expectedTagsListNames);

        assertThat(actualTagsList).isNotEmpty()
            .extracting(TagPojo::getName).containsAll(expectedTagsListNames);
    }

    @Test
    @DisplayName("Creates tags relations with data entity, expecting all tags are connected to data entity")
    void testCreateRelations() {
        final int numberOfTestTags = 3;
        final List<TagPojo> testTagsList = createTestTagList(numberOfTestTags);
        final List<TagPojo> savedTagsList = tagRepository.bulkCreate(testTagsList);
        final List<Long> savedTagsListIds = savedTagsList.stream().map(TagPojo::getId).toList();
        final List<DataEntityPojo> testDataEntityList = dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()));
        final Long dataEntityId = testDataEntityList.get(0).getId();

        tagRepository.createRelations(dataEntityId, savedTagsListIds);

        final List<TagPojo> actualTagsList = tagRepository.listByDataEntityId(dataEntityId);
        assertThat(actualTagsList).isNotEmpty()
            .hasSize(numberOfTestTags);
    }

    @Test
    @DisplayName("Creates tags relations with data entity, expecting some of  tags are connected to data entity")
    void testCreateRelations_SomeTags() {
        final int numberOfTestTags = 4;
        final int tagsNotInDE = 2;
        final List<TagPojo> testTagsList = createTestTagList(numberOfTestTags);
        final List<TagPojo> savedTagsList = tagRepository.bulkCreate(testTagsList);
        final List<Long> savedTagsListIds = savedTagsList.stream().map(TagPojo::getId).toList();
        final List<DataEntityPojo> testDataEntityList = dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()));
        final Long dataEntityId = testDataEntityList.get(0).getId();

        tagRepository.createRelations(dataEntityId, savedTagsListIds.subList(
            numberOfTestTags - tagsNotInDE, savedTagsListIds.size()));

        final List<TagPojo> actualTagsList = tagRepository.listByDataEntityId(dataEntityId);
        assertThat(actualTagsList).isNotEmpty()
            .hasSize(numberOfTestTags - tagsNotInDE);
    }

    @Test
    @DisplayName("Creates tags relations where list of tags is empty, expecting no relations are created")
    void testCreateRelationsIsEmpty() {
        final List<DataEntityPojo> testDataEntityList = dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()));
        final Long dataEntityId = testDataEntityList.get(0).getId();

        tagRepository.createRelations(dataEntityId, List.of());

        final List<TagPojo> actualTagsList = tagRepository.listByDataEntityId(dataEntityId);
        assertThat(actualTagsList).isEmpty();
    }

    @Test
    @DisplayName("Deletes tags relations with data entity, expecting relations are deleted")
    void testDeleteRelations() {
        final int numberOfTestTags = 3;
        final List<TagPojo> testTagsList = createTestTagList(numberOfTestTags);
        final List<TagPojo> savedTagsList = tagRepository.bulkCreate(testTagsList);
        final List<Long> savedTagsListIds = savedTagsList.stream().map(TagPojo::getId).toList();
        final List<DataEntityPojo> testDataEntityList = dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()));
        final Long dataEntityId = testDataEntityList.get(0).getId();

        tagRepository.createRelations(dataEntityId, savedTagsListIds);

        //check if relations are created
        final List<TagPojo> actualTagsList = tagRepository.listByDataEntityId(dataEntityId);
        assertThat(actualTagsList).isNotEmpty()
            .hasSize(numberOfTestTags);

        tagRepository.deleteRelations(dataEntityId, savedTagsListIds);

        final List<TagPojo> actualTagsListAfterDeletion = tagRepository.listByDataEntityId(dataEntityId);
        assertThat(actualTagsListAfterDeletion).isEmpty();
    }

    @Test
    @DisplayName("Deletes tags relations where list of tags is empty, expecting no relations are deleted")
    void testDeleteRelationsIsEmpty() {
        final int numberOfTestTags = 3;
        final List<TagPojo> testTagsList = createTestTagList(numberOfTestTags);
        final List<TagPojo> savedTagsList = tagRepository.bulkCreate(testTagsList);
        final List<Long> savedTagsListIds = savedTagsList.stream().map(TagPojo::getId).toList();
        final List<DataEntityPojo> testDataEntityList = dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()));
        final Long dataEntityId = testDataEntityList.get(0).getId();

        tagRepository.createRelations(dataEntityId, savedTagsListIds);

        //check if relations are created
        final List<TagPojo> actualTagsList = tagRepository.listByDataEntityId(dataEntityId);
        assertThat(actualTagsList).isNotEmpty()
            .hasSize(numberOfTestTags);

        tagRepository.deleteRelations(dataEntityId, List.of());

        final List<TagPojo> actualTagsListAfterDeletion = tagRepository.listByDataEntityId(dataEntityId);
        assertThat(actualTagsListAfterDeletion).isNotEmpty()
            .hasSize(numberOfTestTags);
    }

    @Test
    @DisplayName("Updates tag, expecting tag is updated successfully")
    void testUpdateTag() {
        final TagPojo tag = new TagPojo()
            .setName(UUID.randomUUID().toString())
            .setImportant(true);
        final String initialName = tag.getName();

        final TagPojo createdTag = tagRepository.create(tag);
        assertThat(createdTag).isNotNull();
        assertThat(createdTag.getName()).isNotNull()
            .isEqualTo(initialName);

        createdTag.setName(UUID.randomUUID().toString());
        final String newName = createdTag.getName();

        final TagPojo actualTag = tagRepository.update(createdTag);
        assertThat(actualTag.getName()).isNotNull()
            .isEqualTo(newName);
    }

    @Test
    @DisplayName("Gets list of most popular tags")
    void testListMostPopular() {
        final int numberOfTestTags = 8;
        final int numberOfPopularTags = 4;
        final String testName = "PopularName";
        final List<Long> expectedPopularTagIds = new ArrayList<>();
        final List<TagPojo> testTagsList = createTestTagList(numberOfTestTags);

        final List<TagPojo> createdTagsList = tagRepository.bulkCreate(testTagsList);
        for (int i = 0; i < numberOfPopularTags; i++) {
            final TagPojo currentTag = createdTagsList.get(i);
            currentTag.setName(testName + i);
            expectedPopularTagIds.add(currentTag.getId());
        }
        tagRepository.bulkUpdate(createdTagsList);

        final Page<TagDto> listMostPopular = tagRepository.listMostPopular(testName, 1, numberOfTestTags);

        assertThat(listMostPopular.getTotal()).isEqualTo(numberOfPopularTags);
        assertThat(listMostPopular.getData())
            .extracting(TagDto::getTagPojo).extracting(TagPojo::getId)
            .containsAll(expectedPopularTagIds);
    }

    /**
     * Method for the test purpose. Creates list of exact number of {@link TagPojo}
     *
     * @param numberOfTestTags - number of tags inside the list
     * @return - List of {@link TagPojo}
     */
    @NotNull
    private List<TagPojo> createTestTagList(final int numberOfTestTags) {
        final List<TagPojo> testTagPojo = new ArrayList<>();
        for (int i = 0; i < numberOfTestTags; i++) {
            testTagPojo.add(new TagPojo()
                .setName(UUID.randomUUID().toString())
                .setImportant(true));
        }
        return testTagPojo;
    }
}
