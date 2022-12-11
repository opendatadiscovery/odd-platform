import type {
  Alert as GeneratedAlert,
  DataEntityAlertConfig as GeneratedDataEntityAlertConfig,
} from 'generated-sources';
import type { SerializeDateToNumber, CurrentPageInfo } from 'redux/interfaces/common';

export type Alert = SerializeDateToNumber<GeneratedAlert>;
export type DataEntityAlertConfig = SerializeDateToNumber<GeneratedDataEntityAlertConfig>;

export interface AlertsResponse {
  items: Alert[];
  pageInfo: CurrentPageInfo;
}

export interface AlertsConfig {
  dataEntityId: number;
  config: DataEntityAlertConfig;
}
