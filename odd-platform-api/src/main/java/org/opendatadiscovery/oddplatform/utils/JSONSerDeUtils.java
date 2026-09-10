package org.opendatadiscovery.oddplatform.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
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
            new SimpleModule().addDeserializer(JSONB.class, new JSONBDeserializer()),
            new SimpleModule().addSerializer(JSONB.class, new JSONBSerializer())
        ).setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);

    public static <T> T deserializeJson(final String data, final Class<T> clazz) {
        try {
            return OBJECT_MAPPER.readValue(data, clazz);
        } catch (final JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    @Nullable
    public static <T> T deserializeJson(final Object data, final TypeReference<T> typeReference) {
        if (data == null || typeReference == null) {
            return null;
        }

        return OBJECT_MAPPER.convertValue(data, typeReference);
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

    /**
     * Parse JSON text into a tree on the shared (snake_case) mapper, for callers that must SANITISE a stored
     * document field-by-field before binding it to a typed model — e.g. a persisted jsonb whose enum tokens may
     * have gone stale (#1878: a saved-search spec). Throws {@link JsonProcessingException} on malformed text.
     */
    public static JsonNode readTree(final String data) throws JsonProcessingException {
        return OBJECT_MAPPER.readTree(data);
    }

    /** Bind a (sanitised) tree to a typed model on the shared mapper — the second half of {@link #readTree}. */
    public static <T> T treeToValue(final JsonNode node, final Class<T> clazz) throws JsonProcessingException {
        return OBJECT_MAPPER.treeToValue(node, clazz);
    }

    /**
     * Read ONE field of a stored tree with the same reader that will bind the whole document, returning
     * {@code null} when it cannot be read as {@code clazz}.
     *
     * <p>This exists because hand-parsing a stored field is a trap. A sanitiser that validates with
     * {@code SomeType.parse(node.asText())} asserts an encoding it ASSUMED, while the binder that runs two lines
     * later uses THIS mapper. When the two disagree, the sanitiser rejects the platform's own output and its
     * defensive branch silently discards real user data. That is exactly what happened to a saved search's
     * {@code recently_viewed} window (#1889 follow-up): this mapper writes an {@code OffsetDateTime} as a NUMERIC
     * timestamp — it registers {@link JavaTimeModule} and leaves {@code WRITE_DATES_AS_TIMESTAMPS} at Jackson's
     * enabled default — and {@code OffsetDateTime.parse("1.7882208E9")} throws.
     *
     * <p>The encoding itself is not the bug and is deliberately NOT changed here: this mapper also writes the
     * outbound generic-webhook alert payload ({@code AlertNotificationMessage.eventAt}), so flipping the global
     * date format would silently change a published integration's wire shape. Instead: <b>validate with the
     * reader that binds</b>. A field that survives this call is one the subsequent {@link #treeToValue} is
     * guaranteed to accept, whatever encoding it was stored in — including a hand-written ISO-8601 instant.
     *
     * <p>Returns {@code null} for a JSON null exactly as for an unreadable value, so a caller that must tell
     * "absent" from "malformed" checks the node itself first.
     */
    @Nullable
    public static <T> T readFieldOrNull(final JsonNode node, final Class<T> clazz) {
        if (node == null || node.isNull()) {
            return null;
        }
        try {
            return OBJECT_MAPPER.treeToValue(node, clazz);
        } catch (final Exception e) {
            return null;
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
