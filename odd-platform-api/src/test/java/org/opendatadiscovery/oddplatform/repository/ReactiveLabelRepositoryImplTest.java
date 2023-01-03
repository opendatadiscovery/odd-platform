package org.opendatadiscovery.oddplatform.repository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;
import org.jooq.impl.DSL;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLabelRepository;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.opendatadiscovery.oddplatform.model.Tables.LABEL;

class ReactiveLabelRepositoryImplTest extends BaseIntegrationTest {
    @Autowired
    private ReactiveLabelRepository labelRepository;

    @Autowired
    private JooqReactiveOperations jooqReactiveOperations;

    @Test
    @DisplayName("Tests listing labels from database with query string")
    void testListWithQuery() {
        final int prefixedCount = 10;
        final String queryString = "testPrefix";

        final List<LabelPojo> expected = labelRepository.bulkCreate(generateLabels(50, prefixedCount, queryString))
            .collectList()
            .block()
            .stream()
            .filter(label -> label.getName().startsWith(queryString))
            .toList();

        labelRepository.list(1, 10, queryString)
            .as(StepVerifier::create)
            .assertNext(page -> assertThat(page).isEqualTo(new Page<>(expected, prefixedCount, false)))
            .verifyComplete();
    }

    @Test
    @DisplayName("Tests bulk creating labels")
    void testBulkCreate() {
        final List<LabelPojo> expected = generateLabels(10);

        labelRepository.bulkCreate(expected).collectList()
            .as(StepVerifier::create)
            .assertNext(actual -> assertThat(extractLabelNames(actual)).isEqualTo(extractLabelNames(expected)))
            .verifyComplete();
    }

    @Test
    @DisplayName("Tests updating the label")
    void testUpdate() {
        final String originalName = "test1";
        final String newName = "test2";

        labelRepository.create(new LabelPojo().setName(originalName))
            .flatMap(createdLabel -> labelRepository.update(createdLabel.setName(newName)))
            .zipWhen(expected -> labelRepository.get(expected.getId()))
            .as(StepVerifier::create)
            .assertNext(t -> assertThat(t.getT1()).isEqualTo(t.getT2()))
            .verifyComplete();
    }

    @Test
    @DisplayName("Tests soft deleting the label")
    void testDelete() {
        final LabelPojo deletedLabel = labelRepository.create(new LabelPojo().setName("label"))
            .flatMap(createdLabel -> labelRepository.delete(createdLabel.getId()))
            .block();

        labelRepository.get(deletedLabel.getId())
            .as(StepVerifier::create)
            .verifyComplete();

        jooqReactiveOperations.mono(DSL.selectFrom(LABEL).where(LABEL.ID.eq(deletedLabel.getId())))
            .map(r -> r.into(LabelPojo.class))
            .as(StepVerifier::create)
            .assertNext(l -> {
                assertThat(l.getDeletedAt()).isNotNull();
            })
            .verifyComplete();
    }

    private List<String> extractLabelNames(final List<LabelPojo> actual) {
        return actual.stream().map(LabelPojo::getName).toList();
    }

    private List<LabelPojo> generateLabels(final int limit) {
        return generateLabels(limit, 0, null);
    }

    private List<LabelPojo> generateLabels(final int limit, final int prefixedCount, final String prefix) {
        if (limit < prefixedCount) {
            throw new RuntimeException("Limit number cannot be lower than prefixedCount");
        }

        final Stream<LabelPojo> unprefixed = Stream
            .generate(() -> UUID.randomUUID().toString())
            .limit(limit - prefixedCount)
            .map(name -> new LabelPojo().setName(name));

        final Stream<LabelPojo> prefixed = Stream
            .generate(() -> UUID.randomUUID().toString())
            .limit(prefixedCount)
            .map(name -> new LabelPojo().setName(prefix != null ? prefix + name : name));

        return Stream.concat(unprefixed, prefixed).toList();
    }
}