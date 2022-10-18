package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.TitleList;
import org.opendatadiscovery.oddplatform.mapper.TitleMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TitlePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTitleRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class TitleServiceImpl implements TitleService {

    private final ReactiveTitleRepository titleRepository;
    private final TitleMapper titleMapper;

    @Override
    public Mono<TitlePojo> getOrCreate(final String name) {
        return titleRepository.getByName(name)
            .switchIfEmpty(titleRepository.create(new TitlePojo().setName(name)));
    }

    @Override
    public Mono<TitleList> list(final int page, final int size, final String query) {
        return titleRepository.list(page, size, query).map(titleMapper::mapToTitleList);
    }
}
