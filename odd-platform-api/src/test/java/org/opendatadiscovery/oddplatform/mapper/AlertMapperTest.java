package org.opendatadiscovery.oddplatform.mapper;

import java.time.ZoneOffset;
import java.util.List;
import org.jeasy.random.EasyRandom;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.Alert;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertChunk;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertList;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertType;
import org.opendatadiscovery.oddplatform.api.contract.model.AssociatedOwner;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.Identity;
import org.opendatadiscovery.oddplatform.api.contract.model.Owner;
import org.opendatadiscovery.oddplatform.dto.alert.AlertDto;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertChunkPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.utils.Page;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AlertMapperTest {

    @Mock
    DataEntityMapper dataEntityMapper;
    @Mock
    AssociatedOwnerMapper associatedOwnerMapper;

    @InjectMocks
    AlertMapper alertMapper = new AlertMapperImpl(new OffsetDateTimeMapperImpl());

    @Test
    @DisplayName("mapping list without owner")
    void testMapAlertsWithoutOwner() {
        //given
        final DataEntityPojo dataEntityPojo = new EasyRandom().nextObject(DataEntityPojo.class);
        final DataEntityRef dataEntityRef = new EasyRandom().nextObject(DataEntityRef.class);
        dataEntityRef.setOddrn(dataEntityPojo.getOddrn());
        when(dataEntityMapper.mapRef(any(DataEntityPojo.class))).thenReturn(dataEntityRef);

        final AlertPojo alertPojo = new EasyRandom().nextObject(AlertPojo.class);
        final List<AlertChunkPojo> chunks = new EasyRandom().objects(AlertChunkPojo.class, 10)
            .peek(a -> a.setAlertId(alertPojo.getId()))
            .toList();
        alertPojo.setType(AlertTypeEnum.BACKWARDS_INCOMPATIBLE_SCHEMA.getCode());
        alertPojo.setStatus(AlertStatusEnum.OPEN.getCode());

        final AssociatedOwner associatedOwner = new AssociatedOwner();
        associatedOwner.setIdentity(new Identity().username(alertPojo.getStatusUpdatedBy()));
        when(associatedOwnerMapper.mapAssociatedOwner(any())).thenReturn(associatedOwner);

        final List<AlertDto> alertDtos = List.of(new AlertDto(alertPojo, chunks, dataEntityPojo, null));

        //when
        final AlertList alertList = alertMapper.mapAlerts(alertDtos);

        //then
        assertThat(alertList).isNotNull();
        final Alert actual = alertList.getItems().get(0);
        assertActualAlertList(actual, alertPojo, chunks);
        assertThat(actual.getStatusUpdatedBy().getOwner()).isNull();
        assertThat(alertList.getPageInfo()).isNotNull();
        assertThat(alertList.getPageInfo().getTotal()).isEqualTo(alertDtos.size());
        assertThat(alertList.getPageInfo().getHasNext()).isFalse();
    }

    @Test
    @DisplayName("mapping list with owner")
    void testMapAlertsWithOwner() {
        //given
        final DataEntityPojo dataEntityPojo = new EasyRandom().nextObject(DataEntityPojo.class);
        final DataEntityRef dataEntityRef = new EasyRandom().nextObject(DataEntityRef.class);
        dataEntityRef.setOddrn(dataEntityPojo.getOddrn());
        when(dataEntityMapper.mapRef(any(DataEntityPojo.class))).thenReturn(dataEntityRef);

        final AlertPojo alertPojo = new EasyRandom().nextObject(AlertPojo.class);
        alertPojo.setType(AlertTypeEnum.BACKWARDS_INCOMPATIBLE_SCHEMA.getCode());
        alertPojo.setStatus(AlertStatusEnum.OPEN.getCode());

        final OwnerPojo updatedByOwner = new EasyRandom().nextObject(OwnerPojo.class);
        final Owner owner = new EasyRandom().nextObject(Owner.class);
        owner.setName(updatedByOwner.getName());
        final AssociatedOwner associatedOwner = new AssociatedOwner();
        associatedOwner.setOwner(owner);
        associatedOwner.setIdentity(new Identity().username(alertPojo.getStatusUpdatedBy()));
        when(associatedOwnerMapper.mapAssociatedOwner(any())).thenReturn(associatedOwner);
        final List<AlertChunkPojo> chunks = new EasyRandom().objects(AlertChunkPojo.class, 10)
            .peek(a -> a.setAlertId(alertPojo.getId()))
            .toList();
        final List<AlertDto> alertDtos = List.of(new AlertDto(alertPojo, chunks, dataEntityPojo, updatedByOwner));

        //when
        final AlertList alertList = alertMapper.mapAlerts(alertDtos);

        //then
        assertThat(alertList).isNotNull();
        final Alert actual = alertList.getItems().get(0);
        assertActualAlertList(actual, alertPojo, chunks);
        assertThat(actual.getStatusUpdatedBy().getOwner().getName()).isEqualTo(owner.getName());
        assertThat(alertList.getPageInfo()).isNotNull();
        assertThat(alertList.getPageInfo().getTotal()).isEqualTo(alertDtos.size());
        assertThat(alertList.getPageInfo().getHasNext()).isFalse();
    }

    @Test
    @DisplayName("mapping page")
    void testMapAlertsPage() {
        //given
        final DataEntityPojo dataEntityPojo = new EasyRandom().nextObject(DataEntityPojo.class);
        final DataEntityRef dataEntityRef = new EasyRandom().nextObject(DataEntityRef.class);
        dataEntityRef.setOddrn(dataEntityPojo.getOddrn());
        when(dataEntityMapper.mapRef(any(DataEntityPojo.class))).thenReturn(dataEntityRef);

        final AlertPojo alertPojo = new EasyRandom().nextObject(AlertPojo.class);
        alertPojo.setType(AlertTypeEnum.BACKWARDS_INCOMPATIBLE_SCHEMA.getCode());
        alertPojo.setStatus(AlertStatusEnum.OPEN.getCode());

        final OwnerPojo updatedByOwner = new EasyRandom().nextObject(OwnerPojo.class);
        final Owner owner = new EasyRandom().nextObject(Owner.class);
        owner.setName(updatedByOwner.getName());

        final AssociatedOwner associatedOwner = new AssociatedOwner();
        associatedOwner.setOwner(owner);
        associatedOwner.setIdentity(new Identity().username(alertPojo.getStatusUpdatedBy()));
        when(associatedOwnerMapper.mapAssociatedOwner(any())).thenReturn(associatedOwner);

        final List<AlertChunkPojo> chunks = new EasyRandom().objects(AlertChunkPojo.class, 10)
            .peek(a -> a.setAlertId(alertPojo.getId()))
            .toList();

        final List<AlertDto> alertDtos = List.of(new AlertDto(alertPojo, chunks, dataEntityPojo, updatedByOwner));
        final long pageTotal = 2L;
        final Page<AlertDto> alertDtoPage = new Page<>(alertDtos, pageTotal, false);

        //when
        final AlertList alertList = alertMapper.mapAlerts(alertDtoPage);

        //then
        assertThat(alertList).isNotNull();
        final Alert actual = alertList.getItems().get(0);
        assertActualAlertList(actual, alertPojo, chunks);
        assertThat(actual.getStatusUpdatedBy().getOwner().getName()).isEqualTo(owner.getName());
        assertThat(alertList.getPageInfo()).isNotNull();
        assertThat(alertList.getPageInfo().getHasNext()).isFalse();
        assertThat(alertList.getPageInfo().getTotal()).isEqualTo(pageTotal);
    }

    private void assertActualAlertList(final Alert alert,
                                       final AlertPojo alertPojo,
                                       final List<AlertChunkPojo> chunks) {
        final AlertType expectedAlertType = AlertTypeEnum.fromCode(alertPojo.getType())
            .map(AlertTypeEnum::name)
            .map(AlertType::fromValue)
            .orElseThrow(() -> new IllegalStateException("Unknown type code %d".formatted(alertPojo.getType())));

        assertThat(alert).isNotNull();
        assertThat(alert.getId()).isEqualTo(alertPojo.getId());
        assertThat(alert.getType()).isEqualTo(expectedAlertType);
        assertThat(alert.getStatusUpdatedAt())
            .hasToString(alertPojo.getStatusUpdatedAt().atOffset(ZoneOffset.UTC).toString());
        assertThat(alert.getStatusUpdatedBy().getIdentity().getUsername()).isEqualTo(alertPojo.getStatusUpdatedBy());

        assertThat(alert.getAlertChunkList())
            .extracting(AlertChunk::getDescription)
            .hasSameElementsAs(chunks.stream().map(AlertChunkPojo::getDescription).toList());
    }
}