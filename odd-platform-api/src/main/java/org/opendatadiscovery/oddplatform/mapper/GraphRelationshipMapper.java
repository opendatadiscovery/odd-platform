package org.opendatadiscovery.oddplatform.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
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

        try {
            final JsonNode attributes = new ObjectMapper().readTree(specificAttributes.data());

            // attributes are free-form: non-string values are shown as their JSON
            final List<GraphRelationshipAttributes> result = new ArrayList<>();
            attributes.fields().forEachRemaining(item -> result.add(new GraphRelationshipAttributes()
                .name(item.getKey())
                .value(attributeValue(item.getValue()))));
            return result;
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    private String attributeValue(final JsonNode value) {
        if (value.isNull()) {
            return null;
        }
        return value.isTextual() ? value.asText() : value.toString();
    }
}
