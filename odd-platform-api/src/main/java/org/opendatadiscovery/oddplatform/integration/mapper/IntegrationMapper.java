package org.opendatadiscovery.oddplatform.integration.mapper;

import java.util.List;
import org.mapstruct.Mapper;
import org.opendatadiscovery.oddplatform.api.contract.model.Integration;
import org.opendatadiscovery.oddplatform.api.contract.model.IntegrationList;
import org.opendatadiscovery.oddplatform.api.contract.model.IntegrationOverview;
import org.opendatadiscovery.oddplatform.integration.IntegrationDto;
import org.opendatadiscovery.oddplatform.integration.IntegrationOverviewDto;
import org.opendatadiscovery.oddplatform.mapper.MapperConfig;

@Mapper(config = MapperConfig.class)
public interface IntegrationMapper {
    Integration map(final IntegrationDto dto);

    IntegrationOverview map(final IntegrationOverviewDto dto);

    default IntegrationList map(final List<IntegrationDto> dtos) {
        return new IntegrationList().items(dtos.stream().map(this::map).toList());
    }
}
