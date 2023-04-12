package org.opendatadiscovery.oddplatform.integration.serde;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.TreeNode;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.fasterxml.jackson.databind.node.ArrayNode;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.opendatadiscovery.oddplatform.integration.dto.IntegrationCodeSnippet;
import org.opendatadiscovery.oddplatform.integration.dto.IntegrationCodeSnippetArgument;
import org.opendatadiscovery.oddplatform.integration.dto.IntegrationCodeSnippetArgumentType;
import org.opendatadiscovery.oddplatform.integration.dto.IntegrationContentBlock;
import org.opendatadiscovery.oddplatform.integration.dto.IntegrationOverviewDto;
import org.opendatadiscovery.oddplatform.integration.dto.IntegrationPreviewDto;

public class IntegrationDeserializer extends StdDeserializer<IntegrationOverviewDto> {
    protected IntegrationDeserializer(final Class<?> vc) {
        super(vc);
    }

    @Override
    public IntegrationOverviewDto deserialize(
        final JsonParser p,
        final DeserializationContext ctx
    ) throws IOException, JacksonException {
        final TreeNode integrationNode = p.getCodec().readTree(p);

        final String id = integrationNode.get("id").asToken().asString();
        final String name = integrationNode.get("name").asToken().asString();
        final String description = integrationNode.get("description").asToken().asString();

        final IntegrationPreviewDto integrationPreviewDto = new IntegrationPreviewDto(id, name, description);
        final List<IntegrationContentBlock> integrationContentBlocks = new ArrayList<>();

        for (final JsonNode block : (ArrayNode) integrationNode.get("blocks")) {
            final String blockTitle = block.get("title").asText();
            final String blockContent = block.get("content").asText();

            final List<IntegrationCodeSnippet> snippets = new ArrayList<>();

            for (final JsonNode snippet : block.get("snippets")) {
                final String snippetTemplate = snippet.get("template").asText();

                final List<IntegrationCodeSnippetArgument> arguments = new ArrayList<>();
                for (final JsonNode argument : snippet.get("arguments")) {
                    final String argName = argument.get("name").asText();
                    final String type = argument.get("type").asText();
                    arguments.add(new IntegrationCodeSnippetArgument(
                        argName,
                        IntegrationCodeSnippetArgumentType.valueOf(type.toUpperCase())
                    ));
                }

                snippets.add(new IntegrationCodeSnippet(snippetTemplate, arguments));
            }

            integrationContentBlocks.add(new IntegrationContentBlock(blockTitle, blockContent, snippets));
        }

        return new IntegrationOverviewDto(integrationPreviewDto, integrationContentBlocks);
    }
}
