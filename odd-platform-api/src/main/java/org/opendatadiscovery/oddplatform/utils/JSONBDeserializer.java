package org.opendatadiscovery.oddplatform.utils;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.ObjectCodec;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import java.io.IOException;
import org.jooq.JSONB;

public class JSONBDeserializer extends JsonDeserializer<JSONB> {

    @Override
    public JSONB deserialize(final JsonParser jsonParser, final DeserializationContext ctxt) throws IOException {
        final ObjectCodec oc = jsonParser.getCodec();
        final JsonNode node = oc.readTree(jsonParser);

        return JSONB.jsonb(node.toString());
    }
}
