package org.opendatadiscovery.oddplatform.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.TagDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagToDataEntityPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Integration tests for TagRepository")
class TagRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private ReactiveTagRepository reactiveTagRepository;
    @Autowired
    private ReactiveDataEntityRepository dataEntityRepository;

    @Test
    @DisplayName("Creates tag pojo, expecting tag pojo in db")
    void testCreateTagPojo() {
        final TagPojo tag = new TagPojo()
            .setName(UUID.randomUUID().toString())
            .setImportant(true);

        reactiveTagRepository.create(tag)
            .as(StepVerifier::create)
            .assertNext(expectedTagPojo -> {
                assertThat(expectedTagPojo).isNotNull();
                assertThat(expectedTagPojo.getImportant())
                    .isEqualTo(tag.getImportant());
                assertThat(expectedTagPojo.getName()).isNotNull()
                    .isEqualTo(tag.getName());
            }).verifyComplete();
    }

    /**
     * Test case: Bulk creation of tags
     * Expected result: 1. All saved tags have ids 2. Saved tags have same names as input bunch of tags
     */
    @Test
    @DisplayName("Bulk creation of tag pojos, expecting all tags created successfully ")
    void testBulkCreateTag() {
        final int numberOfTestTags = 3;
        final List<TagPojo> testTagsList = createTestTagList(numberOfTestTags);
        final List<String> testTagsListNames = testTagsList.stream().map(TagPojo::getName).toList();

        reactiveTagRepository.bulkCreate(testTagsList)
            .collectList()
            .as(StepVerifier::create)
            .assertNext(actualTagsList -> {
                assertThat(actualTagsList).isNotEmpty()
                    .extracting(TagPojo::getId).doesNotContainNull();
                assertThat(actualTagsList)
                    .extracting(TagPojo::getName)
                    .containsAll(testTagsListNames);
            }).verifyComplete();
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
        final List<TagPojo> expectedTagsList = reactiveTagRepository.bulkCreate(testTagsList)
            .collectList()
            .blockOptional()
            .orElseThrow();
        final List<String> expectedTagsListNames = expectedTagsList.stream().map(TagPojo::getName).toList();

        reactiveTagRepository.listByNames(expectedTagsListNames)
            .collectList()
            .as(StepVerifier::create)
            .assertNext(actualTagsList -> {
                assertThat(actualTagsList).isNotEmpty()
                    .extracting(TagPojo::getName)
                    .containsExactlyInAnyOrder(expectedTagsListNames.toArray(String[]::new));
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("Creates tags relations with data entity, expecting all tags are connected to data entity")
    void testCreateRelationsWithDataEntity() {
        final int numberOfTestTags = 3;
        final List<TagPojo> testTagsList = createTestTagList(numberOfTestTags);
        final List<TagPojo> savedTagsList = reactiveTagRepository.bulkCreate(testTagsList)
            .collectList()
            .blockOptional()
            .orElseThrow();
        final List<DataEntityPojo> testDataEntityList = dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()))
            .collectList()
            .block();
        final Long dataEntityId = testDataEntityList.get(0).getId();
        final List<TagToDataEntityPojo> pojos = savedTagsList.stream()
            .map(tag -> new TagToDataEntityPojo().setTagId(tag.getId()).setDataEntityId(dataEntityId))
            .toList();

        reactiveTagRepository.createDataEntityRelations(pojos)
            .collectList()
            .as(StepVerifier::create)
            .assertNext(relations -> assertThat(relations).isNotEmpty()
                .hasSize(numberOfTestTags)
                .extracting(TagToDataEntityPojo::getTagId)
                .containsExactlyInAnyOrder(savedTagsList.stream().map(TagPojo::getId).toArray(Long[]::new)))
            .verifyComplete();
    }

    @Test
    @DisplayName("Creates tags relations with data entity, expecting some of tags are connected to data entity")
    void testCreateRelations_SomeTags() {
        final int numberOfTestTags = 4;
        final int tagsNotInDE = 2;
        final List<TagPojo> testTagsList = createTestTagList(numberOfTestTags);
        final List<TagPojo> savedTagsList = reactiveTagRepository.bulkCreate(testTagsList)
            .collectList()
            .blockOptional()
            .orElseThrow();
        final List<DataEntityPojo> testDataEntityList = dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()))
            .collectList()
            .block();
        final List<TagToDataEntityPojo> pojos =
            savedTagsList.subList(numberOfTestTags - tagsNotInDE, savedTagsList.size()).stream()
                .map(tag -> new TagToDataEntityPojo()
                    .setTagId(tag.getId())
                    .setDataEntityId(testDataEntityList.get(0).getId()))
                .toList();
        reactiveTagRepository.createDataEntityRelations(pojos)
            .collectList()
            .as(StepVerifier::create)
            .assertNext(relations -> assertThat(relations).isNotEmpty().hasSize(numberOfTestTags - tagsNotInDE))
            .verifyComplete();
    }

    @Test
    @DisplayName("Creates tags relations where list of tags is empty, expecting no relations are created")
    void testCreateRelationsIsEmpty() {
        final List<DataEntityPojo> testDataEntityList = dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()))
            .collectList()
            .block();

        reactiveTagRepository.createDataEntityRelations(List.of())
            .as(StepVerifier::create)
            .verifyComplete();
    }

    @Test
    @DisplayName("Deletes tags relations with data entity, expecting relations are deleted")
    void testDeleteRelations() {
        final int numberOfTestTags = 3;
        final List<TagPojo> testTagsList = createTestTagList(numberOfTestTags);
        final List<TagPojo> savedTagsList = reactiveTagRepository.bulkCreate(testTagsList)
            .collectList()
            .blockOptional()
            .orElseThrow();
        final List<DataEntityPojo> testDataEntityList = dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()))
            .collectList()
            .block();
        final List<TagToDataEntityPojo> savedTagsPojos = savedTagsList.stream()
            .map(tag -> new TagToDataEntityPojo()
                .setTagId(tag.getId())
                .setDataEntityId(testDataEntityList.get(0).getId()))
            .toList();

        reactiveTagRepository.createDataEntityRelations(savedTagsPojos).blockLast();

        reactiveTagRepository.deleteDataEntityRelations(savedTagsPojos)
            .collectList()
            .as(StepVerifier::create)
            .assertNext(deletedRelations -> assertThat(deletedRelations)
                .hasSize(numberOfTestTags)
                .extracting(TagToDataEntityPojo::getTagId)
                .containsExactlyInAnyOrder(savedTagsList.stream().map(TagPojo::getId).toArray(Long[]::new)))
            .verifyComplete();
    }

    @Test
    @DisplayName("Deletes tags relations where list of tags is empty, expecting no relations are deleted")
    void testDeleteRelationsIsEmpty() {
        final int numberOfTestTags = 3;
        final List<TagPojo> testTagsList = createTestTagList(numberOfTestTags);
        final List<TagPojo> savedTagsList = reactiveTagRepository.bulkCreate(testTagsList)
            .collectList()
            .blockOptional()
            .orElseThrow();
        final List<DataEntityPojo> testDataEntityList = dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()))
            .collectList()
            .block();
        final List<TagToDataEntityPojo> savedTagsPojos = savedTagsList.stream()
            .map(tag -> new TagToDataEntityPojo()
                .setTagId(tag.getId())
                .setDataEntityId(testDataEntityList.get(0).getId()))
            .toList();

        reactiveTagRepository.createDataEntityRelations(savedTagsPojos).blockLast();

        reactiveTagRepository.deleteDataEntityRelations(List.of())
            .as(StepVerifier::create)
            .verifyComplete();
    }

    @Test
    @DisplayName("Updates tag, expecting tag is updated successfully")
    void testUpdateTag() {
        final TagPojo tag = new TagPojo()
            .setName(UUID.randomUUID().toString())
            .setImportant(true);

        final TagPojo createdTag = reactiveTagRepository.create(tag)
            .blockOptional()
            .orElseThrow();

        createdTag.setName(UUID.randomUUID().toString());
        final String newName = createdTag.getName();

        reactiveTagRepository.update(createdTag)
            .as(StepVerifier::create)
            .assertNext(actualTag -> assertThat(actualTag.getName()).isNotNull().isEqualTo(newName))
            .verifyComplete();
    }

    @Test
    @DisplayName("Gets list of most popular tags")
    void testListMostPopular() {
        final int numberOfTestTags = 8;
        final int numberOfPopularTags = 4;
        final String testName = "PopularName";
        final List<Long> expectedPopularTagIds = new ArrayList<>();
        final List<TagPojo> testTagsList = createTestTagList(numberOfTestTags);

        final List<TagPojo> createdTagsList = reactiveTagRepository.bulkCreate(testTagsList)
            .collectList()
            .blockOptional()
            .orElseThrow();
        for (int i = 0; i < numberOfPopularTags; i++) {
            final TagPojo currentTag = createdTagsList.get(i);
            currentTag.setName(testName + i);
            expectedPopularTagIds.add(currentTag.getId());
        }
        reactiveTagRepository.bulkUpdate(createdTagsList).blockLast();

        reactiveTagRepository.listMostPopular(testName, List.of(), 1, numberOfTestTags)
            .as(StepVerifier::create)
            .assertNext(page -> {
                assertThat(page.getTotal()).isEqualTo(numberOfPopularTags);
                assertThat(page.isHasNext()).isFalse();
                assertThat(page.getData())
                    .extracting(TagDto::tagPojo).extracting(TagPojo::getId)
                    .containsExactlyInAnyOrder(expectedPopularTagIds.toArray(Long[]::new));
            })
            .verifyComplete();
    }

    /**
     * The PLT-026 / LSN-019 regression: the directory exceeds the page size and the most-used
     * tags are the YOUNGEST (highest ids). A correct "most popular" page 1 must contain them,
     * ordered by usage; the broken implementation windowed by {@code TAG.ID ASC} BEFORE
     * aggregating usage, so the youngest tags could never reach page 1 however used they were.
     */
    @Test
    @DisplayName("Lists the globally most-used tags first, not the oldest-by-id window re-ranked")
    void testListMostPopularReturnsGloballyMostUsedTags() {
        final String namePrefix = UUID.randomUUID().toString();
        final int oldTagsCount = 5;
        final int popularTagsCount = 3;
        final int usagesPerPopularTag = 3;
        final int pageSize = oldTagsCount;

        final List<DataEntityPojo> entities = dataEntityRepository
            .bulkCreate(Stream.generate(DataEntityPojo::new).limit(usagesPerPopularTag).toList())
            .collectList()
            .blockOptional()
            .orElseThrow();

        // low-use tags created FIRST (lowest ids): one usage each
        final List<TagPojo> oldTags = reactiveTagRepository
            .bulkCreate(createNamedTagList(namePrefix + "-old", oldTagsCount))
            .collectList()
            .blockOptional()
            .orElseThrow();
        reactiveTagRepository.createDataEntityRelations(oldTags.stream()
                .map(tag -> new TagToDataEntityPojo()
                    .setTagId(tag.getId())
                    .setDataEntityId(entities.get(0).getId()))
                .toList())
            .blockLast();

        // most-used tags created LAST (highest ids = the youngest): one usage per entity
        final List<TagPojo> popularTags = reactiveTagRepository
            .bulkCreate(createNamedTagList(namePrefix + "-popular", popularTagsCount))
            .collectList()
            .blockOptional()
            .orElseThrow();
        reactiveTagRepository.createDataEntityRelations(popularTags.stream()
                .flatMap(tag -> entities.stream()
                    .map(entity -> new TagToDataEntityPojo()
                        .setTagId(tag.getId())
                        .setDataEntityId(entity.getId())))
                .toList())
            .blockLast();

        // page 1 = every most-used tag (usage DESC), then the oldest low-use fill — id ASC ties
        final Long[] expectedPageIds = Stream.concat(
                popularTags.stream().map(TagPojo::getId).sorted(),
                oldTags.stream().map(TagPojo::getId).sorted().limit(pageSize - popularTagsCount))
            .toArray(Long[]::new);

        reactiveTagRepository.listMostPopular(namePrefix, List.of(), 1, pageSize)
            .as(StepVerifier::create)
            .assertNext(page -> {
                assertThat(page.getTotal()).isEqualTo(oldTagsCount + popularTagsCount);
                assertThat(page.isHasNext()).isTrue();
                assertThat(page.getData())
                    .extracting(TagDto::tagPojo).extracting(TagPojo::getId)
                    .containsExactly(expectedPageIds);
                assertThat(page.getData().get(0).usedCount()).isEqualTo((long) usagesPerPopularTag);
            })
            .verifyComplete();
    }

    /**
     * Method for the test purpose. Creates list of exact number of {@link TagPojo}
     *
     * @param numberOfTestTags - number of tags inside the list
     * @return - List of {@link TagPojo}
     */
    private List<TagPojo> createTestTagList(final int numberOfTestTags) {
        final List<TagPojo> testTagPojo = new ArrayList<>();
        for (int i = 0; i < numberOfTestTags; i++) {
            testTagPojo.add(new TagPojo()
                .setName(UUID.randomUUID().toString())
                .setImportant(true));
        }
        return testTagPojo;
    }

    private List<TagPojo> createNamedTagList(final String namePrefix, final int numberOfTags) {
        final List<TagPojo> tags = new ArrayList<>();
        for (int i = 0; i < numberOfTags; i++) {
            tags.add(new TagPojo()
                .setName(namePrefix + "-" + i)
                .setImportant(false));
        }
        return tags;
    }
}
