import type {
  Alert as GeneratedAlert,
  DataEntityAlertConfig as GeneratedDataEntityAlertConfig,
} from 'generated-sources';
import type { SerializeDateToNumber } from 'redux/interfaces/common';

export type Alert = SerializeDateToNumber<GeneratedAlert>;
export type DataEntityAlertConfig = SerializeDateToNumber<GeneratedDataEntityAlertConfig>;

export interface AlertsConfig {
  dataEntityId: number;
  config: DataEntityAlertConfig;
}
