package org.opendatadiscovery.oddplatform.repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.alert.AlertDto;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LineagePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnershipPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveAlertRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnershipRepository;
import org.opendatadiscovery.oddplatform.service.LineageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.annotation.DirtiesContext;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

class AlertRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private ReactiveAlertRepository alertRepository;

    @Autowired
    private DataEntityRepository dataEntityRepository;

    @Autowired
    private ReactiveOwnershipRepository ownershipRepository;

    @Autowired
    private ReactiveOwnerRepository ownerRepository;

    @Autowired
    private LineageRepository lineageRepository;

    @Autowired
    private LineageService lineageService;

    @Test
    @DisplayName("Test creates alerts, expecting alerts in the database")
    void createAlertsTest() {
        final DataEntityPojo dataEntityPojo = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString()))).get(0);
        final AlertPojo firstAlert = createAlertPojo(dataEntityPojo.getOddrn());

        final Mono<List<AlertPojo>> createdAlerts = alertRepository.createAlerts(List.of(firstAlert));

        createdAlerts.as(StepVerifier::create)
            .assertNext(alertPojos -> assertThat(alertPojos)
                .hasSize(1)
                .allSatisfy(alertPojo -> {
                    assertThat(alertPojo.getId()).isNotNull();
                    assertThat(alertPojo.getDescription()).isEqualTo(firstAlert.getDescription());
                    assertThat(alertPojo.getType()).isEqualTo(firstAlert.getType());
                    assertThat(alertPojo.getStatusUpdatedAt()).isNotNull();
                    assertThat(alertPojo.getCreatedAt()).isNotNull();
                    assertThat(alertPojo.getDataEntityOddrn()).isEqualTo(firstAlert.getDataEntityOddrn());
                    assertThat(alertPojo.getMessengerEntityOddrn()).isEqualTo(firstAlert.getMessengerEntityOddrn());
                    assertThat(alertPojo.getStatusUpdatedBy()).isEqualTo(firstAlert.getStatusUpdatedBy());
                })
            )
            .verifyComplete();
    }

    @Test
    @DisplayName("Test updates alert, expecting alert is updated successfully")
    void updateAlertStatusTest() {
        final DataEntityPojo dataEntityPojo = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString()))).get(0);
        final AlertPojo firstAlert = createAlertPojo(dataEntityPojo.getOddrn());
        final AlertPojo alertPojo = alertRepository.createAlerts(List.of(firstAlert)).block().get(0);
        final String updatingUser = "user";

        alertRepository.updateAlertStatus(alertPojo.getId(), AlertStatusEnum.RESOLVED, updatingUser)
            .as(StepVerifier::create)
            .assertNext(r -> {
                assertThat(r.getStatusUpdatedBy()).isEqualTo(updatingUser);
                assertThat(r.getStatusUpdatedAt()).isAfter(alertPojo.getStatusUpdatedAt());
                assertThat(r.getStatus()).isEqualTo(AlertStatusEnum.RESOLVED.name());
                assertThat(r)
                    .usingRecursiveComparison()
                    .ignoringFields("statusUpdatedAt", "statusUpdatedBy", "status")
                    .isEqualTo(alertPojo);
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("Test get alerts, expecting all alerts with status open")
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.BEFORE_METHOD)
    void listAllWithStatusOpenTest() {
        final DataEntityPojo dataEntityPojo = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString()))).get(0);
        final List<AlertPojo> openPojos = createAlertPojos(dataEntityPojo.getOddrn(), AlertStatusEnum.OPEN, 7);
        final List<AlertPojo> resolvedPojos = createAlertPojos(dataEntityPojo.getOddrn(),
            AlertStatusEnum.RESOLVED, 3);

        alertRepository.createAlerts(openPojos).as(StepVerifier::create)
            .assertNext(a -> assertThat(a).hasSize(7))
            .verifyComplete();
        alertRepository.createAlerts(resolvedPojos).as(StepVerifier::create)
            .assertNext(a -> assertThat(a).hasSize(3))
            .verifyComplete();
        final Comparator<AlertDto> comparator = getAlertsComparator();

        alertRepository.listAllWithStatusOpen(1, 4)
            .as(StepVerifier::create)
            .assertNext(firstPage -> assertThat(firstPage.getData())
                .hasSize(4)
                .isSortedAccordingTo(comparator)
                .extracting(dto -> dto.getAlert().getStatus())
                .containsOnly(AlertStatusEnum.OPEN.name()))
            .verifyComplete();
        alertRepository.listAllWithStatusOpen(2, 4).as(StepVerifier::create)
            .assertNext(secondPage -> assertThat(secondPage.getData())
                .hasSize(3)
                .isSortedAccordingTo(comparator)
                .extracting(dto -> dto.getAlert().getStatus())
                .containsOnly(AlertStatusEnum.OPEN.name()))
            .verifyComplete();
    }

    @Test
    @DisplayName("Test get alerts, expecting all alerts with status open for certain owner")
    void listByOwnerTest() {
        final DataEntityPojo dataEntityPojo = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString()))).get(0);
        final OwnerPojo ownerPojo = ownerRepository.create(new OwnerPojo().setName(UUID.randomUUID().toString()))
            .blockOptional()
            .orElseThrow();
        final OwnershipPojo ownershipPojo = createOwnershipPojo(ownerPojo.getId(), dataEntityPojo.getId());
        ownershipRepository.create(ownershipPojo).block();

        final List<AlertPojo> openPojos = createAlertPojos(dataEntityPojo.getOddrn(), AlertStatusEnum.OPEN, 4);
        final List<AlertPojo> resolvedPojos = createAlertPojos(dataEntityPojo.getOddrn(),
            AlertStatusEnum.RESOLVED, 3);
        alertRepository.createAlerts(openPojos).as(StepVerifier::create)
            .assertNext(a -> assertThat(a).hasSize(4))
            .verifyComplete();
        alertRepository.createAlerts(resolvedPojos).as(StepVerifier::create)
            .assertNext(a -> assertThat(a).hasSize(3))
            .verifyComplete();
        final Comparator<AlertDto> comparator = getAlertsComparator();

        alertRepository.listByOwner(1, 3, ownerPojo.getId()).as(StepVerifier::create)
            .assertNext(firstPage -> assertThat(firstPage.getData())
                .hasSize(3)
                .isSortedAccordingTo(comparator)
                .extracting(dto -> dto.getAlert().getStatus())
                .containsOnly(AlertStatusEnum.OPEN.name()))
            .verifyComplete();
        alertRepository.listByOwner(2, 3, ownerPojo.getId()).as(StepVerifier::create)
            .assertNext(secondPage -> assertThat(secondPage.getData())
                .hasSize(1)
                .isSortedAccordingTo(comparator)
                .extracting(dto -> dto.getAlert().getStatus())
                .containsOnly(AlertStatusEnum.OPEN.name()))
            .verifyComplete();
    }

    @Test
    @DisplayName("Test get alerts, expecting all alerts for certain data entity id")
    void getDataEntityAlertsTest() {
        final DataEntityPojo dataEntityPojo = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString()))).get(0);
        final List<AlertPojo> openPojos = createAlertPojos(dataEntityPojo.getOddrn(), AlertStatusEnum.OPEN, 4);
        final List<AlertPojo> resolvedPojos = createAlertPojos(dataEntityPojo.getOddrn(),
            AlertStatusEnum.RESOLVED, 3);
        final List<AlertPojo> resolvedAlerts = alertRepository.createAlerts(resolvedPojos).block();
        final List<AlertPojo> openAlerts = alertRepository.createAlerts(openPojos).block();

        alertRepository.getAlertsByDataEntityId(dataEntityPojo.getId())
            .as(StepVerifier::create)
            .assertNext(a -> {
                assertThat(a)
                    .hasSize(7)
                    .extracting(AlertDto::getAlert)
                    .containsAll(openAlerts)
                    .containsAll(resolvedAlerts);
                assertThat(a)
                    .extracting(AlertDto::getDataEntity)
                    .containsOnly(dataEntityPojo);
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("Test get alerts, expecting all alerts which are dependent")
    void listDependentObjectsAlertsTest() {
        final List<DataEntityPojo> dataEntityPojos = dataEntityRepository.bulkCreate(
            List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString()),
                new DataEntityPojo().setOddrn(UUID.randomUUID().toString()),
                new DataEntityPojo().setOddrn(UUID.randomUUID().toString()),
                new DataEntityPojo().setOddrn(UUID.randomUUID().toString())
            ));
        final OwnerPojo ownerPojo = ownerRepository.create(new OwnerPojo().setName(UUID.randomUUID().toString()))
            .blockOptional()
            .orElseThrow();
        final OwnershipPojo ownershipPojo = createOwnershipPojo(ownerPojo.getId(), dataEntityPojos.get(2).getId());
        ownershipRepository.create(ownershipPojo).block();

        final LineagePojo firstLineagePojo =
            createLineagePojo(dataEntityPojos.get(0).getOddrn(), dataEntityPojos.get(1).getOddrn());
        final LineagePojo secondLineagePojo =
            createLineagePojo(dataEntityPojos.get(1).getOddrn(), dataEntityPojos.get(2).getOddrn());
        final LineagePojo thirdLineagePojo =
            createLineagePojo(dataEntityPojos.get(2).getOddrn(), dataEntityPojos.get(3).getOddrn());
        lineageService.replaceLineagePaths(List.of(firstLineagePojo, secondLineagePojo, thirdLineagePojo)).blockLast();
        final List<AlertPojo> alerts = alertRepository.createAlerts(List.of(
            createAlertPojo(dataEntityPojos.get(0).getOddrn()), createAlertPojo(dataEntityPojos.get(1).getOddrn()),
            createAlertPojo(dataEntityPojos.get(2).getOddrn()), createAlertPojo(dataEntityPojos.get(3).getOddrn())
        )).block();
        final List<String> objByOwnerList = alertRepository.getObjectsOddrnsByOwner(ownerPojo.getId()).block();

        alertRepository.listDependentObjectsAlerts(1, 10, objByOwnerList).as(StepVerifier::create)
            .assertNext(a -> {
                assertThat(a.getData())
                    .hasSize(2)
                    .extracting(AlertDto::getDataEntity)
                    .containsOnly(dataEntityPojos.get(0), dataEntityPojos.get(1));
                assertThat(a.getData())
                    .hasSize(2)
                    .extracting(AlertDto::getAlert)
                    .containsOnly(
                        findOpenAlertByEntityOddrn(alerts, dataEntityPojos.get(0).getOddrn()),
                        findOpenAlertByEntityOddrn(alerts, dataEntityPojos.get(1).getOddrn())
                    );
            }).verifyComplete();
    }

    @Test
    @DisplayName("Test get alerts, expecting all alerts which are dependent")
    void listDependentObjectsAlertsMultipleEntitiesTest() {
        final List<DataEntityPojo> dataEntityPojos = dataEntityRepository.bulkCreate(
            List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString()),
                new DataEntityPojo().setOddrn(UUID.randomUUID().toString()),
                new DataEntityPojo().setOddrn(UUID.randomUUID().toString()),
                new DataEntityPojo().setOddrn(UUID.randomUUID().toString()),
                new DataEntityPojo().setOddrn(UUID.randomUUID().toString()),
                new DataEntityPojo().setOddrn(UUID.randomUUID().toString()),
                new DataEntityPojo().setOddrn(UUID.randomUUID().toString()),
                new DataEntityPojo().setOddrn(UUID.randomUUID().toString())
            ));
        final OwnerPojo ownerPojo = ownerRepository.create(new OwnerPojo().setName(UUID.randomUUID().toString()))
            .blockOptional()
            .orElseThrow();
        ownershipRepository.create(createOwnershipPojo(ownerPojo.getId(), dataEntityPojos.get(2).getId())).block();
        ownershipRepository.create(createOwnershipPojo(ownerPojo.getId(), dataEntityPojos.get(5).getId())).block();
        ownershipRepository.create(createOwnershipPojo(ownerPojo.getId(), dataEntityPojos.get(6).getId())).block();

        lineageService.replaceLineagePaths(List.of(
            createLineagePojo(dataEntityPojos.get(0).getOddrn(), dataEntityPojos.get(2).getOddrn()),
            createLineagePojo(dataEntityPojos.get(2).getOddrn(), dataEntityPojos.get(3).getOddrn()),
            createLineagePojo(dataEntityPojos.get(3).getOddrn(), dataEntityPojos.get(5).getOddrn()),
            createLineagePojo(dataEntityPojos.get(5).getOddrn(), dataEntityPojos.get(7).getOddrn()),
            createLineagePojo(dataEntityPojos.get(1).getOddrn(), dataEntityPojos.get(4).getOddrn()),
            createLineagePojo(dataEntityPojos.get(4).getOddrn(), dataEntityPojos.get(5).getOddrn()),
            createLineagePojo(dataEntityPojos.get(4).getOddrn(), dataEntityPojos.get(6).getOddrn())
        )).blockLast();

        final Collection<AlertPojo> alerts = alertRepository.createAlerts(List.of(
            createAlertPojo(dataEntityPojos.get(0).getOddrn()), createAlertPojo(dataEntityPojos.get(1).getOddrn()),
            createAlertPojo(dataEntityPojos.get(2).getOddrn()), createAlertPojo(dataEntityPojos.get(3).getOddrn()),
            createAlertPojo(dataEntityPojos.get(4).getOddrn()), createAlertPojo(dataEntityPojos.get(5).getOddrn()),
            createAlertPojo(dataEntityPojos.get(6).getOddrn()), createAlertPojo(dataEntityPojos.get(7).getOddrn()),
            createAlertPojo(dataEntityPojos.get(0).getOddrn(), AlertStatusEnum.RESOLVED),
            createAlertPojo(dataEntityPojos.get(4).getOddrn(), AlertStatusEnum.RESOLVED)
        )).block();
        final List<String> objByOwnerList = alertRepository.getObjectsOddrnsByOwner(ownerPojo.getId()).block();

        alertRepository.listDependentObjectsAlerts(1, 10, objByOwnerList).as(StepVerifier::create)
            .assertNext(a -> {
                assertThat(a.getData())
                    .hasSize(4)
                    .extracting(AlertDto::getDataEntity)
                    .containsOnly(dataEntityPojos.get(0), dataEntityPojos.get(1),
                        dataEntityPojos.get(3), dataEntityPojos.get(4));
                assertThat(a.getData())
                    .hasSize(4)
                    .extracting(AlertDto::getAlert)
                    .containsOnly(
                        findOpenAlertByEntityOddrn(alerts, dataEntityPojos.get(0).getOddrn()),
                        findOpenAlertByEntityOddrn(alerts, dataEntityPojos.get(1).getOddrn()),
                        findOpenAlertByEntityOddrn(alerts, dataEntityPojos.get(3).getOddrn()),
                        findOpenAlertByEntityOddrn(alerts, dataEntityPojos.get(4).getOddrn())
                    );
            }).verifyComplete();
    }

    @Test
    @DisplayName("Test count alerts, expecting certain amount of alerts with status open")
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.BEFORE_METHOD)
    void countAlertsWithStatusOpenTest() {
        final DataEntityPojo dataEntityPojo = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString()))).get(0);
        final List<AlertPojo> openPojos = createAlertPojos(dataEntityPojo.getOddrn(), AlertStatusEnum.OPEN, 7);
        final List<AlertPojo> resolvedPojos = createAlertPojos(dataEntityPojo.getOddrn(),
            AlertStatusEnum.RESOLVED, 3);
        alertRepository.createAlerts(openPojos).as(StepVerifier::create)
            .assertNext(a -> assertThat(a).hasSize(7))
            .verifyComplete();
        alertRepository.createAlerts(resolvedPojos).as(StepVerifier::create)
            .assertNext(a -> assertThat(a).hasSize(3))
            .verifyComplete();

        alertRepository.countAlertsWithStatusOpen()
            .as(StepVerifier::create)
            .assertNext(a -> assertThat(a).isEqualTo(7L))
            .verifyComplete();
    }

    @Test
    @DisplayName("Test count alerts, expecting certain amount of alerts with status open for certain owner")
    void countAlertsWithStatusOpenByOwnerTest() {
        final DataEntityPojo dataEntityPojo = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString()))).get(0);
        final OwnerPojo ownerPojo = ownerRepository.create(new OwnerPojo().setName(UUID.randomUUID().toString()))
            .blockOptional()
            .orElseThrow();
        final OwnershipPojo ownershipPojo = createOwnershipPojo(ownerPojo.getId(), dataEntityPojo.getId());
        ownershipRepository.create(ownershipPojo).block();

        final List<AlertPojo> openPojos = createAlertPojos(dataEntityPojo.getOddrn(), AlertStatusEnum.OPEN, 4);
        final List<AlertPojo> resolvedPojos = createAlertPojos(dataEntityPojo.getOddrn(),
            AlertStatusEnum.RESOLVED, 3);
        alertRepository.createAlerts(openPojos).as(StepVerifier::create)
            .assertNext(a -> assertThat(a).hasSize(4))
            .verifyComplete();
        alertRepository.createAlerts(resolvedPojos).as(StepVerifier::create)
            .assertNext(a -> assertThat(a).hasSize(3))
            .verifyComplete();

        alertRepository.countAlertsWithStatusOpenByOwner(ownerPojo.getId())
            .as(StepVerifier::create)
            .assertNext(a -> assertThat(a).isEqualTo(4L))
            .verifyComplete();
    }

    @Test
    @DisplayName("Test count alerts, expecting certain amount of alerts of dependent objects")
    void countDependentObjectsAlertsTest() {
        final List<DataEntityPojo> dataEntityPojos = dataEntityRepository.bulkCreate(
            List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString()),
                new DataEntityPojo().setOddrn(UUID.randomUUID().toString()),
                new DataEntityPojo().setOddrn(UUID.randomUUID().toString()),
                new DataEntityPojo().setOddrn(UUID.randomUUID().toString())
            ));
        final OwnerPojo ownerPojo = ownerRepository.create(new OwnerPojo().setName(UUID.randomUUID().toString()))
            .blockOptional()
            .orElseThrow();
        final OwnershipPojo ownershipPojo = createOwnershipPojo(ownerPojo.getId(), dataEntityPojos.get(2).getId());
        ownershipRepository.create(ownershipPojo).block();

        final LineagePojo firstLineagePojo =
            createLineagePojo(dataEntityPojos.get(0).getOddrn(), dataEntityPojos.get(1).getOddrn());
        final LineagePojo secondLineagePojo =
            createLineagePojo(dataEntityPojos.get(1).getOddrn(), dataEntityPojos.get(2).getOddrn());
        final LineagePojo thirdLineagePojo =
            createLineagePojo(dataEntityPojos.get(2).getOddrn(), dataEntityPojos.get(3).getOddrn());
        lineageService.replaceLineagePaths(List.of(firstLineagePojo, secondLineagePojo, thirdLineagePojo)).blockLast();
        alertRepository.createAlerts(List.of(
            createAlertPojo(dataEntityPojos.get(0).getOddrn()), createAlertPojo(dataEntityPojos.get(1).getOddrn()),
            createAlertPojo(dataEntityPojos.get(2).getOddrn()), createAlertPojo(dataEntityPojos.get(3).getOddrn())
        )).block();
        final List<String> objByOwnerList = alertRepository.getObjectsOddrnsByOwner(ownerPojo.getId()).block();

        alertRepository.countDependentObjectsAlerts(objByOwnerList)
            .as(StepVerifier::create)
            .assertNext(a -> assertThat(a).isEqualTo(2L))
            .verifyComplete();
    }

    private List<AlertPojo> createAlertPojos(final String dataEntityOddrn,
                                             final AlertStatusEnum statusEnum,
                                             final int count) {
        return IntStream.rangeClosed(1, count)
            .mapToObj(i -> createAlertPojo(dataEntityOddrn, statusEnum))
            .toList();
    }

    private AlertPojo createAlertPojo(final String dataEntityOddrn) {
        return createAlertPojo(dataEntityOddrn, AlertStatusEnum.OPEN);
    }

    private AlertPojo createAlertPojo(final String dataEntityOddrn, final AlertStatusEnum status) {
        return new AlertPojo()
            .setType(AlertTypeEnum.BACKWARDS_INCOMPATIBLE_SCHEMA.name())
            .setDescription(UUID.randomUUID().toString())
            .setStatus(status.name())
            .setDataEntityOddrn(dataEntityOddrn)
            .setStatusUpdatedAt(LocalDateTime.now());
    }

    private Comparator<AlertDto> getAlertsComparator() {
        final Comparator<AlertDto> createdAtComparator = Comparator.comparing(dto -> dto.getAlert().getCreatedAt());
        final Comparator<AlertDto> reversedCreatedAtComparator = createdAtComparator.reversed();
        final Comparator<AlertDto> idComparator = reversedCreatedAtComparator
            .thenComparing(dto -> dto.getAlert().getId());
        return idComparator.reversed();
    }

    private LineagePojo createLineagePojo(final String parentOddrn, final String childOddrn) {
        return new LineagePojo().setParentOddrn(parentOddrn)
            .setChildOddrn(childOddrn)
            .setEstablisherOddrn(parentOddrn);
    }

    private AlertPojo findOpenAlertByEntityOddrn(final Collection<AlertPojo> alerts, final String entityOddrn) {
        return alerts.stream()
            .filter(a -> a.getDataEntityOddrn().equals(entityOddrn)
                && a.getStatus().equals(AlertStatusEnum.OPEN.name()))
            .findFirst()
            .orElseThrow();
    }

    private OwnershipPojo createOwnershipPojo(final Long ownerId, final Long dataEntityId) {
        final OwnershipPojo ownershipPojo = new OwnershipPojo();
        ownershipPojo.setDataEntityId(dataEntityId);
        ownershipPojo.setOwnerId(ownerId);
        return ownershipPojo;
    }
}
