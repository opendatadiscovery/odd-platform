package org.opendatadiscovery.oddplatform.mapper.ingestion;

import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.springframework.stereotype.Component;

@Component
public class DataSourceIngestionMapperImpl implements DataSourceIngestionMapper {
    @Override
    public DataSourcePojo mapIngestionModel(final DataSource ds,
                                            final Long namespaceId,
                                            final Long collectorId) {
        return new DataSourcePojo()
            .setOddrn(ds.getOddrn())
            .setName(ds.getName())
            .setActive(true)
            .setDescription(ds.getDescription())
            .setNamespaceId(namespaceId)
            .setCollectorId(collectorId);
    }

    @Override
    public DataSource mapPojoToIngestionModel(final DataSourcePojo pojo) {
        return new DataSource()
            .oddrn(pojo.getOddrn())
            .name(pojo.getName())
            .description(pojo.getDescription());
    }
}
