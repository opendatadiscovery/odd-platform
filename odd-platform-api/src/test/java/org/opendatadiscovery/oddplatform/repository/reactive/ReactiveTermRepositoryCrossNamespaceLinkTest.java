package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.term.LinkedTermDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * BEHAVIORAL Testcontainers test for term-details linked-term namespace resolution (issue #1746 / CTRIB-002).
 *
 * <p>{@code getTermDetailsDto} aggregates a namespace JSON array ({@code ASSIGNED_TERM_NAMESPACES}) that
 * {@code extractTerms} uses to resolve each linked term's namespace. The aggregation must read the
 * {@code assigned_terms_namespace} alias (the LINKED terms' namespaces) — on the unfixed code it reads the
 * outer {@code NAMESPACE} table (the PARENT term's namespace), so any linked term living in a different
 * namespace resolves to {@code namespace == null}. That null reaches the wire in violation of the OpenAPI
 * contract ({@code TermRef.required: namespace}) and white-screens the term-overview SPA page. RED on the
 * unfixed repository for the cross-namespace linked term, GREEN once the aggregation reads the correct
 * alias; the same-namespace control pins the previously-working case.
 *
 * @validates F-151
 * @regresses PLT-006 (https://github.com/opendatadiscovery/odd-platform/issues/1746)
 */
@DisplayName("Term details cross-namespace linked-term namespace resolution (#1746)")
class ReactiveTermRepositoryCrossNamespaceLinkTest extends BaseIntegrationTest {

    @Autowired
    private ReactiveTermRepository termRepository;
    @Autowired
    private ReactiveNamespaceRepository namespaceRepository;
    @Autowired
    private TermRelationsRepository termRelationsRepository;

    @Test
    @DisplayName("a linked term in ANOTHER namespace keeps its own namespace in term details, not null")
    void linkedTermNamespaces_resolvePerLinkedTerm_neverNull() {
        final NamespacePojo parentNs = namespaceRepository.createByName(UUID.randomUUID().toString()).block();
        final NamespacePojo linkedNs = namespaceRepository.createByName(UUID.randomUUID().toString()).block();

        final TermPojo parent = termRepository.create(new TermPojo()
            .setName("ctrib002_parent")
            .setDefinition("references [[other_ns:ctrib002_cross_ns_linked]]")
            .setNamespaceId(parentNs.getId())).block();
        final TermPojo crossNsLinked = termRepository.create(new TermPojo()
            .setName("ctrib002_cross_ns_linked")
            .setDefinition("a linked term living in a DIFFERENT namespace than the parent")
            .setNamespaceId(linkedNs.getId())).block();
        final TermPojo sameNsLinked = termRepository.create(new TermPojo()
            .setName("ctrib002_same_ns_control")
            .setDefinition("a linked term in the SAME namespace as the parent (control)")
            .setNamespaceId(parentNs.getId())).block();

        termRelationsRepository.createRelationWithTerm(crossNsLinked.getId(), parent.getId()).block();
        termRelationsRepository.createRelationWithTerm(sameNsLinked.getId(), parent.getId()).block();

        termRepository.getTermDetailsDto(parent.getId())
            .as(StepVerifier::create)
            .assertNext(details -> {
                assertThat(details.getTerms()).hasSize(2);

                // a plain HashMap — Collectors.toMap rejects null values, and a null namespace
                // is exactly the regression this test pins
                final Map<Long, NamespacePojo> namespacesByTermId = new HashMap<>();
                details.getTerms().forEach(
                    lt -> namespacesByTermId.put(lt.term().getTerm().getId(), lt.term().getNamespace()));

                assertThat(namespacesByTermId.values())
                    .as("every linked term must carry its namespace (spec: TermRef.namespace is required)")
                    .doesNotContainNull();
                assertThat(namespacesByTermId.get(crossNsLinked.getId()).getId())
                    .as("the cross-namespace linked term must carry ITS OWN namespace, not the parent's")
                    .isEqualTo(linkedNs.getId());
                assertThat(namespacesByTermId.get(sameNsLinked.getId()).getId())
                    .as("the same-namespace control must keep resolving")
                    .isEqualTo(parentNs.getId());
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("a term with no linked terms still composes its details (empty aggregation unaffected)")
    void termWithNoLinkedTerms_composesEmptyTerms() {
        final NamespacePojo ns = namespaceRepository.createByName(UUID.randomUUID().toString()).block();
        final TermPojo lone = termRepository.create(new TermPojo()
            .setName("ctrib002_lone")
            .setDefinition("no linked terms at all")
            .setNamespaceId(ns.getId())).block();

        termRepository.getTermDetailsDto(lone.getId())
            .as(StepVerifier::create)
            .assertNext(details -> assertThat(details.getTerms())
                .extracting(LinkedTermDto::term)
                .as("a term without linked terms must compose with an empty linked-terms list")
                .isEmpty())
            .verifyComplete();
    }
}
