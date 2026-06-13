package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.AssociatedOwnerDto;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ActivityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * BEHAVIORAL Testcontainers test for the Activity-feed "User" filter — that it keys on the recorded
 * actor identity (ACTIVITY.CREATED_BY) rather than the present-time user-owner mapping (#1657).
 *
 * <p>This is the RE-GROUNDING of the former {@code ActivityActorFilterKnownBugTest} (a structural
 * source-grep pin, @pins LSN-020). That pin asserted the buggy line {@code USER_OWNER_MAPPING.OWNER_ID
 * .in(userIds)} EXISTED — but the #1657 fix is additive (it ADDS a correct {@code usernames} actor
 * filter while KEEPING the deprecated {@code user_ids} parameter for backward compatibility), so the
 * buggy line is intentionally retained and the structural pin can no longer flip RED. The bug is instead
 * proven fixed BEHAVIORALLY here: the two defects the issue reports are each reproduced as an explicit
 * failing condition and locked by the corrected behaviour. See retrospectives/LSN-020, LSN-029.
 *
 * <p>Methods in a {@code BaseIntegrationTest} class share one database (the context is fresh per CLASS,
 * not per method), so every actor/owner name is namespaced with a per-test token to keep the cases
 * disjoint.
 *
 * @validates F-021
 * @validates F-196
 * @regresses LSN-020
 */
@DisplayName("Activity User filter keys on the audit actor, not the owner mapping (#1657)")
class ReactiveActivityRepositoryActorFilterTest extends BaseIntegrationTest {

    private static final String PROVIDER = "INTERNAL";

    @Autowired
    private ReactiveActivityRepository activityRepository;
    @Autowired
    private ReactiveDataEntityRepository dataEntityRepository;
    @Autowired
    private ReactiveOwnerRepository ownerRepository;
    @Autowired
    private ReactiveUserOwnerMappingRepository userOwnerMappingRepository;

    private final OffsetDateTime begin = OffsetDateTime.now(ZoneOffset.UTC).minusDays(1);
    private final OffsetDateTime end = OffsetDateTime.now(ZoneOffset.UTC).plusDays(1);
    private final String token = UUID.randomUUID().toString().substring(0, 8);

    private Long seedEntity() {
        return dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()))
            .collectList().block().get(0).getId();
    }

    private void seedActivity(final Long dataEntityId, final String createdBy) {
        activityRepository.saveReturning(new ActivityPojo()
                .setDataEntityId(dataEntityId)
                .setEventType("DESCRIPTION_UPDATED")
                .setIsSystemEvent(false)
                .setCreatedAt(DateTimeUtil.generateNow())
                .setCreatedBy(createdBy))
            .block();
    }

    @Test
    @DisplayName("DEFECT 1: an actor with NO owner mapping is still selectable by username")
    void usernamesFilterSelectsActorWithNoOwnerMapping() {
        final String bob = token + "_bob_unmapped";
        // 'bob' authored an activity but has no user_owner_mapping row at all.
        seedActivity(seedEntity(), bob);

        final List<ActivityDto> byUsername = activityRepository.findAllActivities(begin, end, 100, null, null,
                List.of(), List.of(), List.of(), List.of(bob), null, null, null)
            .collectList().block();

        assertThat(byUsername)
            .as("the usernames filter must select an actor's rows even when that actor has no owner mapping "
                + "(the user_ids filter could never match such a row — it resolves through user_owner_mapping)")
            .hasSize(1);
        assertThat(byUsername.get(0).activity().getCreatedBy()).isEqualTo(bob);
    }

    @Test
    @DisplayName("DEFECT 2: the username filter is stable under mapping churn, where the user_ids filter re-attributes")
    void usernamesFilterStableUnderMappingChurn_whereUserIdsReattributes() {
        final String alice = token + "_alice";
        final String dave = token + "_dave";
        final Long ownerAlphaId = ownerRepository.create(new OwnerPojo().setName(token + "_owner_alpha"))
            .block().getId();
        // alice authored on entity A; dave authored on entity B. Initially owner_alpha maps to alice.
        seedActivity(seedEntity(), alice);
        seedActivity(seedEntity(), dave);
        userOwnerMappingRepository.createRelation(alice, PROVIDER, ownerAlphaId).block();

        // Pre-churn: BOTH filters find alice's row.
        assertThat(actorsByUserId(ownerAlphaId))
            .as("pre-churn, the deprecated user_ids filter resolves owner_alpha -> alice")
            .containsExactly(alice);
        assertThat(actorsByUsername(alice)).containsExactly(alice);

        // Churn: re-associate owner_alpha from alice to dave (soft-delete alice's mapping, add dave's).
        userOwnerMappingRepository.deleteRelation(alice, PROVIDER).block();
        userOwnerMappingRepository.createRelation(dave, PROVIDER, ownerAlphaId).block();

        // Post-churn: the deprecated user_ids filter now RE-ATTRIBUTES to dave (the bug #1657 reports)...
        assertThat(actorsByUserId(ownerAlphaId))
            .as("post-churn, the user_ids filter on the SAME owner id now returns a DIFFERENT actor (dave) — "
                + "the re-attribution defect the issue describes")
            .containsExactly(dave);
        // ...while the username filter still returns exactly alice's history (the fix: immutable attribution).
        assertThat(actorsByUsername(alice))
            .as("the usernames filter keys on the recorded actor identity, so it is invariant under "
                + "user-owner association changes")
            .containsExactly(alice);
    }

    @Test
    @DisplayName("getActivityUsers lists DISTINCT actor usernames (incl. unmapped), enriched with the current owner")
    void getActivityUsersListsDistinctActorsWithCurrentOwnerEnrichment() {
        final String alice = token + "_alice";
        final String bob = token + "_bob_unmapped";
        final Long ownerAlphaId = ownerRepository.create(new OwnerPojo().setName(token + "_owner_alpha"))
            .block().getId();
        final Long entity = seedEntity();
        seedActivity(entity, alice);
        seedActivity(entity, alice); // a second alice event — must collapse to ONE listed user (DISTINCT)
        seedActivity(entity, bob);
        seedActivity(entity, null);  // ingestion/anonymous event — created_by NULL must be excluded
        userOwnerMappingRepository.createRelation(alice, PROVIDER, ownerAlphaId).block();

        // Scope the enumeration to THIS test's actors via the query substring (methods share the DB).
        final Page<AssociatedOwnerDto> page = activityRepository.getActivityUsers(1, 30, token).block();

        assertThat(page.getTotal())
            .as("two distinct non-null actors (alice, bob); the duplicate alice and the null actor add no rows")
            .isEqualTo(2L);
        assertThat(page.getData()).extracting(AssociatedOwnerDto::username)
            .containsExactlyInAnyOrder(alice, bob);
        // alice carries her current owner binding for display; the unmapped actor carries no owner.
        assertThat(ownerNameOf(page, alice)).isEqualTo(token + "_owner_alpha");
        assertThat(ownerOf(page, bob)).isNull();

        // the query substring narrows the enumeration further
        final Page<AssociatedOwnerDto> filtered = activityRepository.getActivityUsers(1, 30, alice).block();
        assertThat(filtered.getData()).extracting(AssociatedOwnerDto::username).containsExactly(alice);
    }

    private List<String> actorsByUsername(final String username) {
        return activityRepository.findAllActivities(begin, end, 100, null, null, List.of(), List.of(), List.of(),
                List.of(username), null, null, null)
            .map(dto -> dto.activity().getCreatedBy()).collectList().block();
    }

    private List<String> actorsByUserId(final Long ownerId) {
        return activityRepository.findAllActivities(begin, end, 100, null, null, List.of(), List.of(),
                List.of(ownerId), List.of(), null, null, null)
            .map(dto -> dto.activity().getCreatedBy()).collectList().block();
    }

    private static OwnerPojo ownerOf(final Page<AssociatedOwnerDto> page, final String username) {
        return page.getData().stream().filter(d -> username.equals(d.username())).findFirst().orElseThrow().owner();
    }

    private static String ownerNameOf(final Page<AssociatedOwnerDto> page, final String username) {
        return ownerOf(page, username).getName();
    }
}
