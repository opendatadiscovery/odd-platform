package org.opendatadiscovery.oddplatform.mapper;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import org.mapstruct.Mapper;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityAlertConfig;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertHaltConfigPojo;

@Mapper(config = MapperConfig.class)
public interface AlertHaltConfigMapper {
    DataEntityAlertConfig mapPojo(final AlertHaltConfigPojo pojo);

    AlertHaltConfigPojo mapForm(final Long dataEntityId, final DataEntityAlertConfig form);

    default OffsetDateTime mapTime(final LocalDateTime untilDateTime) {
        if (untilDateTime == null
            || untilDateTime.isBefore(OffsetDateTime.now().atZoneSameInstant(ZoneOffset.UTC).toLocalDateTime())) {
            return null;
        }

        return untilDateTime.atOffset(ZoneOffset.UTC);
    }

    default LocalDateTime mapTime(final OffsetDateTime offsetDateTime) {
        if (offsetDateTime == null) {
            return null;
        }

        return offsetDateTime.atZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
    }
}
