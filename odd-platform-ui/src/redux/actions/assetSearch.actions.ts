import { createActionType } from 'redux/lib/helpers';

export const assetSearchActionTypePrefix = 'assetSearch';

export const searchAssetsActionType = createActionType(
  assetSearchActionTypePrefix,
  'searchAssets'
);

export const fetchAssetSearchHighlightActionType = createActionType(
  assetSearchActionTypePrefix,
  'fetchAssetSearchHighlight'
);
