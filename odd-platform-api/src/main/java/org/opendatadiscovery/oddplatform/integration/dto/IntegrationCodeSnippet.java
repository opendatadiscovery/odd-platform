package org.opendatadiscovery.oddplatform.integration.dto;

import java.util.List;

public record IntegrationCodeSnippet(String template, List<IntegrationCodeSnippetArgument> args) {
}
