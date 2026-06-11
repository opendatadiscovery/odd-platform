package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.RelationshipsType;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * BEHAVIORAL Testcontainers test for the dataset-tab relationships listing visibility
 * (#1752 — the dataset-tab sibling of Defect 2 / PLT-056).
 *
 * <p>{@code ReactiveRelationshipsRepositoryImpl.getRelationsByDatasetIdAndType} (the dataset detail
 * page's Relationships tab, {@code GET /api/datasets/{id}/relationships}) joined the relationship-class
 * entity with NO visibility predicate, so a soft-DELETED (or hollow) relationship entity stayed listed
 * on the dataset's own tab. The fix adds {@code STATUS != DELETED} + {@code HOLLOW = false} there —
 * and DELIBERATELY not {@code EXCLUDE_FROM_SEARCH}: that flag is the operator's discovery-noise
 * control; hiding a dataset's real relationship from the dataset's own contextual detail tab would be
 * silent incompleteness. This test pins BOTH halves of that decision: deleted/hollow hidden (RED on
 * the unfixed repository), excluded still visible (a green-lock on the deliberate nuance).
 *
 * @validates F-037
 * @regresses PLT-056 (issue #1752, Defect 2 — dataset-tab sibling)
 */
@DisplayName("Dataset-tab relationships listing visibility (#1752 Defect 2 sibling)")
class ReactiveRelationshipsRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private ReactiveRelationshipsRepository relationshipsRepository;
    @Autowired
    private ReactiveDataEntityRepository dataEntityRepository;

    @Test
    @DisplayName("the dataset tab hides DELETED/hollow relationships but keeps exclude_from_search ones")
    void getRelationsByDatasetId_hidesDeletedAndHollow_keepsExcluded() {
        final String prefix = "it1752ds-" + UUID.randomUUID().toString().substring(0, 8);

        final List<DataEntityPojo> created = dataEntityRepository.bulkCreate(List.of(
                dataset(prefix, "-anchor"),
                dataset(prefix, "-other"),
                relationshipEntity(prefix, "-rel-ok"),
                relationshipEntity(prefix, "-rel-deleted")
                    .setStatus(DataEntityStatusDto.DELETED.getId()),
                relationshipEntity(prefix, "-rel-excluded")
                    .setExcludeFromSearch(true),
                relationshipEntity(prefix, "-rel-hollow")
                    .setHollow(true)))
            .collectList().block();

        final DataEntityPojo anchor = created.get(0);
        final String anchorOddrn = anchor.getOddrn();
        final String otherOddrn = created.get(1).getOddrn();
        for (int i = 2; i < created.size(); i++) {
            relationshipsRepository.create(new RelationshipsPojo()
                    .setDataEntityId(created.get(i).getId())
                    .setSourceDatasetOddrn(anchorOddrn)
                    .setTargetDatasetOddrn(otherOddrn)
                    .setRelationshipType("ERD"))
                .block();
        }

        relationshipsRepository.getRelationsByDatasetIdAndType(anchor.getId(), RelationshipsType.ALL)
            .collectList()
            .as(StepVerifier::create)
            .assertNext(rows -> assertThat(rows)
                .as("the dataset tab must hide soft-DELETED and hollow relationship entities but KEEP "
                    + "exclude_from_search ones — exclusion is a search-scope flag, not a lifecycle state")
                .extracting(dto -> dto.dataEntityRelationship().getExternalName())
                .containsExactlyInAnyOrder(prefix + "-rel-ok", prefix + "-rel-excluded"))
            .verifyComplete();
    }

    private DataEntityPojo dataset(final String prefix, final String suffix) {
        return new DataEntityPojo()
            .setOddrn("//it1752ds/db/tables/" + prefix + suffix)
            .setExternalName(prefix + suffix)
            .setEntityClassIds(new Integer[] {1})
            .setTypeId(1)
            .setHollow(false)
            .setStatus(DataEntityStatusDto.UNASSIGNED.getId())
            .setExcludeFromSearch(false);
    }

    private DataEntityPojo relationshipEntity(final String prefix, final String suffix) {
        return new DataEntityPojo()
            .setOddrn("//it1752ds/db/relationships/" + prefix + suffix)
            .setExternalName(prefix + suffix)
            .setEntityClassIds(new Integer[] {9})
            .setTypeId(25)
            .setHollow(false)
            .setStatus(DataEntityStatusDto.UNASSIGNED.getId())
            .setExcludeFromSearch(false);
    }
}
