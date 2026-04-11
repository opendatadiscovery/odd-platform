package org.opendatadiscovery.oddplatform.utils;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import java.io.IOException;
import org.jooq.JSONB;

public class JSONBSerializer extends JsonSerializer<JSONB> {

    @Override
    public void serialize(final JSONB value, final JsonGenerator gen,
                          final SerializerProvider serializers) throws IOException {
        gen.writeRawValue(value.data());
    }
}
