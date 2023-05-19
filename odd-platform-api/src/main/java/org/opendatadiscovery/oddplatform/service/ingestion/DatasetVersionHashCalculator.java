package org.opendatadiscovery.oddplatform.service.ingestion;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Comparator;
import java.util.List;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.opendatadiscovery.oddplatform.dto.ingestion.HashableDatasetField;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetFieldType;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Component;

@Component
public class DatasetVersionHashCalculator {
    private static final String ALGORITHM = "SHA-256";
    private static final String EMPTY_FIELDS_HASH = "0";

    public String calculateStructureHash(final List<DataSetField> fields) {
        if (CollectionUtils.isEmpty(fields)) {
            return EMPTY_FIELDS_HASH;
        }

        final List<HashableDatasetField> sortedFields = fields.stream()
            .map(f -> HashableDatasetField.builder()
                .name(f.getName())
                .oddrn(f.getOddrn())
                .parentFieldOddrn(f.getParentFieldOddrn())
                .type(f.getType())
                .isKey(BooleanUtils.toBoolean(f.getIsKey()))
                .isValue(BooleanUtils.toBoolean(f.getIsValue()))
                .isPrimaryKey(BooleanUtils.toBoolean(f.getIsPrimaryKey()))
                .build())
            .sorted(Comparator.comparing(HashableDatasetField::getOddrn))
            .toList();

        return calculateHash(sortedFields);
    }

    public String calculateStructureHashFromPojos(final List<DatasetFieldPojo> fields) {
        if (CollectionUtils.isEmpty(fields)) {
            return EMPTY_FIELDS_HASH;
        }
        final List<HashableDatasetField> sortedFields = fields.stream()
            .map(f -> {
                final DataSetFieldType dataSetFieldType =
                    JSONSerDeUtils.deserializeJson(f.getType().data(), DataSetFieldType.class);
                return HashableDatasetField.builder()
                    .name(f.getName())
                    .oddrn(f.getOddrn())
                    .parentFieldOddrn(f.getParentFieldOddrn())
                    .type(dataSetFieldType)
                    .isKey(BooleanUtils.toBoolean(f.getIsKey()))
                    .isValue(BooleanUtils.toBoolean(f.getIsValue()))
                    .isPrimaryKey(BooleanUtils.toBoolean(f.getIsPrimaryKey()))
                    .build();
            })
            .sorted(Comparator.comparing(HashableDatasetField::getOddrn))
            .toList();

        return calculateHash(sortedFields);
    }

    private String calculateHash(final List<HashableDatasetField> sortedFields) {
        final MessageDigest md = createSHA256MessageDigest();
        final StringBuilder sb = new StringBuilder();

        for (final byte b : md.digest(JSONSerDeUtils.serializeJson(sortedFields).getBytes())) {
            sb.append(Integer.toString((b & 0xff) + 0x100, 16).substring(1));
        }

        return sb.toString();
    }

    private MessageDigest createSHA256MessageDigest() {
        try {
            return MessageDigest.getInstance(ALGORITHM);
        } catch (final NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
