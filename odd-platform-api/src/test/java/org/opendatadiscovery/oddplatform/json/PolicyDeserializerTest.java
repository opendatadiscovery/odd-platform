package org.opendatadiscovery.oddplatform.json;

import java.io.IOException;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionKeyDto;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionUnaryDto;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyDto;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyResourceDto;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyStatementDto;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyTypeDto;
import org.springframework.core.io.ClassPathResource;
import org.testcontainers.shaded.com.fasterxml.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_ENTITY_CUSTOM_METADATA_CREATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_ENTITY_CUSTOM_METADATA_DELETE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_ENTITY_CUSTOM_METADATA_UPDATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_ENTITY_DESCRIPTION_UPDATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.DATA_ENTITY_INTERNAL_NAME_UPDATE;

public class PolicyDeserializerTest {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    public void testDeserialize() throws IOException {
        final PolicyDto policyDto = objectMapper.readValue(
            new ClassPathResource("policy/policy.json").getInputStream(), PolicyDto.class);
        assertThat(policyDto).isNotNull();
        assertThat(policyDto.getStatements()).hasSize(1);
        final PolicyStatementDto statementDto = policyDto.getStatements().get(0);
        assertThat(statementDto.getPermissions()).containsExactlyInAnyOrder(
            DATA_ENTITY_INTERNAL_NAME_UPDATE, DATA_ENTITY_CUSTOM_METADATA_UPDATE,
            DATA_ENTITY_CUSTOM_METADATA_CREATE, DATA_ENTITY_CUSTOM_METADATA_DELETE,
            DATA_ENTITY_DESCRIPTION_UPDATE
        );
        final PolicyResourceDto resource = statementDto.getResource();
        assertThat(resource.getType()).isEqualTo(PolicyTypeDto.DATA_ENTITY);
        assertThat(resource.getConditions()).isNotNull();
        assertThat(resource.getConditions().getAll()).hasSize(2);
        assertThat(resource.getConditions().getAll().get(0).getIs())
            .isEqualTo(PolicyConditionKeyDto.DATA_ENTITY_OWNER);
        final PolicyConditionUnaryDto eq = resource.getConditions().getAll().get(1).getEq();
        assertThat(eq).isNotNull();
        assertThat(eq.getCondition()).hasSize(1);
        assertThat(eq.getCondition().get(PolicyConditionKeyDto.DATA_ENTITY_NAMESPACE_NAME)).isEqualTo(
            "Open Data Discovery");
    }
}
