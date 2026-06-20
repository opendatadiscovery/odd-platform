package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.alert.AlertDto;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertChunkPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagToDataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TitlePojo;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * BEHAVIORAL Testcontainers test for the filterable alert listing introduced for the Alerts-view hardening
 * (#1763 / CTRIB-025). Exercises {@code ReactiveAlertRepositoryImpl}'s new {@code listAllAlerts} /
 * {@code listMyAlerts} / {@code listDependentAlerts} / {@code getAlertsByDataEntityId} + their {@code count*}
 * siblings against a real Postgres, proving:
 * <ul>
 *   <li>the <b>status filter</b> (the #1763 core): {@code status=OPEN} hides resolved alerts, {@code RESOLVED}
 *       surfaces only resolved, {@code null} returns every status — the behaviour the legacy hard-coded
 *       {@code WHERE status=OPEN} made impossible;</li>
 *   <li>the period / datasource / namespace facet filters select the right rows;</li>
 *   <li>the tag+owner EXISTS semi-joins do <b>not</b> fan out a row by (matching tags x matching owners) —
 *       the PLT-176 class the Activity feed already guards (list AND count);</li>
 *   <li>ordering is newest-first by {@code last_created_at};</li>
 *   <li>the my-objects (owner-scoped), dependent (oddrn-scoped) and per-entity scopes.</li>
 * </ul>
 * Every assertion is scoped to a freshly-created, unique data source so it is robust against any alerts left
 * by other tests sharing the container.
 *
 * @validates F-007
 * @validates F-126
 * @regresses 1763
 */
@DisplayName("Filterable alert listing (#1763)")
class ReactiveAlertRepositoryFilterTest extends BaseIntegrationTest {

    @Autowired
    private ReactiveAlertRepository alertRepository;
    @Autowired
    private ReactiveDataEntityRepository dataEntityRepository;
    @Autowired
    private ReactiveDataSourceRepository dataSourceRepository;
    @Autowired
    private ReactiveNamespaceRepository namespaceRepository;
    @Autowired
    private ReactiveTagRepository tagRepository;
    @Autowired
    private ReactiveOwnerRepository ownerRepository;
    @Autowired
    private ReactiveOwnershipRepository ownershipRepository;
    @Autowired
    private ReactiveTitleRepository titleRepository;

    private static final int SIZE = 100;
    private static final int PAGE = 1;

    // A scoped fixture: data source DS1 (namespace NS1) carries entity E1 with three alerts (open / resolved /
    // open, oldest->newest) plus two tags and two owners; data source DS2 (namespace NS2) carries entity E2 with
    // a single open alert. Ids are unique per run so the absolute assertions below are not polluted by the
    // shared container.
    private record Fixture(long ds1, long ns1, long ds2, long ns2, String e1Oddrn, String e2Oddrn,
                           long e1Id, long openId, long resolvedId, long open2Id, long a4Id,
                           List<Long> tagIds, long ownerId1, LocalDateTime base) {
    }

    private Fixture seedFixture() {
        final LocalDateTime base = DateTimeUtil.generateNow();

        final long ns1 = namespaceRepository.createByName(uuid()).block().getId();
        final long ns2 = namespaceRepository.createByName(uuid()).block().getId();
        final long ds1 = dataSourceRepository.create(
            new DataSourcePojo().setOddrn(uuid()).setName(uuid()).setNamespaceId(ns1)).block().getId();
        final long ds2 = dataSourceRepository.create(
            new DataSourcePojo().setOddrn(uuid()).setName(uuid()).setNamespaceId(ns2)).block().getId();

        final String e1Oddrn = uuid();
        final String e2Oddrn = uuid();
        final long e1Id = dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()
            .setOddrn(e1Oddrn).setExternalName(uuid()).setDataSourceId(ds1).setNamespaceId(ns1)))
            .collectList().block().get(0).getId();
        dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()
            .setOddrn(e2Oddrn).setExternalName(uuid()).setDataSourceId(ds2).setNamespaceId(ns2)))
            .collectList().block();

        // two tags + two owners on E1 — the fan-out fixture
        final List<TagPojo> tags = tagRepository.bulkCreate(List.of(
                new TagPojo().setName(uuid()).setImportant(false),
                new TagPojo().setName(uuid()).setImportant(false)))
            .collectList().block();
        tagRepository.createDataEntityRelations(tags.stream()
            .map(t -> new TagToDataEntityPojo().setTagId(t.getId()).setDataEntityId(e1Id)).toList()).blockLast();
        final long titleId = titleRepository.create(new TitlePojo().setName(uuid())).block().getId();
        final long ownerId1 = ownerRepository.create(new OwnerPojo().setName(uuid())).block().getId();
        final long ownerId2 = ownerRepository.create(new OwnerPojo().setName(uuid())).block().getId();
        ownershipRepository.create(new OwnershipPojo().setDataEntityId(e1Id).setOwnerId(ownerId1).setTitleId(titleId))
            .block();
        ownershipRepository.create(new OwnershipPojo().setDataEntityId(e1Id).setOwnerId(ownerId2).setTitleId(titleId))
            .block();

        final long openId = seedAlert(e1Oddrn, AlertStatusEnum.OPEN, AlertTypeEnum.BACKWARDS_INCOMPATIBLE_SCHEMA,
            base.minusMinutes(9));
        final long resolvedId = seedAlert(e1Oddrn, AlertStatusEnum.RESOLVED, AlertTypeEnum.FAILED_DQ_TEST,
            base.minusMinutes(6));
        final long open2Id = seedAlert(e1Oddrn, AlertStatusEnum.OPEN, AlertTypeEnum.FAILED_JOB,
            base.minusMinutes(1));
        final long a4Id = seedAlert(e2Oddrn, AlertStatusEnum.OPEN, AlertTypeEnum.DISTRIBUTION_ANOMALY, base);

        return new Fixture(ds1, ns1, ds2, ns2, e1Oddrn, e2Oddrn, e1Id, openId, resolvedId, open2Id, a4Id,
            tags.stream().map(TagPojo::getId).toList(), ownerId1, base);
    }

    @Test
    @DisplayName("status filter: OPEN hides resolved, RESOLVED shows only resolved, null shows every status")
    void statusFilter_selectsByStatus_andOrdersNewestFirst() {
        final Fixture f = seedFixture();

        // null status, scoped to DS1: all three of E1's alerts, newest-first (open2 -> resolved -> open)
        final List<AlertDto> all = alertRepository
            .listAllAlerts(null, null, f.ds1(), null, null, null, null, PAGE, SIZE)
            .collectList().block();
        assertThat(ids(all)).containsExactly(f.open2Id(), f.resolvedId(), f.openId());

        // OPEN: the resolved alert is gone (the legacy behaviour) — but now it is reachable via RESOLVED below
        assertThat(ids(alertRepository
            .listAllAlerts(null, null, f.ds1(), null, null, null, AlertStatusEnum.OPEN, PAGE, SIZE)
            .collectList().block()))
            .containsExactly(f.open2Id(), f.openId())
            .doesNotContain(f.resolvedId());

        // RESOLVED: only the resolved alert — the #1763 fix (resolved alerts reachable on the global list)
        assertThat(ids(alertRepository
            .listAllAlerts(null, null, f.ds1(), null, null, null, AlertStatusEnum.RESOLVED, PAGE, SIZE)
            .collectList().block()))
            .containsExactly(f.resolvedId());

        assertThat(alertRepository.countAllAlerts(null, null, f.ds1(), null, null, null, AlertStatusEnum.OPEN).block())
            .isEqualTo(2L);
        assertThat(alertRepository.countAllAlerts(null, null, f.ds1(), null, null, null, null).block())
            .isEqualTo(3L);
    }

    @Test
    @DisplayName("datasource + namespace + period facets select the right alerts")
    void facetFilters_datasourceNamespacePeriod() {
        final Fixture f = seedFixture();

        // datasource DS2 / namespace NS2 isolate E2's single alert
        assertThat(ids(alertRepository.listAllAlerts(null, null, f.ds2(), null, null, null, null, PAGE, SIZE)
            .collectList().block())).containsExactly(f.a4Id());
        assertThat(ids(alertRepository.listAllAlerts(null, null, null, f.ns2(), null, null, null, PAGE, SIZE)
            .collectList().block())).containsExactly(f.a4Id());
        assertThat(ids(alertRepository.listAllAlerts(null, null, null, f.ns1(), null, null, null, PAGE, SIZE)
            .collectList().block())).containsExactly(f.open2Id(), f.resolvedId(), f.openId());

        // period: begin 3 minutes ago drops the 9- and 6-minute-old alerts, keeps the 1-minute-old one
        final OffsetDateTime begin = f.base().minusMinutes(3).atOffset(ZoneOffset.UTC);
        assertThat(ids(alertRepository.listAllAlerts(begin, null, f.ds1(), null, null, null, null, PAGE, SIZE)
            .collectList().block())).containsExactly(f.open2Id());
    }

    @Test
    @DisplayName("tag+owner filters do not fan out a row by (matching tags x matching owners) — list AND count")
    void tagOwnerFilters_doNotMultiplyAlerts() {
        final Fixture f = seedFixture();

        // E1 carries 2 matching tags x 2 matching owners; a LEFT-JOIN filter would return each of its 3 alerts
        // 4x (=12). The EXISTS semi-joins return each once (=3).
        final List<AlertDto> rows = alertRepository
            .listAllAlerts(null, null, null, null, f.tagIds(), List.of(f.ownerId1()), null, PAGE, SIZE)
            .collectList().block();
        assertThat(ids(rows)).containsExactly(f.open2Id(), f.resolvedId(), f.openId());

        assertThat(alertRepository
            .countAllAlerts(null, null, null, null, f.tagIds(), List.of(f.ownerId1()), null).block())
            .as("count must equal the distinct alert count, not the fanned-out count")
            .isEqualTo(3L);
    }

    @Test
    @DisplayName("per-entity, my-objects (owner-scoped) and dependent (oddrn-scoped) listings + counts")
    void scopes_perEntity_myObjects_dependent() {
        final Fixture f = seedFixture();

        // per-entity: E1's three alerts, newest-first; status filter still applies
        assertThat(ids(alertRepository.getAlertsByDataEntityId(f.e1Id(), null, null, null, PAGE, SIZE)
            .collectList().block())).containsExactly(f.open2Id(), f.resolvedId(), f.openId());
        assertThat(ids(alertRepository
            .getAlertsByDataEntityId(f.e1Id(), null, null, AlertStatusEnum.RESOLVED, PAGE, SIZE)
            .collectList().block())).containsExactly(f.resolvedId());

        // my-objects: owner1 owns E1, so all three of E1's alerts are in scope
        assertThat(ids(alertRepository
            .listMyAlerts(null, null, f.ds1(), null, null, null, null, f.ownerId1(), PAGE, SIZE)
            .collectList().block())).containsExactly(f.open2Id(), f.resolvedId(), f.openId());
        assertThat(alertRepository
            .countMyAlerts(null, null, f.ds1(), null, null, null, null, f.ownerId1()).block()).isEqualTo(3L);

        // dependent: oddrn-scoped to E1
        assertThat(ids(alertRepository
            .listDependentAlerts(null, null, f.ds1(), null, null, null, null, List.of(f.e1Oddrn()), PAGE, SIZE)
            .collectList().block())).containsExactly(f.open2Id(), f.resolvedId(), f.openId());
        assertThat(alertRepository
            .countDependentAlerts(null, null, f.ds1(), null, null, null, null, List.of(f.e1Oddrn())).block())
            .isEqualTo(3L);
    }

    private long seedAlert(final String oddrn, final AlertStatusEnum status, final AlertTypeEnum type,
                           final LocalDateTime lastCreatedAt) {
        final long alertId = alertRepository.createAlerts(List.of(new AlertPojo()
                .setDataEntityOddrn(oddrn)
                .setStatus(status.getCode())
                .setType(type.getCode())
                .setLastCreatedAt(lastCreatedAt)
                .setStatusUpdatedAt(lastCreatedAt)))
            .collectList().block().get(0).getId();
        // the alert list INNER-JOINs alert_chunk, so an alert with no chunk is invisible
        alertRepository.createChunks(List.of(new AlertChunkPojo()
            .setAlertId(alertId).setDescription(uuid()).setCreatedAt(lastCreatedAt))).block();
        return alertId;
    }

    private static List<Long> ids(final List<AlertDto> alerts) {
        return alerts.stream().map(a -> a.getAlert().getId()).toList();
    }

    private static String uuid() {
        return UUID.randomUUID().toString();
    }
}
