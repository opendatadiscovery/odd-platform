package org.opendatadiscovery.oddplatform.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import lombok.SneakyThrows;
import org.apache.commons.lang3.StringUtils;
import org.jooq.JSONB;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityCreateEvent;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ActivityPojo;

@Mapper(config = MapperConfig.class)
public interface ActivityMapper {
    ObjectMapper MAPPER = new ObjectMapper();

    @Mapping(source = "createdBy", target = "createdBy", qualifiedByName = "createdBy")
    ActivityPojo mapToPojo(final ActivityCreateEvent event,
                           final LocalDateTime createdAt,
                           final String createdBy);

    @Named("createdBy")
    default String mapCreatedBy(final String username) {
        return StringUtils.isEmpty(username) ? null : username;
    }

    @SneakyThrows
    default JSONB mapToJson(final Object value) {
        if (value == null) {
            return null;
        }
        return JSONB.jsonb(MAPPER.writeValueAsString(value));
    }
}
