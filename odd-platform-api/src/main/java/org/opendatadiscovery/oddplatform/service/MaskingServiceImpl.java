package org.opendatadiscovery.oddplatform.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.dto.masking.DatasetFieldMaskingDto;
import org.opendatadiscovery.oddplatform.dto.masking.MaskingRuleDto;
import org.opendatadiscovery.oddplatform.dto.masking.MaskingRuleType;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldMaskingRepositoryImpl;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveMaskingRuleRepositoryImpl;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class MaskingServiceImpl implements MaskingService {
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^([^@]+)@(.+)$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^(\\d{3})\\d{4}(\\d{4})$");
    private static final Pattern ID_CARD_PATTERN = Pattern.compile("^(\\d{3})\\d{10}(\\d{4})$");
    private static final String REDACT_CHAR = "*";

    private final ReactiveMaskingRuleRepositoryImpl maskingRuleRepository;
    private final ReactiveDatasetFieldMaskingRepositoryImpl fieldMaskingRepository;

    @Override
    public Mono<List<MaskingRuleDto>> getMaskingRules() {
        return maskingRuleRepository.findAll();
    }

    @Override
    public Mono<DatasetFieldMaskingDto> getFieldMasking(final long datasetFieldId) {
        return fieldMaskingRepository.getByFieldId(datasetFieldId);
    }

    @Override
    public Mono<List<DatasetFieldMaskingDto>> getDatasetMaskings(final long datasetId) {
        return fieldMaskingRepository.getByDatasetId(datasetId);
    }

    @Override
    public Mono<Void> applyMasking(final long datasetFieldId, final long ruleId) {
        return maskingRuleRepository.getById(ruleId)
            .switchIfEmpty(Mono.error(
                new IllegalArgumentException("Masking rule not found: " + ruleId)))
            .flatMap(rule -> fieldMaskingRepository.applyMasking(datasetFieldId, ruleId))
            .then();
    }

    @Override
    public Mono<Void> removeMasking(final long datasetFieldId) {
        return fieldMaskingRepository.removeMasking(datasetFieldId).then();
    }

    @Override
    public String maskValue(final String value, final String ruleType) {
        if (value == null || value.isEmpty()) {
            return value;
        }
        try {
            final MaskingRuleType type = MaskingRuleType.valueOf(ruleType);
            return switch (type) {
                case SHOW_LAST_4 -> maskShowLastN(value, 4);
                case SHOW_FIRST_4 -> maskShowFirstN(value, 4);
                case HASH_SHA256 -> sha256(value);
                case REDACT -> REDACT_CHAR.repeat(value.length());
                case EMAIL_MASK -> maskEmail(value);
                case PHONE_MASK -> maskPhone(value);
                case ID_CARD_MASK -> maskIdCard(value);
            };
        } catch (final Exception e) {
            log.warn("Failed to mask value with rule type: {}", ruleType, e);
            return REDACT_CHAR.repeat(value.length());
        }
    }

    private String maskShowLastN(final String value, final int n) {
        if (value.length() <= n) {
            return value;
        }
        return REDACT_CHAR.repeat(value.length() - n) + value.substring(value.length() - n);
    }

    private String maskShowFirstN(final String value, final int n) {
        if (value.length() <= n) {
            return value;
        }
        return value.substring(0, n) + REDACT_CHAR.repeat(value.length() - n);
    }

    private String sha256(final String value) {
        try {
            final MessageDigest digest = MessageDigest.getInstance("SHA-256");
            final byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            final StringBuilder hexString = new StringBuilder();
            for (final byte b : hash) {
                final String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (final NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    private String maskEmail(final String value) {
        final var matcher = EMAIL_PATTERN.matcher(value);
        if (matcher.matches()) {
            final String localPart = matcher.group(1);
            final String domain = matcher.group(2);
            final String masked;
            if (localPart.length() <= 1) {
                masked = localPart;
            } else {
                masked = localPart.charAt(0) + "***";
            }
            return masked + "@" + domain;
        }
        return REDACT_CHAR.repeat(value.length());
    }

    private String maskPhone(final String value) {
        final String digits = value.replaceAll("\\D", "");
        final var matcher = PHONE_PATTERN.matcher(digits);
        if (matcher.matches()) {
            return matcher.group(1) + "****" + matcher.group(2);
        }
        return digits.length() >= 7
            ? digits.substring(0, 3) + "****" + digits.substring(digits.length() - 4)
            : REDACT_CHAR.repeat(value.length());
    }

    private String maskIdCard(final String value) {
        final String digits = value.replaceAll("[xX]", "0"); // handle last digit X
        final var matcher = ID_CARD_PATTERN.matcher(digits);
        if (matcher.matches()) {
            final String lastDigit = value.replaceAll("\\d", "").isEmpty() ? matcher.group(2)
                : value.substring(value.length() - 4);
            return matcher.group(1) + "**********" + lastDigit;
        }
        return value.length() >= 6
            ? value.substring(0, 3) + "**********" + value.substring(value.length() - 4)
            : REDACT_CHAR.repeat(value.length());
    }
}
