import type {
  Integration as GeneratedIntegration,
  IntegrationContentBlock,
} from 'generated-sources';

export type EventType = 'created' | 'added' | 'assigned' | 'updated' | 'deleted';

export type DatasetFieldKey = 'primary' | 'sort' | 'nullable';

export interface IntegrationContent {
  content: IntegrationContentBlock['content'];
  codeSnippets: IntegrationContentBlock['codeSnippets'];
}

export interface Integration extends Omit<GeneratedIntegration, 'contentBlocks'> {
  contentByTitle: { [title: string]: IntegrationContent };
}
