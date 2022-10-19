package org.opendatadiscovery.oddplatform.json;

import java.io.IOException;
import org.junit.jupiter.api.Test;
import org.testcontainers.shaded.com.fasterxml.jackson.databind.ObjectMapper;

public class PolicyDeserializerTest {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    public void testDeserialize() throws IOException {
//        final PolicyDto policyDto = objectMapper.readValue(
//            new ClassPathResource("json/policy.json").getInputStream(), PolicyDto.class);
//        assertThat(policyDto).isNotNull();
//        assertThat(policyDto.getPermissions()).hasSize(5);
//        assertThat(policyDto.getPermissions()).containsExactlyInAnyOrder(
//            DATA_ENTITY_INTERNAL_NAME_UPDATE, DATA_ENTITY_CUSTOM_METADATA_UPDATE,
//            DATA_ENTITY_CUSTOM_METADATA_CREATE, DATA_ENTITY_CUSTOM_METADATA_DELETE,
//            DATA_ENTITY_DESCRIPTION_UPDATE
//        );
//        assertThat(policyDto.getResources()).hasSize(1);
//        final PolicyResourceDto resource = policyDto.getResources().get(0);
//        assertThat(resource.getType()).isEqualTo(PolicyTypeDto.DATA_ENTITY);
//        assertThat(resource.getName()).isNull();
//        assertThat(resource.getConditions()).isNotNull();
//        assertThat(resource.getConditions().getAll()).hasSize(2);
//        assertThat(resource.getConditions().getAll().get(0).getIs()).isEqualTo(PolicyConditionKeyDto.DATA_ENTITY_OWNER);
//        final PolicyConditionUnaryDto eq = resource.getConditions().getAll().get(1).getEq();
//        assertThat(eq).isNotNull();
//        assertThat(eq.getCondition()).hasSize(1);
//        assertThat(eq.getCondition().get(PolicyConditionKeyDto.DATA_ENTITY_NAMESPACE_NAME)).isEqualTo("QA");
    }
}
