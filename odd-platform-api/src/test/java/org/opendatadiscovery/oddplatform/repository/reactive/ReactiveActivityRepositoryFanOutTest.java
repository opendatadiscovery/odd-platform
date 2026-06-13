package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ActivityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagToDataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TitlePojo;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * BEHAVIORAL Testcontainers test for the Activity-feed tag+owner fan-out (PLT-176 / #1744 / CTRIB-001).
 *
 * <p>{@code ReactiveActivityRepositoryImpl} LEFT-JOINs the one-to-many {@code TAG_TO_DATA_ENTITY} and
 * {@code OWNERSHIP} tables to apply the {@code tagIds}/{@code ownerIds} filters and never de-duplicates,
 * so an entity matching N filtered tags x M filtered owners yields each activity N*M times — and the same
 * fan-out inflates {@code getTotalActivitiesCount}. With one entity carrying 2 matching tags + 2 matching
 * owners and one activity, the list returns 4 rows and the count returns 4. The EXISTS-semi-join fix makes
 * both return 1. RED on the unfixed repository, GREEN once the fix lands.
 *
 * @validates F-021
 * @regresses PLT-176
 */
@DisplayName("Activity feed tag+owner fan-out (PLT-176)")
class ReactiveActivityRepositoryFanOutTest extends BaseIntegrationTest {

    @Autowired
    private ReactiveActivityRepository activityRepository;
    @Autowired
    private ReactiveDataEntityRepository dataEntityRepository;
    @Autowired
    private ReactiveTagRepository tagRepository;
    @Autowired
    private ReactiveOwnerRepository ownerRepository;
    @Autowired
    private ReactiveOwnershipRepository ownershipRepository;
    @Autowired
    private ReactiveTitleRepository titleRepository;

    @Test
    @DisplayName("2 tags x 2 owners on one entity -> one activity row + count 1, not four")
    void tagOwnerFilters_doNotMultiplyAnActivity() {
        // one data entity
        final Long deId = dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()))
            .collectList().block().get(0).getId();

        // 2 tags, both linked to the entity
        final List<TagPojo> tags = tagRepository.bulkCreate(List.of(
                new TagPojo().setName(UUID.randomUUID().toString()).setImportant(false),
                new TagPojo().setName(UUID.randomUUID().toString()).setImportant(false)))
            .collectList().block();
        tagRepository.createDataEntityRelations(tags.stream()
                .map(t -> new TagToDataEntityPojo().setTagId(t.getId()).setDataEntityId(deId)).toList())
            .blockLast();

        // 2 owners, both linked to the entity (OWNERSHIP carries data_entity_id)
        final Long titleId = titleRepository.create(new TitlePojo().setName(UUID.randomUUID().toString()))
            .block().getId();
        final Long ownerId1 = ownerRepository.create(new OwnerPojo().setName(UUID.randomUUID().toString()))
            .block().getId();
        final Long ownerId2 = ownerRepository.create(new OwnerPojo().setName(UUID.randomUUID().toString()))
            .block().getId();
        ownershipRepository.create(new OwnershipPojo().setDataEntityId(deId).setOwnerId(ownerId1).setTitleId(titleId))
            .block();
        ownershipRepository.create(new OwnershipPojo().setDataEntityId(deId).setOwnerId(ownerId2).setTitleId(titleId))
            .block();

        // one activity on that entity (created_at = now -> the @PostConstruct-created current partition)
        activityRepository.saveReturning(new ActivityPojo()
                .setDataEntityId(deId)
                .setEventType("DESCRIPTION_UPDATED")
                .setIsSystemEvent(true)
                .setCreatedAt(DateTimeUtil.generateNow()))
            .block();

        final OffsetDateTime begin = OffsetDateTime.now(ZoneOffset.UTC).minusDays(1);
        final OffsetDateTime end = OffsetDateTime.now(ZoneOffset.UTC).plusDays(1);
        final List<Long> tagIds = tags.stream().map(TagPojo::getId).toList();
        final List<Long> ownerIds = List.of(ownerId1, ownerId2);

        // list: ONE row for the single event, not 2 tags x 2 owners = 4
        activityRepository.findAllActivities(begin, end, 100, null, null, tagIds, ownerIds, List.of(),
                List.of(), null, null, null)
            .collectList()
            .as(StepVerifier::create)
            .assertNext(rows -> assertThat(rows)
                .as("tag+owner filters must not multiply a single activity by N tags x M owners")
                .hasSize(1))
            .verifyComplete();

        // count: ONE, not 4 (the count endpoint shares the same fan-out)
        activityRepository.getTotalActivitiesCount(begin, end, null, null, tagIds, ownerIds, List.of(), List.of(), null)
            .as(StepVerifier::create)
            .assertNext(count -> assertThat(count)
                .as("getTotalActivitiesCount must equal the distinct event count, not the fanned-out count")
                .isEqualTo(1L))
            .verifyComplete();
    }
}
