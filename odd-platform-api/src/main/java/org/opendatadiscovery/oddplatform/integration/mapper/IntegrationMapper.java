package org.opendatadiscovery.oddplatform.integration.mapper;

import java.util.List;
import org.mapstruct.Mapper;
import org.opendatadiscovery.oddplatform.api.contract.model.Integration;
import org.opendatadiscovery.oddplatform.api.contract.model.IntegrationPreview;
import org.opendatadiscovery.oddplatform.api.contract.model.IntegrationPreviewList;
import org.opendatadiscovery.oddplatform.integration.dto.IntegrationOverviewDto;
import org.opendatadiscovery.oddplatform.integration.dto.IntegrationPreviewDto;
import org.opendatadiscovery.oddplatform.mapper.MapperConfig;

@Mapper(config = MapperConfig.class)
public interface IntegrationMapper {
    Integration map(final IntegrationOverviewDto dto);

    IntegrationPreview map(final IntegrationPreviewDto dto);

    default IntegrationPreviewList map(final List<IntegrationPreviewDto> dtos) {
        return new IntegrationPreviewList().items(dtos.stream().map(this::map).toList());
    }
}
