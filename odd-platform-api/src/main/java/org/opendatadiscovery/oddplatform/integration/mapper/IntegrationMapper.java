package org.opendatadiscovery.oddplatform.integration.mapper;

import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.opendatadiscovery.oddplatform.api.contract.model.Integration;
import org.opendatadiscovery.oddplatform.api.contract.model.IntegrationCodeSnippet;
import org.opendatadiscovery.oddplatform.api.contract.model.IntegrationCodeSnippetArgument;
import org.opendatadiscovery.oddplatform.api.contract.model.IntegrationCodeSnippetArgumentType;
import org.opendatadiscovery.oddplatform.api.contract.model.IntegrationContentBlock;
import org.opendatadiscovery.oddplatform.api.contract.model.IntegrationPreview;
import org.opendatadiscovery.oddplatform.api.contract.model.IntegrationPreviewList;
import org.opendatadiscovery.oddplatform.integration.dto.IntegrationCodeSnippetArgumentDto;
import org.opendatadiscovery.oddplatform.integration.dto.IntegrationCodeSnippetArgumentTypeEnum;
import org.opendatadiscovery.oddplatform.integration.dto.IntegrationCodeSnippetDto;
import org.opendatadiscovery.oddplatform.integration.dto.IntegrationContentBlockDto;
import org.opendatadiscovery.oddplatform.integration.dto.IntegrationOverviewDto;
import org.opendatadiscovery.oddplatform.integration.dto.IntegrationPreviewDto;
import org.opendatadiscovery.oddplatform.mapper.MapperConfig;

@Mapper(config = MapperConfig.class)
public interface IntegrationMapper {
    @Mapping(target = "id", source = "integration.id")
    @Mapping(target = "name", source = "integration.name")
    @Mapping(target = "description", source = "integration.description")
    @Mapping(target = "installed", constant = "false")
    Integration map(final IntegrationOverviewDto dto);

    @Mapping(target = "installed", constant = "false")
    IntegrationPreview map(final IntegrationPreviewDto dto);

    IntegrationContentBlock map(final IntegrationContentBlockDto dto);

    IntegrationCodeSnippet map(final IntegrationCodeSnippetDto dto);

    IntegrationCodeSnippetArgument map(final IntegrationCodeSnippetArgumentDto dto);

    default IntegrationCodeSnippetArgumentType map(final IntegrationCodeSnippetArgumentTypeEnum dto) {
        return IntegrationCodeSnippetArgumentType.fromValue(dto.name());
    }

    default IntegrationPreviewList map(final List<IntegrationPreviewDto> dtos) {
        return new IntegrationPreviewList().items(dtos.stream().map(this::map).toList());
    }
}
