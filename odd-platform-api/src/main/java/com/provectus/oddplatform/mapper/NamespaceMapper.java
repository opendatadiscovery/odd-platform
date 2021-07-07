package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.api.contract.model.Namespace;
import com.provectus.oddplatform.api.contract.model.NamespaceFormData;
import com.provectus.oddplatform.api.contract.model.NamespaceList;
import com.provectus.oddplatform.api.contract.model.NamespaceUpdateFormData;
import com.provectus.oddplatform.model.tables.pojos.NamespacePojo;

public interface NamespaceMapper
    extends CRUDMapper<Namespace, NamespaceList, NamespaceFormData, NamespaceUpdateFormData, NamespacePojo> {
}
