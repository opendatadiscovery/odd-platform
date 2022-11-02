import {
  Message as GeneratedMessage,
  DataEntityApiGetDataEntityMessagesRequest as GeneratedDataEntityApiGetDataEntityMessagesRequest,
} from 'generated-sources';

export interface Message extends Omit<GeneratedMessage, 'createdAt'> {
  createdAt: number;
}

export interface DataEntityApiGetDataEntityMessagesRequest
  extends Omit<
    GeneratedDataEntityApiGetDataEntityMessagesRequest,
    'lastMessageDateTime'
  > {
  lastMessageDateTime?: number;
}
