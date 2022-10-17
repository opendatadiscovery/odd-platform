package org.opendatadiscovery.oddplatform.json;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.networknt.schema.JsonSchema;
import com.networknt.schema.JsonSchemaFactory;
import com.networknt.schema.SpecVersion;
import com.networknt.schema.ValidationMessage;
import java.io.IOException;
import java.util.Set;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class JsonSchemaTest {
    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    public void test() throws IOException {
        final JsonSchemaFactory factory = JsonSchemaFactory.getInstance(SpecVersion.VersionFlag.V201909);
        final JsonSchema jsonSchema = factory.getSchema(
            JsonSchemaTest.class.getResourceAsStream("/schema/policy_schema.json"));
        final JsonNode jsonNode = mapper.readTree(
            JsonSchemaTest.class.getResourceAsStream("/json/policy.json"));
        final Set<ValidationMessage> errors = jsonSchema.validate(jsonNode);
        errors.forEach(System.out::println);
        assertThat(errors).isEmpty();
    }
}
