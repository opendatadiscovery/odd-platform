package org.opendatadiscovery.oddplatform.integration.dto;

import java.util.List;

public record IntegrationContentBlockDto(String title, String content, List<IntegrationCodeSnippetDto> codeSnippets) {
}
