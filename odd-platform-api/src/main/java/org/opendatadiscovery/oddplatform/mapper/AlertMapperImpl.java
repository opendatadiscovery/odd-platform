package org.opendatadiscovery.oddplatform.mapper;

import java.time.ZoneOffset;
import java.util.Collection;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.Alert;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertList;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertType;
import org.opendatadiscovery.oddplatform.api.contract.model.AssociatedOwner;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.Identity;
import org.opendatadiscovery.oddplatform.dto.alert.AlertDto;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AlertMapperImpl implements AlertMapper {
    private final DataEntityMapper dataEntityMapper;
    private final OwnerMapper ownerMapper;

    @Override
    public Alert mapAlert(final AlertDto alert) {
        final DataEntityRef dataEntity = dataEntityMapper
            .mapRef(alert.getDataEntity())
            .hasAlerts(true);

        final AssociatedOwner associatedOwner = new AssociatedOwner()
            .identity(new Identity().username(alert.getAlert().getStatusUpdatedBy()));
        if (alert.getUpdatedByOwner() != null) {
            associatedOwner.setOwner(ownerMapper.mapPojo(alert.getUpdatedByOwner()));
        }
        return new Alert()
            .id(alert.getAlert().getId())
            .dataEntity(dataEntity)
            .description(alert.getAlert().getDescription())
            .type(AlertType.valueOf(alert.getAlert().getType()))
            .status(AlertStatus.fromValue(alert.getAlert().getStatus()))
            .statusUpdatedBy(associatedOwner)
            .statusUpdatedAt(alert.getAlert().getStatusUpdatedAt().atOffset(ZoneOffset.UTC))
            .createdAt(alert.getAlert().getCreatedAt().atOffset(ZoneOffset.UTC));
    }

    @Override
    public AlertList mapAlerts(final Page<AlertDto> alerts) {
        return new AlertList()
            .items(alerts.getData().stream().map(this::mapAlert).collect(Collectors.toList()))
            .pageInfo(null);
    }

    @Override
    public AlertList mapAlerts(final Collection<AlertDto> alerts) {
        return new AlertList().items(alerts.stream().map(this::mapAlert).collect(Collectors.toList()));
    }
}
