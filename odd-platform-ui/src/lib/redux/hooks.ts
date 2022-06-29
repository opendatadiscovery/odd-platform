import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from 'react-redux';
import {
  ActivityQueryParams,
  AppDispatch,
  RootState,
} from 'redux/interfaces';
import { ActivityEventType, ActivityType } from 'generated-sources';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useUpdateActivityQuery = (
  queryName: keyof ActivityQueryParams,
  queryData:
    | Date
    | number
    | Array<number>
    | ActivityType
    | ActivityEventType,
  updateType: 'add' | 'delete'
) => {
  const dispatch = useAppDispatch();
  if (
    queryName ===
    ('beginDate' ||
      'endDate' ||
      'size' ||
      'datasourceId' ||
      'namespaceId' ||
      'type' ||
      'dataEntityId' ||
      'eventType' ||
      'lastEventDateTime')
  ) {
    // dispatch()
  }
};
