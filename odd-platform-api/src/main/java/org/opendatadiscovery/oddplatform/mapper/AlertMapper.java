package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import java.util.stream.Collectors;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.opendatadiscovery.oddplatform.api.contract.model.Alert;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertChunk;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertList;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertType;
import org.opendatadiscovery.oddplatform.api.contract.model.AssociatedOwner;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.dto.AssociatedOwnerDto;
import org.opendatadiscovery.oddplatform.dto.alert.AlertDto;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertChunkPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(config = MapperConfig.class, uses = OffsetDateTimeMapper.class)
public abstract class AlertMapper {

    @Autowired
    protected AssociatedOwnerMapper associatedOwnerMapper;
    @Autowired
    protected DataEntityMapper dataEntityMapper;

    @Named("statusUpdatedBy")
    public AssociatedOwner mapAssociatedOwner(final AlertDto alertDto) {
        if (alertDto.getAlert().getStatusUpdatedBy() == null) {
            return null;
        }

        return associatedOwnerMapper.mapAssociatedOwner(
            new AssociatedOwnerDto(
                alertDto.getAlert().getStatusUpdatedBy(),
                alertDto.getUpdatedByOwner(),
                null
            )
        );
    }

    @Named("dataEntity")
    public DataEntityRef mapDataEntityRef(final AlertDto alertDto) {
        return dataEntityMapper
            .mapRef(alertDto.getDataEntity())
            .hasAlerts(true);
    }

    @Mapping(source = "alert", target = ".")
    @Mapping(source = "alertDto", target = "statusUpdatedBy", qualifiedByName = "statusUpdatedBy")
    @Mapping(source = "alertDto", target = "dataEntity", qualifiedByName = "dataEntity")
    @Mapping(source = "chunks", target = "alertChunkList")
    public abstract Alert mapAlert(final AlertDto alertDto);

    abstract AlertChunk mapAlertChunk(final AlertChunkPojo alertChunkPojo);

    public AlertType mapType(final Short code) {
        return AlertTypeEnum.fromCode(code)
            .map(ate -> AlertType.fromValue(ate.name()))
            .orElseThrow(() -> new IllegalStateException("Unknown alert type code %d".formatted(code)));
    }

    public AlertStatus mapStatus(final Short code) {
        return AlertStatusEnum.fromCode(code)
            .map(ase -> AlertStatus.fromValue(ase.name()))
            .orElseThrow(() -> new IllegalStateException("Unknown alert status code %d".formatted(code)));
    }

    public AlertList mapAlerts(final Page<AlertDto> alerts) {
        final PageInfo pageInfo = new PageInfo();
        pageInfo.setTotal(alerts.getTotal());
        pageInfo.setHasNext(alerts.isHasNext());
        return new AlertList()
            .items(alerts.getData().stream().map(this::mapAlert).collect(Collectors.toList()))
            .pageInfo(pageInfo);
    }

    public AlertList mapAlerts(final List<AlertDto> alerts) {
        final PageInfo pageInfo = new PageInfo();
        pageInfo.setTotal((long) alerts.size());
        pageInfo.setHasNext(false);
        return new AlertList().items(alerts.stream().map(this::mapAlert).collect(Collectors.toList()))
            .pageInfo(pageInfo);
    }
}
