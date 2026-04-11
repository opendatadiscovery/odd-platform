package org.opendatadiscovery.oddplatform.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TitlePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTitleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Integration tests for TitleRepository")
class TitlesRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private ReactiveTitleRepository titleRepository;

    @Test
    @DisplayName("Creates title pojo, expecting title pojo in db")
    void testCreatesTitlePojo() {
        final TitlePojo titlePojo = new TitlePojo().setName(UUID.randomUUID().toString());

        titleRepository.create(titlePojo)
            .as(StepVerifier::create)
            .assertNext(actualTitlePojo -> {
                assertThat(actualTitlePojo).isNotNull();
                assertThat(actualTitlePojo.getId()).isNotNull();
                assertThat(actualTitlePojo.getName()).isNotNull()
                    .isEqualTo(titlePojo.getName());
            }).verifyComplete();
    }

    /**
     * Test case: Bulk creation of titles
     * Expected result: 1. All saved titles have ids 2. Saved titles have same names as input bunch of titles
     */
    @Test
    @DisplayName("Bulk creation titles, expecting titles are created successfully")
    void testBulkCreateTitle() {
        final int numberOfTestTitles = 3;
        final List<TitlePojo> testTitleList = createTestTitleList(numberOfTestTitles);
        final List<String> testTitleListNames = getListNames(testTitleList);

        titleRepository.bulkCreate(testTitleList)
            .collectList()
            .as(StepVerifier::create)
            .assertNext(actualTitleList -> {
                assertThat(actualTitleList)
                    .isNotEmpty()
                    .extracting(TitlePojo::getId).doesNotContainNull();
                assertThat(actualTitleList)
                    .extracting(TitlePojo::getName)
                    .containsExactlyInAnyOrder(testTitleListNames.toArray(String[]::new));
            }).verifyComplete();
    }

    /**
     * Test case: Bulk update of titles
     * Expected result: 1. All saved titles have ids 2. Saved titles have same names as input bunch of titles
     */
    @Test
    @DisplayName("Bulk update titles, expecting titles are updated successfully")
    void testBulkUpdateTitle() {
        final int numberOfTestTitles = 4;
        final List<TitlePojo> testTitleList = createTestTitleList(numberOfTestTitles);
        final List<String> testTitleListNames = getListNames(testTitleList);

        //create titles
        final List<TitlePojo> savedTitleList = titleRepository.bulkCreate(testTitleList)
            .collectList()
            .block();
        assertThat(savedTitleList).isNotEmpty()
            .extracting(TitlePojo::getId).doesNotContainNull();
        assertThat(savedTitleList)
            .extracting(TitlePojo::getName).containsAll(testTitleListNames);

        //update titles
        for (final TitlePojo titlePojo : savedTitleList) {
            titlePojo.setName(UUID.randomUUID().toString());
        }
        final List<String> newTitleListNames = getListNames(savedTitleList);
        titleRepository.bulkUpdate(savedTitleList)
            .collectList()
            .as(StepVerifier::create)
            .assertNext(updatedTitleList -> {
                assertThat(updatedTitleList)
                    .isNotEmpty()
                    .flatExtracting(TitlePojo::getId, TitlePojo::getName)
                    .doesNotContainNull();

                assertThat(updatedTitleList)
                    .extracting(TitlePojo::getName)
                    .containsExactlyInAnyOrder(newTitleListNames.toArray(String[]::new));
            }).verifyComplete();
    }

    @Test
    @DisplayName("Updates title pojo, expecting updated title pojo in db")
    void testUpdatesTitlePojo() {
        final String initialTitleName = UUID.randomUUID().toString();
        final TitlePojo titlePojo = new TitlePojo().setName(initialTitleName);

        final TitlePojo savedTitle = titleRepository.create(titlePojo).block();
        assertThat(savedTitle).isNotNull();
        assertThat(savedTitle.getId()).isNotNull();
        assertThat(savedTitle.getName()).isNotNull()
            .isEqualTo(initialTitleName);
        final String newTitleName = UUID.randomUUID().toString();
        savedTitle.setName(newTitleName);

        titleRepository.update(savedTitle)
            .as(StepVerifier::create)
            .assertNext(updatedTitle -> {
                assertThat(updatedTitle).isNotNull();
                assertThat(updatedTitle.getId()).isNotNull();
                assertThat(updatedTitle.getName()).isNotNull()
                    .isEqualTo(newTitleName);
            }).verifyComplete();
    }

    @Test
    @DisplayName("Deletes title pojo, expecting no title pojo in db")
    void testDeletesTitlePojo() {
        final TitlePojo titlePojo = new TitlePojo().setName(UUID.randomUUID().toString());

        final TitlePojo actualTitlePojo = titleRepository.create(titlePojo).block();
        assertThat(actualTitlePojo).isNotNull();
        final Long actualTitlePojoId = actualTitlePojo.getId();
        assertThat(actualTitlePojoId).isNotNull();
        assertThat(actualTitlePojo.getName()).isNotNull();

        titleRepository.delete(actualTitlePojoId).block();
        titleRepository.get(actualTitlePojoId)
            .as(StepVerifier::create)
            .verifyComplete();
    }

    @Test
    @DisplayName("Gets by name title from db, expecting title extracted successfully")
    void testGetByNameTitle() {
        final String testTitleName = UUID.randomUUID().toString();
        final TitlePojo titlePojo = new TitlePojo().setName(testTitleName);

        titleRepository.create(titlePojo).block();

        titleRepository.getByName(testTitleName)
            .as(StepVerifier::create)
            .assertNext(actualTitle -> {
                assertThat(actualTitle.getId()).isNotNull();
                assertThat(actualTitle.getName()).isNotNull()
                    .isEqualTo(testTitleName);
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("Gets by name title which is not in db, expecting no title extracted")
    void testGetByNameTitle_DifferentName() {
        final String testTitleName = UUID.randomUUID().toString();
        final TitlePojo titlePojo = new TitlePojo().setName(testTitleName);

        titleRepository.create(titlePojo).block();

        titleRepository.getByName(UUID.randomUUID().toString())
            .as(StepVerifier::create)
            .verifyComplete();
    }

    /**
     * Method for the test purpose. Creates list of exact number of {@link TitlePojo}
     *
     * @param numberOfTestTitles - number of titles inside the list
     * @return - List of {@link TitlePojo}
     */
    @NotNull
    private List<TitlePojo> createTestTitleList(final int numberOfTestTitles) {
        final List<TitlePojo> testTitlePojo = new ArrayList<>();
        for (int i = 0; i < numberOfTestTitles; i++) {
            testTitlePojo.add(new TitlePojo()
                .setName(UUID.randomUUID().toString()));
        }
        return testTitlePojo;
    }

    private List<String> getListNames(final List<TitlePojo> testTitleList) {
        return testTitleList.stream().map(TitlePojo::getName).toList();
    }
}
