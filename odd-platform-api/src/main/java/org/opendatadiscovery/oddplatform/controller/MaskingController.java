package org.opendatadiscovery.oddplatform.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.masking.DatasetFieldMaskingDto;
import org.opendatadiscovery.oddplatform.dto.masking.MaskingRuleDto;
import org.opendatadiscovery.oddplatform.service.MaskingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/masking")
@RequiredArgsConstructor
public class MaskingController {
    private final MaskingService maskingService;

    @GetMapping("/rules")
    public Mono<ResponseEntity<List<MaskingRuleDto>>> getMaskingRules() {
        return maskingService.getMaskingRules()
            .map(ResponseEntity::ok);
    }

    @GetMapping("/dataset-fields/{fieldId}")
    public Mono<ResponseEntity<DatasetFieldMaskingDto>> getFieldMasking(
        @PathVariable final long fieldId) {
        return maskingService.getFieldMasking(fieldId)
            .map(ResponseEntity::ok);
    }

    @GetMapping("/datasets/{datasetId}")
    public Mono<ResponseEntity<List<DatasetFieldMaskingDto>>> getDatasetMaskings(
        @PathVariable final long datasetId) {
        return maskingService.getDatasetMaskings(datasetId)
            .map(ResponseEntity::ok);
    }

    @PostMapping("/dataset-fields/{fieldId}")
    public Mono<ResponseEntity<Void>> applyMasking(
        @PathVariable final long fieldId,
        @RequestParam final long ruleId) {
        return maskingService.applyMasking(fieldId, ruleId)
            .thenReturn(ResponseEntity.ok().build());
    }

    @DeleteMapping("/dataset-fields/{fieldId}")
    public Mono<ResponseEntity<Void>> removeMasking(
        @PathVariable final long fieldId) {
        return maskingService.removeMasking(fieldId)
            .thenReturn(ResponseEntity.ok().build());
    }
}
