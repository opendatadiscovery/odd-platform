package org.opendatadiscovery.oddplatform.integration.dto;

import java.util.List;

public record IntegrationCodeSnippetDto(String template, List<IntegrationCodeSnippetArgumentDto> arguments) {
}
