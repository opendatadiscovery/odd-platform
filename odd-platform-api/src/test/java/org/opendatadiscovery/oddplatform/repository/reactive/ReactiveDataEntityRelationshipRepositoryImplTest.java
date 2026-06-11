package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.RelationshipsType;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.dto.RelationshipDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * BEHAVIORAL Testcontainers test for the global Relationships listing visibility defaults
 * (#1752 Defect 2 / PLT-056).
 *
 * <p>{@code ReactiveDataEntityRelationshipRepositoryImpl.getRelationships} built its WHERE from scratch
 * (entity-class match + optional name filter) and applied NONE of the catalog's default visibility
 * predicates ({@code HOLLOW = false}, {@code STATUS != DELETED}, {@code EXCLUDE_FROM_SEARCH is null/false}
 * — {@code ReactiveDataEntityRepositoryImpl.getDataEntityDefaultConditions}), so soft-DELETED,
 * exclude-from-search-flagged and hollow relationship entities stayed listed on
 * {@code GET /api/relationships} after every sibling read surface hid them. RED on the unfixed
 * repository (all seeded rows returned), GREEN once the default trio lands — including the page total,
 * which shares the same condition list.
 *
 * @validates F-037
 * @regresses PLT-056 (issue #1752, Defect 2)
 */
@DisplayName("Global relationships listing default visibility (#1752 Defect 2)")
class ReactiveDataEntityRelationshipRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private ReactiveDataEntityRelationshipRepository dataEntityRelationshipRepository;
    @Autowired
    private ReactiveDataEntityRepository dataEntityRepository;
    @Autowired
    private ReactiveRelationshipsRepository relationshipsRepository;

    @Test
    @DisplayName("soft-DELETED, exclude_from_search and hollow relationship entities are not listed")
    void getRelationships_appliesTheCatalogDefaultVisibilityPredicates() {
        final String prefix = "it1752-" + UUID.randomUUID().toString().substring(0, 8);
        seedCatalog(prefix);

        dataEntityRelationshipRepository.getRelationships(1, 30, prefix, RelationshipsType.ALL)
            .as(StepVerifier::create)
            .assertNext(page -> {
                assertThat(page.getData())
                    .as("only the healthy relationship entities may be listed: soft-DELETED, "
                        + "exclude_from_search and hollow ones must be hidden (the catalog default trio)")
                    .extracting(dto -> dto.dataEntityRelationship().getExternalName())
                    .containsExactlyInAnyOrder(prefix + "-rel-ok", prefix + "-rel-graph");
                assertThat(page.getTotal())
                    .as("the page total shares the condition list and must match the visible rows")
                    .isEqualTo(2L);
                final RelationshipDto ok = page.getData().stream()
                    .filter(dto -> (prefix + "-rel-ok").equals(dto.dataEntityRelationship().getExternalName()))
                    .findFirst().orElseThrow();
                assertThat(ok.sourceDataEntity().getExternalName())
                    .as("the DTO must carry the DISTINCT source dataset")
                    .isEqualTo(prefix + "-src");
                assertThat(ok.targetDataEntity().getExternalName())
                    .as("the DTO must carry the DISTINCT target dataset (the UI Target column reads this)")
                    .isEqualTo(prefix + "-tgt");
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("type and name filters still work on the filtered listing")
    void getRelationships_typeAndNameFiltersStillWork() {
        final String prefix = "it1752-" + UUID.randomUUID().toString().substring(0, 8);
        seedCatalog(prefix);

        dataEntityRelationshipRepository.getRelationships(1, 30, prefix, RelationshipsType.ERD)
            .as(StepVerifier::create)
            .assertNext(page -> assertThat(page.getData())
                .as("the ERD tab filter must keep working")
                .extracting(dto -> dto.dataEntityRelationship().getExternalName())
                .containsExactly(prefix + "-rel-ok"))
            .verifyComplete();

        dataEntityRelationshipRepository.getRelationships(1, 30, prefix + "-rel-graph", RelationshipsType.ALL)
            .as(StepVerifier::create)
            .assertNext(page -> assertThat(page.getData())
                .as("the name filter must keep working")
                .extracting(dto -> dto.dataEntityRelationship().getExternalName())
                .containsExactly(prefix + "-rel-graph"))
            .verifyComplete();
    }

    private void seedCatalog(final String prefix) {
        final DataEntityPojo src = dataset(prefix, "-src");
        final DataEntityPojo tgt = dataset(prefix, "-tgt");
        final List<DataEntityPojo> created = dataEntityRepository.bulkCreate(List.of(
                src, tgt,
                relationshipEntity(prefix, "-rel-ok", 25),
                relationshipEntity(prefix, "-rel-deleted", 25)
                    .setStatus(DataEntityStatusDto.DELETED.getId()),
                relationshipEntity(prefix, "-rel-excluded", 25)
                    .setExcludeFromSearch(true),
                relationshipEntity(prefix, "-rel-hollow", 25)
                    .setHollow(true),
                relationshipEntity(prefix, "-rel-graph", 26)))
            .collectList().block();

        final String srcOddrn = created.get(0).getOddrn();
        final String tgtOddrn = created.get(1).getOddrn();
        for (int i = 2; i < created.size(); i++) {
            final DataEntityPojo rel = created.get(i);
            final String type = rel.getTypeId() == 26 ? "GRAPH" : "ERD";
            relationshipsRepository.create(new RelationshipsPojo()
                    .setDataEntityId(rel.getId())
                    .setSourceDatasetOddrn(srcOddrn)
                    .setTargetDatasetOddrn(tgtOddrn)
                    .setRelationshipType(type))
                .block();
        }
    }

    private DataEntityPojo dataset(final String prefix, final String suffix) {
        return new DataEntityPojo()
            .setOddrn("//it1752/db/tables/" + prefix + suffix)
            .setExternalName(prefix + suffix)
            .setEntityClassIds(new Integer[] {1})
            .setTypeId(1)
            .setHollow(false)
            .setStatus(DataEntityStatusDto.UNASSIGNED.getId())
            .setExcludeFromSearch(false);
    }

    private DataEntityPojo relationshipEntity(final String prefix, final String suffix, final int typeId) {
        return new DataEntityPojo()
            .setOddrn("//it1752/db/relationships/" + prefix + suffix)
            .setExternalName(prefix + suffix)
            .setEntityClassIds(new Integer[] {9})
            .setTypeId(typeId)
            .setHollow(false)
            .setStatus(DataEntityStatusDto.UNASSIGNED.getId())
            .setExcludeFromSearch(false);
    }
}
