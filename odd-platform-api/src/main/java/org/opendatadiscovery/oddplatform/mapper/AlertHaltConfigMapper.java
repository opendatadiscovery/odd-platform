package org.opendatadiscovery.oddplatform.mapper;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import org.apache.commons.lang3.StringUtils;
import org.mapstruct.Mapper;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityAlertConfig;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertHaltConfigPojo;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.springframework.util.CollectionUtils;

@Mapper(config = MapperConfig.class)
public interface AlertHaltConfigMapper {
    DataEntityAlertConfig mapPojo(final AlertHaltConfigPojo pojo);

    AlertHaltConfigPojo mapForm(final Long dataEntityId, final DataEntityAlertConfig form);

    default OffsetDateTime mapTime(final LocalDateTime untilDateTime) {
        if (untilDateTime == null || untilDateTime.isBefore(DateTimeUtil.generateNow())) {
            return null;
        }
        return DateTimeUtil.mapUTCDateTime(untilDateTime);
    }

    default LocalDateTime mapUTCTimestampMillis(final OffsetDateTime timestamp) {
        return DateTimeUtil.mapUTCDateTime(timestamp);
    }

    default List<String> mapStringToStringList(final String string) {
        return StringUtils.isNotBlank(string) ? List.of(string.split(",")) : null;
    }

    default String mapStringListToString(final List<String> strings) {
        return CollectionUtils.isEmpty(strings) ? null : String.join(",", strings);
    }
}
