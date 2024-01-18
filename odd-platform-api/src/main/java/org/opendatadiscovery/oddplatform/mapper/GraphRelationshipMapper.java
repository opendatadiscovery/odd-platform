package org.opendatadiscovery.oddplatform.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import java.util.List;
import java.util.Map;
import org.jooq.JSONB;
import org.mapstruct.Mapper;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetRelationship;
import org.opendatadiscovery.oddplatform.api.contract.model.GraphRelationshipAttributes;
import org.opendatadiscovery.oddplatform.api.contract.model.GraphRelationshipDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.GraphRelationshipDetailsList;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GraphRelationshipPojo;

@Mapper(config = MapperConfig.class,
    uses = {
        DateTimeMapper.class,
        DataEntityMapper.class,
    })
public abstract class GraphRelationshipMapper {
    public GraphRelationshipDetailsList mapToDetails(final DatasetRelationship relationship,
                                                     final List<GraphRelationshipPojo> graphList) {
        return new GraphRelationshipDetailsList()
            .datasetRelationship(relationship)
            .items(mapPojoListToDetailsList(graphList));
    }

    private List<GraphRelationshipDetails> mapPojoListToDetailsList(final List<GraphRelationshipPojo> graphList) {
        return graphList.stream()
            .map(this::mapPojoToDetails)
            .toList();
    }

    public GraphRelationshipDetails mapPojoToDetails(final GraphRelationshipPojo pojo) {
        return new GraphRelationshipDetails()
            .graphRelationshipsId(pojo.getId())
            .isDirected(pojo.getIsDerected())
            .attributes(mapGraphAttributes(pojo.getSpecificAttributes()));
    }

    private List<GraphRelationshipAttributes> mapGraphAttributes(final JSONB specificAttributes) {
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
