import type { DataEntity, TermApiGetTermLinkedEntitiesRequest } from 'generated-sources';
import type { CurrentPageInfo } from 'redux/interfaces';
import * as actions from 'redux/actions';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { termApi } from 'lib/api';

export const fetchTermLinkedList = handleResponseAsyncThunk<
  { termId: number; linkedEntitiesList: DataEntity[]; pageInfo: CurrentPageInfo },
  TermApiGetTermLinkedEntitiesRequest
>(
  actions.fetchTermLinkedListAction,
  async params => {
    const { items, pageInfo } = await termApi.getTermLinkedEntities(params);

    return {
      termId: params.termId,
      linkedEntitiesList: items,
      pageInfo: {
        ...pageInfo,
        page: params.page,
        hasNext: params.size * params.page < pageInfo.total,
      },
    };
  },
  { switchOffErrorMessage: true }
);
