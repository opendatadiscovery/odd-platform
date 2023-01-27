package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldList;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataKey;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import reactor.core.publisher.Mono;

public interface MetadataFieldService {
    Mono<MetadataFieldPojo> get(final long metadataFieldId);

    Mono<MetadataFieldList> listInternalMetadata(final String query);

    Mono<List<MetadataFieldPojo>> getOrCreateMetadataFields(final List<MetadataFieldPojo> metadataList);

    Mono<Map<MetadataKey, MetadataFieldPojo>> ingestMetadataFields(final List<MetadataKey> keys);
}
