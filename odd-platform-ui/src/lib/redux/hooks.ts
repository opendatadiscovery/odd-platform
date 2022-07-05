import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from 'react-redux';
import {
  ActivityMultipleQueryData,
  ActivityMultipleQueryName,
  ActivityQueryNames,
  ActivitySingleQueryData,
  ActivitySingleQueryName,
  AppDispatch,
  RootState,
} from 'redux/interfaces';
import {
  deleteMultipleQueryParam,
  setMultipleQueryParam,
  setSingleQueryParam,
} from 'redux/reducers/activity.slice';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useUpdateActivityQuery = (
  queryName: ActivityQueryNames,
  queryData: ActivitySingleQueryData | ActivityMultipleQueryData,
  updateType: 'add' | 'delete' | 'addFromQuery',
  dispatch: ThunkDispatch<RootState, undefined, AnyAction>
) => {
  const singleQueryNames = [
    'beginDate',
    'endDate',
    'size',
    'datasourceId',
    'namespaceId',
    'type',
    'dataEntityId',
    'eventType',
    'lastEventDateTime',
  ];
  const multipleQueryNames = ['tagIds', 'ownerIds', 'userIds'];

  if (singleQueryNames.includes(queryName)) {
    dispatch(
      setSingleQueryParam({
        queryName: queryName as ActivitySingleQueryName,
        queryData: queryData as ActivitySingleQueryData,
      })
    );
  }

  if (multipleQueryNames.includes(queryName)) {
    if (updateType === 'delete') {
      console.log('hook', queryName, queryData);
      dispatch(
        deleteMultipleQueryParam({
          queryName: queryName as ActivityMultipleQueryName,
          queryParamId: queryData as number,
        })
      );
    } else {
      dispatch(
        setMultipleQueryParam({
          queryName: queryName as ActivityMultipleQueryName,
          queryData: queryData as ActivityMultipleQueryData,
        })
      );
    }
  }

  // if (
  //   updateType === 'addFromQuery' &&
  //   singleQueryNames.includes(queryName)
  // ) {
  // }
};
