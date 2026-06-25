package org.opendatadiscovery.oddplatform.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.networknt.schema.JsonSchema;
import com.networknt.schema.JsonSchemaFactory;
import com.networknt.schema.SpecVersion;
import com.networknt.schema.ValidationMessage;
import java.io.IOException;
import java.util.Set;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
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
                // User-submitted policy JSON failed schema validation -> a client error (400), not a 500.
                // Pass the detail as a format arg (never concatenated into the format string) so a validation
                // message containing '%' cannot break String.format inside BadUserRequestException.
                throw new BadUserRequestException("Policy is not valid: %s", errors);
            }
        } catch (final IOException e) {
            throw new BadUserRequestException("Policy is not valid: %s", e.getMessage());
        }
    }
}
