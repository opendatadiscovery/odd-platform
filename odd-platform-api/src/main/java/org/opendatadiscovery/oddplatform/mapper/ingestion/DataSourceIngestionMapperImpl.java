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
                                            final Long tokenId) {
        return new DataSourcePojo()
            .setOddrn(ds.getOddrn())
            .setName(ds.getName())
            .setActive(true)
            .setDescription(ds.getDescription())
            .setNamespaceId(namespaceId)
            .setTokenId(tokenId);
    }

    @Override
    public DataSource mapDtoToIngestionModel(final DataSourceDto dto) {
        return new DataSource()
            .oddrn(dto.dataSource().getOddrn())
            .name(dto.dataSource().getName())
            .description(dto.dataSource().getDescription());
    }
}
