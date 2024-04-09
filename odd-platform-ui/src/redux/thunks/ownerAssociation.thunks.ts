import type {
  OwnerAssociationRequest,
  OwnerAssociationRequestApiCreateOwnerAssociationRequestRequest,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { ownerAssociationRequestApi } from 'lib/api';

export const createOwnerAssociationRequest = handleResponseAsyncThunk<
  OwnerAssociationRequest,
  OwnerAssociationRequestApiCreateOwnerAssociationRequestRequest
>(
  actions.createOwnerAssociationRequestActionType,
  async ({ ownerFormData }) =>
    await ownerAssociationRequestApi.createOwnerAssociationRequest({
      ownerFormData,
    }),
  {
    setSuccessOptions: ({ ownerFormData }) => ({
      id: `association-request-${ownerFormData.name}`,
      message: `Request for associating with owner ${ownerFormData.name} successfully created.`,
    }),
  }
);
