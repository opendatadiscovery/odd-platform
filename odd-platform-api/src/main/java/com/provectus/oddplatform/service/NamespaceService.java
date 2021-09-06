package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.Namespace;
import com.provectus.oddplatform.api.contract.model.NamespaceFormData;
import com.provectus.oddplatform.api.contract.model.NamespaceList;
import com.provectus.oddplatform.api.contract.model.NamespaceUpdateFormData;

public interface NamespaceService
        extends CRUDService<Namespace, NamespaceList, NamespaceFormData, NamespaceUpdateFormData> {
}
