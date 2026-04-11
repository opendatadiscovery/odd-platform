package org.opendatadiscovery.oddplatform.integration.mapper;

import java.util.List;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.opendatadiscovery.oddplatform.api.contract.model.Integration;
import org.opendatadiscovery.oddplatform.api.contract.model.IntegrationCodeSnippet;
import org.opendatadiscovery.oddplatform.api.contract.model.IntegrationCodeSnippetArgument;
import org.opendatadiscovery.oddplatform.api.contract.model.IntegrationCodeSnippetArgumentType;
import org.opendatadiscovery.oddplatform.api.contract.model.IntegrationContentBlock;
import org.opendatadiscovery.oddplatform.api.contract.model.IntegrationPreview;
import org.opendatadiscovery.oddplatform.api.contract.model.IntegrationPreviewList;
import org.opendatadiscovery.oddplatform.integration.StaticArgumentMappingContext;
import org.opendatadiscovery.oddplatform.integration.dto.IntegrationCodeSnippetArgumentDto;
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
    Integration map(final IntegrationOverviewDto dto, @Context final StaticArgumentMappingContext ctx);

    @Mapping(target = "installed", constant = "false")
    IntegrationPreview map(final IntegrationPreviewDto dto);

    IntegrationContentBlock map(final IntegrationContentBlockDto dto,
                                @Context final StaticArgumentMappingContext ctx);

    IntegrationCodeSnippet map(final IntegrationCodeSnippetDto dto, @Context final StaticArgumentMappingContext ctx);

    default IntegrationCodeSnippetArgument map(final IntegrationCodeSnippetArgumentDto dto,
                                               @Context final StaticArgumentMappingContext ctx) {
        return new IntegrationCodeSnippetArgument()
            .name(dto.name())
            .parameter(dto.parameter())
            .type(IntegrationCodeSnippetArgumentType.fromValue(dto.type().name()))
            .staticValue(ctx.get(dto.parameter()));
    }

    default IntegrationPreviewList map(final List<IntegrationPreviewDto> dtos) {
        return new IntegrationPreviewList().items(dtos.stream().map(this::map).toList());
    }
}
