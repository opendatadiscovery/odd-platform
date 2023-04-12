package org.opendatadiscovery.oddplatform.integration.dto;

import java.util.List;

public record IntegrationContentBlock(String title, String content, List<IntegrationCodeSnippet> codeSnippets) {
}
