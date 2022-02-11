package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.Token;
import org.opendatadiscovery.oddplatform.api.contract.model.TokenFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TokenList;
import org.opendatadiscovery.oddplatform.api.contract.model.TokenUpdateFormData;

public interface TokenService extends CRUDService<Token, TokenList, TokenFormData, TokenUpdateFormData> {
}
