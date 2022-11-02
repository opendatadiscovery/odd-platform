import {
  Message as GeneratedMessage,
  DataEntityApiGetDataEntityMessagesRequest as GeneratedDataEntityApiGetDataEntityMessagesRequest,
  DataEntityApiGetMessagesRequest,
} from 'generated-sources';

export interface Message extends Omit<GeneratedMessage, 'createdAt'> {
  createdAt: number;
}

export interface MessagesByDate {
  [date: string]: Message[];
}

export interface DataEntityApiGetDataEntityMessagesRequest
  extends Omit<
    GeneratedDataEntityApiGetDataEntityMessagesRequest,
    'lastMessageDateTime'
  > {
  lastMessageDateTime?: number;
}

export interface DataEntityApiGetRelatedMessagesRequest
  extends Omit<DataEntityApiGetMessagesRequest, 'lastMessageDateTime'> {
  lastMessageDateTime?: number;
}
