package org.opendatadiscovery.oddplatform.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.jetbrains.annotations.Nullable;
import org.jooq.JSONB;

public class JSONSerDeUtils {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper()
        .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
        .registerModules(
            new JavaTimeModule(),
            new SimpleModule().addDeserializer(JSONB.class, new JSONBDeserializer())
        ).setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);

    public static <T> T deserializeJson(final String data, final Class<T> clazz) {
        try {
            return OBJECT_MAPPER.readValue(data, clazz);
        } catch (final JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    @Nullable
    public static <T> T deserializeJson(final Object data, final Class<T> clazz) {
        if (data == null || clazz == null) {
            return null;
        }

        return OBJECT_MAPPER.convertValue(data, clazz);
    }

    public static <T> T deserializeJson(final String data, final TypeReference<T> tr) {
        try {
            return OBJECT_MAPPER.readValue(data, tr);
        } catch (final JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    public static <T> String serializeJson(final T object) {
        if (object == null) {
            return "{}";
        }

        try {
            return OBJECT_MAPPER.writeValueAsString(object);
        } catch (final JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
