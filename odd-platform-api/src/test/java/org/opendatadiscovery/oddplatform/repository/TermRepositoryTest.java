package org.opendatadiscovery.oddplatform.repository;

import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveNamespaceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.TermRelationsRepository;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

public class TermRepositoryTest extends BaseIntegrationTest {

    @Autowired
    private ReactiveTermRepository termRepository;
    @Autowired
    private TermRelationsRepository termRelationsRepository;
    @Autowired
    private ReactiveNamespaceRepository namespaceRepository;

    @Test
    @DisplayName("linkedTermsUsingCount excludes soft-deleted linked terms and matches the linked-terms list")
    void linkedTermsCountMatchesListAndExcludesDeleted() {
        final NamespacePojo namespace = namespaceRepository.createByName(unique("namespace")).block();

        final TermPojo viewedTerm = createTerm(namespace.getId());
        final TermPojo linked1 = createTerm(namespace.getId());
        final TermPojo linked2 = createTerm(namespace.getId());

        // Both relations are stored with the viewed term as ASSIGNED, so they surface in the
        // viewed term's linked-terms list and count (target = linked term).
        termRelationsRepository.createRelationWithTerm(viewedTerm.getId(), linked1.getId()).block();
        termRelationsRepository.createRelationWithTerm(viewedTerm.getId(), linked2.getId()).block();

        // Before deletion: both the aggregate count and the list see 2 linked terms.
        assertThat(linkedTermsCount(viewedTerm.getId())).isEqualTo(2);
        assertThat(linkedTermsListSize(viewedTerm.getId())).isEqualTo(2);

        // Soft-delete one linked term.
        termRepository.delete(linked2.getId()).block();

        // After deletion: the list drops it (DELETED_AT filter) and the count must follow.
        assertThat(linkedTermsListSize(viewedTerm.getId())).isEqualTo(1);
        assertThat(linkedTermsCount(viewedTerm.getId())).isEqualTo(1);
    }

    private int linkedTermsCount(final Long termId) {
        return termRepository.getTermDetailsDto(termId).block()
            .getTermDto().getLinkedTermsUsingCount();
    }

    private long linkedTermsListSize(final Long termId) {
        return termRepository.listByTerm(termId, null, 1, 30).count().block();
    }

    private TermPojo createTerm(final Long namespaceId) {
        return termRepository.create(new TermPojo()
            .setName(unique("term"))
            .setDefinition("definition")
            .setNamespaceId(namespaceId)).block();
    }

    private static String unique(final String prefix) {
        return prefix + "_" + UUID.randomUUID();
    }
}
