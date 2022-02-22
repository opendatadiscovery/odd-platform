package org.opendatadiscovery.oddplatform.service.metadata;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Collection;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataTypeEnum;
import org.springframework.stereotype.Component;

@Component
public class MetadataParser {

    private final ObjectMapper om = new ObjectMapper()
        .enable(DeserializationFeature.FAIL_ON_TRAILING_TOKENS);

    public MetadataTypeEnum parse(final Object metadataValue) {
        if (isDate(metadataValue)) {
            return MetadataTypeEnum.DATETIME;
        }
        if (isJSON(metadataValue)) {
            return MetadataTypeEnum.JSON;
        }
        if (metadataValue.getClass().equals(Integer.class)) {
            return MetadataTypeEnum.INTEGER;
        }
        if (metadataValue.getClass().equals(Float.class)) {
            return MetadataTypeEnum.FLOAT;
        }
        if (metadataValue.getClass().isAssignableFrom(Collection.class)) {
            return MetadataTypeEnum.ARRAY;
        }
        if (metadataValue.getClass().equals(Boolean.class)) {
            return MetadataTypeEnum.BOOLEAN;
        }
        if (metadataValue.getClass().equals(String.class)) {
            return MetadataTypeEnum.STRING;
        }
        return MetadataTypeEnum.UNKNOWN;
    }

    private boolean isDate(final Object object) {
        if (object == null || !object.getClass().equals(String.class)) {
            return false;
        }
        try {
            LocalDateTime.parse(object.toString(), DateTimeFormatter.ISO_DATE_TIME);
        } catch (final DateTimeParseException ignored) {
            return false;
        }
        return true;
    }

    private boolean isJSON(final Object object) {
        if (object == null || !object.getClass().equals(String.class)) {
            return false;
        }
        try {
            final JsonNode jsonNode = om.readTree(object.toString());
            return jsonNode.isContainerNode();
        } catch (JsonProcessingException e) {
            return false;
        }
    }
}
