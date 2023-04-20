import type {
  Integration as GeneratedIntegration,
  IntegrationContentBlock,
  IntegrationPreview as GeneratedIntegrationPreview,
} from 'generated-sources';

export interface IntegrationContent {
  content: IntegrationContentBlock['content'];
  codeSnippets: IntegrationContentBlock['codeSnippets'];
}

export const IntegrationIds = ['clickhouse', 'mysql', 'postgresql', 'snowflake'] as const;
export type IntegrationId = (typeof IntegrationIds)[number];

export interface Integration extends Omit<GeneratedIntegration, 'contentBlocks' | 'id'> {
  id: IntegrationId;
  contentByTitle: { [title: string]: IntegrationContent };
}

export interface IntegrationPreview extends Omit<GeneratedIntegrationPreview, 'id'> {
  id: IntegrationId;
}
