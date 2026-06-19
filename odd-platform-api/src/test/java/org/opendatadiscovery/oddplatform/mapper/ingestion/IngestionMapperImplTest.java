package org.opendatadiscovery.oddplatform.mapper.ingestion;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.exception.DataEntityClassTypeValidationException;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataConsumer;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityGroup;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Unit tests for ingesting the {@code ML_MODEL} data-entity type (ADR ml-entity-taxonomy, issue #1725).
 * {@code ML_MODEL} is the model-identity GROUP. The mapper maps the ingestion-contract type to the internal
 * type 1:1 by name ({@code DataEntityTypeDto.valueOf}); the contract is the source of truth, so a payload
 * whose shape contradicts the type's class is a {@link DataEntityClassTypeValidationException} (a 4xx),
 * not the pre-fix 500 (on {@code main}, {@code valueOf("ML_MODEL")} throws {@code IllegalArgumentException}
 * because the internal enum lacked {@code ML_MODEL} — so both cases below are RED before the fix).
 */
class IngestionMapperImplTest {
    private final IngestionMapperImpl mapper = new IngestionMapperImpl(null, null, null, null);

    @Test
    @DisplayName("ML_MODEL + data_entity_group ingests as the ML_MODEL group identity (1:1, #1725)")
    void mlModelGroupIngestsAsGroup() {
        final DataEntity de = new DataEntity()
            .oddrn("//ctrib021/group/churn-model")
            .name("churn-model")
            .type(DataEntityType.ML_MODEL)
            .dataEntityGroup(new DataEntityGroup().entitiesList(List.of("//ctrib021/group/member")));

        final DataEntityIngestionDto dto = mapper.createIngestionDto(de, 1L);

        assertThat(dto.getType()).isEqualTo(DataEntityTypeDto.ML_MODEL);
        assertThat(dto.getEntityClasses()).contains(DataEntityClassDto.DATA_ENTITY_GROUP);
    }

    @Test
    @DisplayName("ML_MODEL is a group: a data_consumer-shaped ML_MODEL is a contract violation (4xx), not a 500")
    void mlModelConsumerShapeIsAContractViolation() {
        // The contract (specification) says ML_MODEL is a group; a consumer-model must be sent as
        // ML_MODEL_ARTIFACT. A consumer-shaped ML_MODEL therefore fails type-vs-class validation (a clean 4xx),
        // rather than being silently re-mapped in the platform.
        final DataEntity de = new DataEntity()
            .oddrn("//ctrib021/consumer/chatbot")
            .name("Chatbot")
            .type(DataEntityType.ML_MODEL)
            .dataConsumer(new DataConsumer().inputs(List.of("//ctrib021/input/features")));

        assertThatThrownBy(() -> mapper.createIngestionDto(de, 1L))
            .isInstanceOf(DataEntityClassTypeValidationException.class);
    }
}
