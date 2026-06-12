package org.opendatadiscovery.oddplatform.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import java.util.List;
import java.util.Map;
import org.jooq.JSONB;
import org.opendatadiscovery.oddplatform.api.contract.model.GraphRelationshipAttributes;
import org.opendatadiscovery.oddplatform.api.contract.model.GraphRelationshipDetails;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GraphRelationshipPojo;
import org.springframework.stereotype.Component;

@Component
public class GraphRelationshipMapper {
    public GraphRelationshipDetails mapPojoToDetails(final GraphRelationshipPojo pojo) {
        if (pojo == null || pojo.getId() == null) {
            return null;
        }

        return new GraphRelationshipDetails()
            .graphRelationshipId(pojo.getId())
            .isDirected(pojo.getIsDirected())
            .attributes(mapGraphAttributes(pojo.getSpecificAttributes()));
    }

    private List<GraphRelationshipAttributes> mapGraphAttributes(final JSONB specificAttributes) {
        if (specificAttributes == null) {
            return List.of();
        }

        final ObjectReader reader = new ObjectMapper().readerFor(Map.class);

        try {
            final Map<String, String> map = reader.readValue(specificAttributes.data());

            return map.entrySet().stream()
                .map(item -> new GraphRelationshipAttributes()
                    .name(item.getKey())
                    .value(item.getValue()))
                .toList();
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
