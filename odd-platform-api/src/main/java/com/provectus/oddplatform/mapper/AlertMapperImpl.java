package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.api.contract.model.Alert;
import com.provectus.oddplatform.api.contract.model.AlertList;
import com.provectus.oddplatform.api.contract.model.AlertStatus;
import com.provectus.oddplatform.api.contract.model.AlertType;
import com.provectus.oddplatform.dto.AlertDto;
import com.provectus.oddplatform.utils.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.ZoneOffset;
import java.util.Collection;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class AlertMapperImpl implements AlertMapper {
    private final DataEntityMapper dataEntityMapper;

    @Override
    public Alert mapAlert(final AlertDto alert) {
        return new Alert()
            .id(alert.getAlert().getId())
            .dataEntity(dataEntityMapper.mapRef(alert.getDataEntityDto()))
            .description(alert.getAlert().getDescription())
            .type(AlertType.valueOf(alert.getAlert().getType()))
            .status(AlertStatus.fromValue(alert.getAlert().getStatus()))
            .statusUpdatedBy(null)
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
