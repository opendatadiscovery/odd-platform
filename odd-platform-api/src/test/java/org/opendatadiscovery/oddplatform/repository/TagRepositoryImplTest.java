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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

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

        assertNotNull(expectedTagPojo);
        assertNotNull(expectedTagPojo.getName());
    }

    /**
     * Test case: Bulk creation of tags
     * Expected result: 1. All saved tags have ids 2. Saved tags have same names as Input bunch of tags
     */
    @Test
    @DisplayName("Bulk creation of tag pojos, expecting all tags created successfully ")
    void testBulkCreateTag() {
        final int numberOfTestTags = 3;
        final List<TagPojo> testTagPojoList = createTestTagList(numberOfTestTags);
        final List<String> testTagPojoNames = testTagPojoList.stream().map(TagPojo::getName).toList();

        final List<TagPojo> actualTagPojos = tagRepository.bulkCreate(testTagPojoList);

        final List<String> actualTagPojoNames = actualTagPojos.stream().map(TagPojo::getName).toList();
        assertFalse(actualTagPojos.isEmpty());
        for (final TagPojo tagPojo : actualTagPojos) {
            assertNotNull(tagPojo.getId());
        }
        assertTrue(testTagPojoNames.containsAll(actualTagPojoNames));
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
        final List<TagPojo> testTagPojoList = createTestTagList(numberOfTestTags);
        final List<TagPojo> expectedTagPojos = tagRepository.bulkCreate(testTagPojoList);
        final List<String> tagPojoNames = expectedTagPojos.stream().map(TagPojo::getName).toList();

        final List<TagPojo> actualTagPojos = tagRepository.listByNames(tagPojoNames);
        final List<String> actualTagPojosNames = actualTagPojos.stream().map(TagPojo::getName).toList();

        assertFalse(actualTagPojos.isEmpty());
        assertTrue(tagPojoNames.containsAll(actualTagPojosNames));
    }

    @Test
    @DisplayName("Creates tags relations with data entity, expecting all tags are connected to data entity")
    void testCreateRelations() {
        final int numberOfTestTags = 3;
        final List<TagPojo> testTagPojoList = createTestTagList(numberOfTestTags);
        final List<TagPojo> savedTagPojos = tagRepository.bulkCreate(testTagPojoList);
        final List<Long> savedTagPojoIds = savedTagPojos.stream().map(TagPojo::getId).toList();
        final List<DataEntityPojo> dataEntityPojos = dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()));
        final Long dataEntityId = dataEntityPojos.get(0).getId();

        tagRepository.createRelations(dataEntityId, savedTagPojoIds);

        final List<TagPojo> actualTagPojos = tagRepository.listByDataEntityId(dataEntityId);
        assertNotNull(actualTagPojos);
        assertFalse(actualTagPojos.isEmpty());
        assertEquals(numberOfTestTags, actualTagPojos.size());
    }

    @Test
    @DisplayName("Creates tags relations where list of tags is empty, expecting no relations are created")
    void testCreateRelationsIsEmpty() {
        final List<DataEntityPojo> dataEntityPojos = dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()));
        final Long dataEntityId = dataEntityPojos.get(0).getId();

        tagRepository.createRelations(dataEntityId, List.of());

        final List<TagPojo> actualTagPojos = tagRepository.listByDataEntityId(dataEntityId);
        assertNotNull(actualTagPojos);
        assertTrue(actualTagPojos.isEmpty());
    }

    @Test
    @DisplayName("Deletes tags relations with data entity, expecting relations are deleted")
    void testDeleteRelations() {
        final int numberOfTestTags = 3;
        final List<TagPojo> testTagPojoList = createTestTagList(numberOfTestTags);

        final List<TagPojo> savedTagPojos = tagRepository.bulkCreate(testTagPojoList);
        final List<Long> savedTagPojoIds = savedTagPojos.stream().map(TagPojo::getId).toList();
        final List<DataEntityPojo> dataEntityPojos = dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()));
        final Long dataEntityId = dataEntityPojos.get(0).getId();

        tagRepository.createRelations(dataEntityId, savedTagPojoIds);

        //check if relations are created
        final List<TagPojo> actualTagPojos = tagRepository.listByDataEntityId(dataEntityId);
        assertNotNull(actualTagPojos);
        assertFalse(actualTagPojos.isEmpty());
        assertEquals(numberOfTestTags, actualTagPojos.size());

        tagRepository.deleteRelations(dataEntityId, savedTagPojoIds);

        final List<TagPojo> actualTagPojosAfterDeletion = tagRepository.listByDataEntityId(dataEntityId);
        assertNotNull(actualTagPojos);
        assertTrue(actualTagPojosAfterDeletion.isEmpty());
    }

    @Test
    @DisplayName("Deletes tags relations where list of tags is empty, expecting no relations are deleted")
    void testDeleteRelationsIsEmpty() {
        final int numberOfTestTags = 3;
        final List<TagPojo> testTagPojoList = createTestTagList(numberOfTestTags);

        final List<TagPojo> savedTagPojos = tagRepository.bulkCreate(testTagPojoList);
        final List<Long> savedTagPojoIds = savedTagPojos.stream().map(TagPojo::getId).toList();
        final List<DataEntityPojo> dataEntityPojos = dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()));
        final Long dataEntityId = dataEntityPojos.get(0).getId();

        tagRepository.createRelations(dataEntityId, savedTagPojoIds);

        //check if relations are created
        final List<TagPojo> actualTagPojos = tagRepository.listByDataEntityId(dataEntityId);
        assertNotNull(actualTagPojos);
        assertFalse(actualTagPojos.isEmpty());
        assertEquals(numberOfTestTags, actualTagPojos.size());

        tagRepository.deleteRelations(dataEntityId, List.of());

        final List<TagPojo> actualTagPojosAfterDeletion = tagRepository.listByDataEntityId(dataEntityId);
        assertNotNull(actualTagPojos);
        assertFalse(actualTagPojosAfterDeletion.isEmpty());
        assertEquals(numberOfTestTags, actualTagPojos.size());
    }

    @Test
    @DisplayName("Updates tag, expecting tag is updated successfully")
    void testUpdateTag() {
        final TagPojo tag = new TagPojo()
            .setName(UUID.randomUUID().toString())
            .setImportant(true);
        final String initialName = tag.getName();

        final TagPojo createdTag = tagRepository.create(tag);
        assertNotNull(createdTag.getId());
        assertEquals(initialName, createdTag.getName());

        createdTag.setName(UUID.randomUUID().toString());
        final String newName = createdTag.getName();

        final TagPojo actualTag = tagRepository.update(createdTag);
        assertEquals(newName, actualTag.getName());
    }

    @Test
    @DisplayName("Gets list of most popular tags")
    void testListMostPopular() {
        final int numberOfTestTags = 8;
        final int numberOfPopularTags = 4;
        final String testName = "PopularName";
        final List<Long> expectedPopularTagIds = new ArrayList<>();
        final List<TagPojo> testTagPojoList = createTestTagList(numberOfTestTags);

        final List<TagPojo> createdTagPojos = tagRepository.bulkCreate(testTagPojoList);
        for (int i = 0; i < numberOfPopularTags; i++) {
            final TagPojo currentTagPojo = createdTagPojos.get(i);
            currentTagPojo.setName(testName + i);
            expectedPopularTagIds.add(currentTagPojo.getId());
        }
        tagRepository.bulkUpdate(createdTagPojos);

        final Page<TagDto> listMostPopular = tagRepository.listMostPopular(testName, 1, numberOfTestTags);

        assertEquals(numberOfPopularTags, listMostPopular.getTotal());
        final List<Long> actualPopularTagIds =
            listMostPopular.getData().stream().map(TagDto::getTagPojo).map(TagPojo::getId).toList();
        assertTrue(actualPopularTagIds.containsAll(expectedPopularTagIds));
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
