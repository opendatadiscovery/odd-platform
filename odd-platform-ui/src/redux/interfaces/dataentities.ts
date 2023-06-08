import {
  type DataEntity as GeneratedDataEntity,
  type DataEntityDetails,
} from 'generated-sources';
import type { SerializeDateToNumber } from 'redux/interfaces/common';

export type DataEntity = SerializeDateToNumber<GeneratedDataEntity>;

export interface DataEntityDetailsState extends DataEntityDetails {
  unknownSourcesCount: number;
  unknownTargetsCount: number;
  unknownInputsCount: number;
  unknownOutputsCount: number;
}
