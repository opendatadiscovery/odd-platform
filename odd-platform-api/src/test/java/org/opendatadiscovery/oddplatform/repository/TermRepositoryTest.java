package org.opendatadiscovery.oddplatform.repository;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.term.LinkedTermDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermToTermPojo;
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

    @Test
    @DisplayName("a manual link is symmetric: visible in Overview, list and count on BOTH terms")
    void manualLinkIsBidirectional() {
        final NamespacePojo namespace = namespaceRepository.createByName(unique("namespace")).block();
        final TermPojo pageTerm = createTerm(namespace.getId());
        final TermPojo picked = createTerm(namespace.getId());

        // On pageTerm's page, add `picked` — stored once as (assigned=picked, target=pageTerm).
        linkFromPage(pageTerm.getId(), picked.getId());

        // Overview TERMS panel of each term shows the other.
        assertThat(overviewTermIds(pageTerm.getId())).contains(picked.getId());
        assertThat(overviewTermIds(picked.getId())).contains(pageTerm.getId());

        // "Linked terms" tab list + badge count agree and see the link from both sides.
        assertThat(tabTermIds(pageTerm.getId())).containsExactly(picked.getId());
        assertThat(tabTermIds(picked.getId())).containsExactly(pageTerm.getId());
        assertThat(linkedTermsCount(pageTerm.getId())).isEqualTo(1);
        assertThat(linkedTermsCount(picked.getId())).isEqualTo(1);
    }

    @Test
    @DisplayName("a manual link can be removed from either term's side")
    void manualLinkRemovableFromEitherSide() {
        final NamespacePojo namespace = namespaceRepository.createByName(unique("namespace")).block();
        final TermPojo pageTerm = createTerm(namespace.getId());
        final TermPojo picked = createTerm(namespace.getId());

        // Stored as (assigned=picked, target=pageTerm).
        linkFromPage(pageTerm.getId(), picked.getId());

        // Remove from the OTHER side (picked's page) — reversed orientation vs how it was stored.
        // Mirrors controller: deleteLinkedTermFromTerm(termId=picked, linkedTermId=pageTerm).
        termRelationsRepository.deleteTermToLinkedTermRelation(pageTerm.getId(), picked.getId()).block();

        assertThat(linkedTermsCount(pageTerm.getId())).isZero();
        assertThat(linkedTermsCount(picked.getId())).isZero();
        assertThat(overviewTermIds(pageTerm.getId())).doesNotContain(picked.getId());
        assertThat(overviewTermIds(picked.getId())).doesNotContain(pageTerm.getId());
    }

    @Test
    @DisplayName("description links stay directional: Overview shows 'references', tab shows 'referenced-by'")
    void descriptionLinkStaysDirectional() {
        final NamespacePojo namespace = namespaceRepository.createByName(unique("namespace")).block();
        final TermPojo term = createTerm(namespace.getId());
        final TermPojo mentioned = createTerm(namespace.getId());

        // `term`'s definition mentions `mentioned` -> (assigned=mentioned, target=term, description=true).
        termRelationsRepository.createRelationsWithTerm(List.of(new TermToTermPojo()
            .setAssignedTermId(mentioned.getId())
            .setTargetTermId(term.getId())
            .setIsDescriptionLink(true))).collectList().block();

        // Overview of `term` shows `mentioned` (term references it), flagged as a description link.
        final LinkedTermDto overviewEntry = termRepository.getTermDetailsDto(term.getId()).block()
            .getTerms().stream()
            .filter(dto -> dto.term().getTerm().getId().equals(mentioned.getId()))
            .findFirst().orElseThrow();
        assertThat(overviewEntry.isDescriptionLink()).isTrue();

        // Not mirrored: `mentioned`'s Overview must NOT list `term`, and `term`'s tab must NOT list it.
        assertThat(overviewTermIds(mentioned.getId())).doesNotContain(term.getId());
        assertThat(tabTermIds(term.getId())).doesNotContain(mentioned.getId());

        // The tab keeps the back-reference: `mentioned`'s tab shows `term` (referenced-by).
        assertThat(tabTermIds(mentioned.getId())).contains(term.getId());
    }

    // Mirrors the controller add-link flow: on `pageTermId`'s page, pick `pickedTermId`.
    private void linkFromPage(final Long pageTermId, final Long pickedTermId) {
        termRelationsRepository.createRelationWithTerm(pickedTermId, pageTermId).block();
    }

    private Set<Long> overviewTermIds(final Long termId) {
        return termRepository.getTermDetailsDto(termId).block().getTerms().stream()
            .map(dto -> dto.term().getTerm().getId())
            .collect(Collectors.toSet());
    }

    private Set<Long> tabTermIds(final Long termId) {
        return termRepository.listByTerm(termId, null, 1, 30)
            .map(dto -> dto.term().getTerm().getId())
            .collect(Collectors.toSet()).block();
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
