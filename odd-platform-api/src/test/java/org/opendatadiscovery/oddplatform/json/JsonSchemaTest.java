package org.opendatadiscovery.oddplatform.json;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.networknt.schema.JsonSchema;
import com.networknt.schema.JsonSchemaFactory;
import com.networknt.schema.SpecVersion;
import com.networknt.schema.ValidationMessage;
import java.io.IOException;
import java.util.Set;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

public class JsonSchemaTest {
    private final ObjectMapper mapper = new ObjectMapper();

    @ParameterizedTest
    @ValueSource(strings = {
        "/policy/valid/combined_policy.json",
        "/policy/valid/data_entity.json",
        "/policy/valid/data_entity_without_conditions.json",
        "/policy/valid/management.json",
        "/policy/valid/term.json",
        "/policy/valid/term_without_conditions.json"
    })
    public void testValidPolicies(final String policyPath) throws IOException {
        final JsonSchemaFactory factory = JsonSchemaFactory.getInstance(SpecVersion.VersionFlag.V201909);
        final JsonSchema jsonSchema = factory.getSchema(
            JsonSchemaTest.class.getResourceAsStream("/schema/policy_schema.json"));
        final JsonNode jsonNode = mapper.readTree(
            JsonSchemaTest.class.getResourceAsStream(policyPath));
        final Set<ValidationMessage> errors = jsonSchema.validate(jsonNode);
        assertThat(errors).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "/policy/invalid/additional_properties.json",
        "/policy/invalid/empty_policy.json",
        "/policy/invalid/management_with_conditions.json",
        "/policy/invalid/missed_permissions.json",
        "/policy/invalid/missed_resource.json",
        "/policy/invalid/data_entity_invalid_permissions.json",
        "/policy/invalid/term_invalid_permissions.json",
        "/policy/invalid/management_invalid_permissions.json",
        "/policy/invalid/data_entity_invalid_condition_key.json",
        "/policy/invalid/term_invalid_condition_key.json"
    })
    public void testInvalidPolicies(final String policyPath) throws IOException {
        final JsonSchemaFactory factory = JsonSchemaFactory.getInstance(SpecVersion.VersionFlag.V201909);
        final JsonSchema jsonSchema = factory.getSchema(
            JsonSchemaTest.class.getResourceAsStream("/schema/policy_schema.json"));
        final JsonNode jsonNode = mapper.readTree(
            JsonSchemaTest.class.getResourceAsStream(policyPath));
        final Set<ValidationMessage> errors = jsonSchema.validate(jsonNode);
        assertThat(errors).isNotEmpty();
    }
}
