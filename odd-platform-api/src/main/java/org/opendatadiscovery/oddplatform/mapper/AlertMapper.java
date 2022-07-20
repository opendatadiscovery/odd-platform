package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import java.util.stream.Collectors;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.opendatadiscovery.oddplatform.api.contract.model.Alert;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertList;
import org.opendatadiscovery.oddplatform.api.contract.model.AssociatedOwner;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.dto.alert.AlertDto;
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
        return associatedOwnerMapper
            .mapAssociatedOwner(alertDto.getAlert().getStatusUpdatedBy(), alertDto.getUpdatedByOwner());
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
    abstract Alert mapAlert(final AlertDto alertDto);

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
