package org.opendatadiscovery.oddplatform.mapper;

import org.jooq.JSONB;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.api.contract.model.GraphRelationshipAttributes;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GraphRelationshipPojo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

class GraphRelationshipMapperTest {

    private final GraphRelationshipMapper mapper = new GraphRelationshipMapper();

    @Test
    void mapsStringAttributesAsIs() {
        final GraphRelationshipPojo pojo = new GraphRelationshipPojo()
            .setId(1L)
            .setSpecificAttributes(JSONB.valueOf("{\"cardinality\":\"ONE_TO_ONE\"}"));

        assertThat(mapper.mapPojoToDetails(pojo).getAttributes())
            .extracting(GraphRelationshipAttributes::getName, GraphRelationshipAttributes::getValue)
            .containsExactly(tuple("cardinality", "ONE_TO_ONE"));
    }

    @Test
    void mapsNonStringAttributesAsTheirJson() {
        final GraphRelationshipPojo pojo = new GraphRelationshipPojo()
            .setId(1L)
            .setSpecificAttributes(JSONB.valueOf(
                "{\"target_fields\":[\"tenant_id\",\"sku\"],\"weight\":2,\"meta\":{\"a\":true},\"note\":null}"));

        assertThat(mapper.mapPojoToDetails(pojo).getAttributes())
            .extracting(GraphRelationshipAttributes::getName, GraphRelationshipAttributes::getValue)
            .containsExactly(
                tuple("target_fields", "[\"tenant_id\",\"sku\"]"),
                tuple("weight", "2"),
                tuple("meta", "{\"a\":true}"),
                tuple("note", null));
    }
}
