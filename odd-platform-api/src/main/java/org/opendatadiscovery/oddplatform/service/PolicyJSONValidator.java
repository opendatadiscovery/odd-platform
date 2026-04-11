package org.opendatadiscovery.oddplatform.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.networknt.schema.JsonSchema;
import com.networknt.schema.JsonSchemaFactory;
import com.networknt.schema.SpecVersion;
import com.networknt.schema.ValidationMessage;
import java.io.IOException;
import java.util.Set;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

@Component
public class PolicyJSONValidator {
    private final JsonSchema jsonSchema;
    private final ObjectMapper objectMapper;

    public PolicyJSONValidator(final ObjectMapper objectMapper) throws IOException {
        final JsonSchemaFactory factory = JsonSchemaFactory.getInstance(SpecVersion.VersionFlag.V201909);
        this.jsonSchema = factory.getSchema(new ClassPathResource("schema/policy_schema.json").getInputStream());
        this.objectMapper = objectMapper;
    }

    public void validate(final String policyJson) {
        try {
            final Set<ValidationMessage> errors = jsonSchema.validate(objectMapper.readTree(policyJson));
            if (!errors.isEmpty()) {
                throw new IllegalArgumentException("Policy is not valid: " + errors);
            }
        } catch (final IOException e) {
            throw new IllegalArgumentException("Policy is not valid: " + e.getMessage());
        }
    }
}
