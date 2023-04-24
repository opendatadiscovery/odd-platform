package org.opendatadiscovery.oddplatform.integration.serde;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.lang3.ObjectUtils;
import org.opendatadiscovery.oddplatform.integration.dto.IntegrationCodeSnippetArgumentDto;
import org.opendatadiscovery.oddplatform.integration.dto.IntegrationCodeSnippetArgumentTypeEnum;
import org.opendatadiscovery.oddplatform.integration.dto.IntegrationCodeSnippetDto;
import org.opendatadiscovery.oddplatform.integration.dto.IntegrationContentBlockDto;
import org.opendatadiscovery.oddplatform.integration.dto.IntegrationOverviewDto;
import org.opendatadiscovery.oddplatform.integration.dto.IntegrationPreviewDto;

public class IntegrationDeserializer extends StdDeserializer<IntegrationOverviewDto> {
    public IntegrationDeserializer() {
        this(null);
    }

    protected IntegrationDeserializer(final Class<?> vc) {
        super(vc);
    }

    @Override
    public IntegrationOverviewDto deserialize(
        final JsonParser p,
        final DeserializationContext ctx
    ) throws IOException {
        final ObjectNode integrationNode = p.getCodec().readTree(p);

        final String id = integrationNode.get("id").asText();
        final String name = integrationNode.get("name").asText();
        final String description = integrationNode.get("description").asText();

        final IntegrationPreviewDto integrationPreviewDto = new IntegrationPreviewDto(id, name, description);
        final List<IntegrationContentBlockDto> integrationContentBlockDtos = new ArrayList<>();

        for (final JsonNode block : integrationNode.get("blocks")) {
            final String blockTitle = block.get("title").asText();
            final String blockContent = block.get("content").asText();
            final JsonNode blockSnippets = block.get("snippets");

            final List<IntegrationCodeSnippetDto> snippets = new ArrayList<>();

            for (final JsonNode snippet : ObjectUtils.defaultIfNull(blockSnippets, List.<JsonNode>of())) {
                final String snippetTemplate = snippet.get("template").asText();

                final List<IntegrationCodeSnippetArgumentDto> arguments = new ArrayList<>();
                final Iterable<JsonNode> snippetArgs = ObjectUtils.defaultIfNull(snippet.get("arguments"), List.of());

                for (final JsonNode argument : snippetArgs) {
                    final String argParameter = argument.get("parameter").asText();
                    final String argName = argument.get("name").asText();
                    final String type = argument.get("type").asText();

                    arguments.add(new IntegrationCodeSnippetArgumentDto(
                        argParameter,
                        argName,
                        IntegrationCodeSnippetArgumentTypeEnum.valueOf(type.toUpperCase())
                    ));
                }

                snippets.add(new IntegrationCodeSnippetDto(snippetTemplate, arguments));
            }

            integrationContentBlockDtos.add(new IntegrationContentBlockDto(blockTitle, blockContent, snippets));
        }

        return new IntegrationOverviewDto(integrationPreviewDto, integrationContentBlockDtos);
    }
}
