package org.opendatadiscovery.oddplatform.repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;
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
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnershipRepository;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.annotation.DirtiesContext;

import static org.assertj.core.api.Assertions.assertThat;

public class AlertRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private DataEntityRepository dataEntityRepository;

    @Autowired
    private ReactiveOwnershipRepository ownershipRepository;

    @Autowired
    private ReactiveOwnerRepository ownerRepository;

    @Autowired
    private LineageRepository lineageRepository;

    @Test
    public void createAlertsTest() {
        final DataEntityPojo dataEntityPojo = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString()))).get(0);
        final AlertPojo firstAlert = createAlertPojo(dataEntityPojo.getOddrn());
        final AlertPojo secondAlert = createAlertPojo(dataEntityPojo.getOddrn());
        final Collection<AlertPojo> alerts = alertRepository.createAlerts(List.of(firstAlert, secondAlert));

        assertThat(alerts)
            .allMatch(p -> p.getId() != null)
            .usingElementComparatorIgnoringFields("id", "createdAt")
            .hasSameElementsAs(List.of(firstAlert, secondAlert));
    }

    @Test
    public void updateAlertStatusTest() {
        final DataEntityPojo dataEntityPojo = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString()))).get(0);
        final AlertPojo firstAlert = createAlertPojo(dataEntityPojo.getOddrn());
        final AlertPojo alertPojo = alertRepository.createAlerts(List.of(firstAlert)).stream()
            .findFirst().orElseThrow();
        final String updatingUser = "user";
        final AlertPojo updatedAlert = alertRepository
            .updateAlertStatus(alertPojo.getId(), AlertStatusEnum.RESOLVED, updatingUser);

        assertThat(updatedAlert.getStatusUpdatedBy()).isEqualTo(updatingUser);
        assertThat(updatedAlert.getStatusUpdatedAt()).isAfter(alertPojo.getStatusUpdatedAt());
        assertThat(updatedAlert.getStatus()).isEqualTo(AlertStatusEnum.RESOLVED.name());
        assertThat(updatedAlert)
            .usingRecursiveComparison()
            .ignoringFields("statusUpdatedAt", "statusUpdatedBy", "status")
            .isEqualTo(alertPojo);
    }

    @Test
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.BEFORE_METHOD)
    public void listAllTest() {
        final DataEntityPojo dataEntityPojo = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString()))).get(0);
        final List<AlertPojo> openPojos = createAlertPojos(dataEntityPojo.getOddrn(), AlertStatusEnum.OPEN, 7);
        final List<AlertPojo> resolvedPojos = createAlertPojos(dataEntityPojo.getOddrn(),
            AlertStatusEnum.RESOLVED, 3);
        alertRepository.createAlerts(openPojos);
        alertRepository.createAlerts(resolvedPojos);

        final Page<AlertDto> firstPage = alertRepository.listAll(1, 4);
        final Comparator<AlertDto> comparator = getAlertsComparator();

        assertThat(firstPage.getData())
            .hasSize(4)
            .isSortedAccordingTo(comparator)
            .extracting(dto -> dto.getAlert().getStatus())
            .containsOnly(AlertStatusEnum.OPEN.name());

        final Page<AlertDto> secondPage = alertRepository.listAll(2, 4);
        assertThat(secondPage.getData())
            .hasSize(3)
            .isSortedAccordingTo(comparator)
            .extracting(dto -> dto.getAlert().getStatus())
            .containsOnly(AlertStatusEnum.OPEN.name());
    }

    @Test
    public void listByOwnerTest() {
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
        alertRepository.createAlerts(openPojos);
        alertRepository.createAlerts(resolvedPojos);

        final Comparator<AlertDto> comparator = getAlertsComparator();
        final Page<AlertDto> firstPage = alertRepository.listByOwner(1, 3, ownerPojo.getId());
        assertThat(firstPage.getData())
            .hasSize(3)
            .isSortedAccordingTo(comparator)
            .extracting(dto -> dto.getAlert().getStatus())
            .containsOnly(AlertStatusEnum.OPEN.name());

        final Page<AlertDto> secondPage = alertRepository.listByOwner(2, 3, ownerPojo.getId());
        assertThat(secondPage.getData())
            .hasSize(1)
            .isSortedAccordingTo(comparator)
            .extracting(dto -> dto.getAlert().getStatus())
            .containsOnly(AlertStatusEnum.OPEN.name());
    }

    @Test
    public void getDataEntityAlertsTest() {
        final DataEntityPojo dataEntityPojo = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString()))).get(0);
        final List<AlertPojo> openPojos = createAlertPojos(dataEntityPojo.getOddrn(), AlertStatusEnum.OPEN, 4);
        final List<AlertPojo> resolvedPojos = createAlertPojos(dataEntityPojo.getOddrn(),
            AlertStatusEnum.RESOLVED, 3);
        final Collection<AlertPojo> openAlerts = alertRepository.createAlerts(openPojos);
        final Collection<AlertPojo> resolvedAlerts = alertRepository.createAlerts(resolvedPojos);

        final Collection<AlertDto> dataEntityAlerts = alertRepository.getDataEntityAlerts(dataEntityPojo.getId());
        assertThat(dataEntityAlerts)
            .hasSize(7)
            .extracting(AlertDto::getAlert)
            .containsAll(openAlerts)
            .containsAll(resolvedAlerts);
        assertThat(dataEntityAlerts)
            .extracting(AlertDto::getDataEntity)
            .containsOnly(dataEntityPojo);
    }

    @Test
    public void listDependentObjectsAlertsTest() {
        final List<DataEntityPojo> dataEntityPojos = dataEntityRepository.bulkCreate(
            List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString()),
                new DataEntityPojo().setOddrn(UUID.randomUUID().toString()),
                new DataEntityPojo().setOddrn(UUID.randomUUID().toString()),
                new DataEntityPojo().setOddrn(UUID.randomUUID().toString())
            ));
        final OwnerPojo ownerPojo = ownerRepository.create(new OwnerPojo().setName(UUID.randomUUID().toString()))
            .blockOptional()
            .orElseThrow();;
        final OwnershipPojo ownershipPojo = createOwnershipPojo(ownerPojo.getId(), dataEntityPojos.get(2).getId());
        ownershipRepository.create(ownershipPojo).block();

        final LineagePojo firstLineagePojo =
            createLineagePojo(dataEntityPojos.get(0).getOddrn(), dataEntityPojos.get(1).getOddrn());
        final LineagePojo secondLineagePojo =
            createLineagePojo(dataEntityPojos.get(1).getOddrn(), dataEntityPojos.get(2).getOddrn());
        final LineagePojo thirdLineagePojo =
            createLineagePojo(dataEntityPojos.get(2).getOddrn(), dataEntityPojos.get(3).getOddrn());
        lineageRepository.replaceLineagePaths(List.of(firstLineagePojo, secondLineagePojo, thirdLineagePojo));
        final Collection<AlertPojo> alerts = alertRepository.createAlerts(List.of(
            createAlertPojo(dataEntityPojos.get(0).getOddrn()), createAlertPojo(dataEntityPojos.get(1).getOddrn()),
            createAlertPojo(dataEntityPojos.get(2).getOddrn()), createAlertPojo(dataEntityPojos.get(3).getOddrn())
        ));

        final Page<AlertDto> alertDtoPage = alertRepository.listDependentObjectsAlerts(1, 10, ownerPojo.getId());
        assertThat(alertDtoPage.getData())
            .hasSize(2)
            .extracting(AlertDto::getDataEntity)
            .containsOnly(dataEntityPojos.get(0), dataEntityPojos.get(1));
        assertThat(alertDtoPage.getData())
            .hasSize(2)
            .extracting(AlertDto::getAlert)
            .containsOnly(
                findOpenAlertByEntityOddrn(alerts, dataEntityPojos.get(0).getOddrn()),
                findOpenAlertByEntityOddrn(alerts, dataEntityPojos.get(1).getOddrn())
            );
    }

    @Test
    public void listDependentObjectsAlertsMultipleEntitiesTest() {
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
            .orElseThrow();;
        ownershipRepository.create(createOwnershipPojo(ownerPojo.getId(), dataEntityPojos.get(2).getId())).block();
        ownershipRepository.create(createOwnershipPojo(ownerPojo.getId(), dataEntityPojos.get(5).getId())).block();
        ownershipRepository.create(createOwnershipPojo(ownerPojo.getId(), dataEntityPojos.get(6).getId())).block();

        lineageRepository.replaceLineagePaths(List.of(
            createLineagePojo(dataEntityPojos.get(0).getOddrn(), dataEntityPojos.get(2).getOddrn()),
            createLineagePojo(dataEntityPojos.get(2).getOddrn(), dataEntityPojos.get(3).getOddrn()),
            createLineagePojo(dataEntityPojos.get(3).getOddrn(), dataEntityPojos.get(5).getOddrn()),
            createLineagePojo(dataEntityPojos.get(5).getOddrn(), dataEntityPojos.get(7).getOddrn()),
            createLineagePojo(dataEntityPojos.get(1).getOddrn(), dataEntityPojos.get(4).getOddrn()),
            createLineagePojo(dataEntityPojos.get(4).getOddrn(), dataEntityPojos.get(5).getOddrn()),
            createLineagePojo(dataEntityPojos.get(4).getOddrn(), dataEntityPojos.get(6).getOddrn())
        ));

        final Collection<AlertPojo> alerts = alertRepository.createAlerts(List.of(
            createAlertPojo(dataEntityPojos.get(0).getOddrn()), createAlertPojo(dataEntityPojos.get(1).getOddrn()),
            createAlertPojo(dataEntityPojos.get(2).getOddrn()), createAlertPojo(dataEntityPojos.get(3).getOddrn()),
            createAlertPojo(dataEntityPojos.get(4).getOddrn()), createAlertPojo(dataEntityPojos.get(5).getOddrn()),
            createAlertPojo(dataEntityPojos.get(6).getOddrn()), createAlertPojo(dataEntityPojos.get(7).getOddrn()),
            createAlertPojo(dataEntityPojos.get(0).getOddrn(), AlertStatusEnum.RESOLVED),
            createAlertPojo(dataEntityPojos.get(4).getOddrn(), AlertStatusEnum.RESOLVED)
        ));

        final Page<AlertDto> alertDtoPage = alertRepository.listDependentObjectsAlerts(1, 10, ownerPojo.getId());
        assertThat(alertDtoPage.getData())
            .hasSize(4)
            .extracting(AlertDto::getDataEntity)
            .containsOnly(dataEntityPojos.get(0), dataEntityPojos.get(1),
                dataEntityPojos.get(3), dataEntityPojos.get(4));
        assertThat(alertDtoPage.getData())
            .hasSize(4)
            .extracting(AlertDto::getAlert)
            .containsOnly(
                findOpenAlertByEntityOddrn(alerts, dataEntityPojos.get(0).getOddrn()),
                findOpenAlertByEntityOddrn(alerts, dataEntityPojos.get(1).getOddrn()),
                findOpenAlertByEntityOddrn(alerts, dataEntityPojos.get(3).getOddrn()),
                findOpenAlertByEntityOddrn(alerts, dataEntityPojos.get(4).getOddrn())
            );
    }

    @Test
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.BEFORE_METHOD)
    public void countTest() {
        final DataEntityPojo dataEntityPojo = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString()))).get(0);
        final List<AlertPojo> openPojos = createAlertPojos(dataEntityPojo.getOddrn(), AlertStatusEnum.OPEN, 7);
        final List<AlertPojo> resolvedPojos = createAlertPojos(dataEntityPojo.getOddrn(),
            AlertStatusEnum.RESOLVED, 3);
        alertRepository.createAlerts(openPojos);
        alertRepository.createAlerts(resolvedPojos);
        final long count = alertRepository.count();
        assertThat(count).isEqualTo(7);
    }

    @Test
    public void countByOwnerTest() {
        final DataEntityPojo dataEntityPojo = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString()))).get(0);
        final OwnerPojo ownerPojo = ownerRepository.create(new OwnerPojo().setName(UUID.randomUUID().toString()))
            .blockOptional()
            .orElseThrow();;
        final OwnershipPojo ownershipPojo = createOwnershipPojo(ownerPojo.getId(), dataEntityPojo.getId());
        ownershipRepository.create(ownershipPojo).block();

        final List<AlertPojo> openPojos = createAlertPojos(dataEntityPojo.getOddrn(), AlertStatusEnum.OPEN, 4);
        final List<AlertPojo> resolvedPojos = createAlertPojos(dataEntityPojo.getOddrn(),
            AlertStatusEnum.RESOLVED, 3);
        alertRepository.createAlerts(openPojos);
        alertRepository.createAlerts(resolvedPojos);

        final long countByOwner = alertRepository.countByOwner(ownerPojo.getId());
        assertThat(countByOwner).isEqualTo(4);
    }

    @Test
    public void countDependentObjectsAlertsTest() {
        final List<DataEntityPojo> dataEntityPojos = dataEntityRepository.bulkCreate(
            List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString()),
                new DataEntityPojo().setOddrn(UUID.randomUUID().toString()),
                new DataEntityPojo().setOddrn(UUID.randomUUID().toString()),
                new DataEntityPojo().setOddrn(UUID.randomUUID().toString())
            ));
        final OwnerPojo ownerPojo = ownerRepository.create(new OwnerPojo().setName(UUID.randomUUID().toString()))
            .blockOptional()
            .orElseThrow();;
        final OwnershipPojo ownershipPojo = createOwnershipPojo(ownerPojo.getId(), dataEntityPojos.get(2).getId());
        ownershipRepository.create(ownershipPojo).block();

        final LineagePojo firstLineagePojo =
            createLineagePojo(dataEntityPojos.get(0).getOddrn(), dataEntityPojos.get(1).getOddrn());
        final LineagePojo secondLineagePojo =
            createLineagePojo(dataEntityPojos.get(1).getOddrn(), dataEntityPojos.get(2).getOddrn());
        final LineagePojo thirdLineagePojo =
            createLineagePojo(dataEntityPojos.get(2).getOddrn(), dataEntityPojos.get(3).getOddrn());
        lineageRepository.replaceLineagePaths(List.of(firstLineagePojo, secondLineagePojo, thirdLineagePojo));
        alertRepository.createAlerts(List.of(
            createAlertPojo(dataEntityPojos.get(0).getOddrn()), createAlertPojo(dataEntityPojos.get(1).getOddrn()),
            createAlertPojo(dataEntityPojos.get(2).getOddrn()), createAlertPojo(dataEntityPojos.get(3).getOddrn())
        ));

        final long countDependentObjectsAlerts = alertRepository.countDependentObjectsAlerts(ownerPojo.getId());
        assertThat(countDependentObjectsAlerts).isEqualTo(2);
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
