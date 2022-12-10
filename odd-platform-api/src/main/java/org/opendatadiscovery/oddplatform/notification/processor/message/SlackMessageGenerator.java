package org.opendatadiscovery.oddplatform.notification.processor.message;

import com.slack.api.model.Attachment;
import com.slack.api.model.block.LayoutBlock;
import com.slack.api.model.block.SectionBlock;
import com.slack.api.model.block.composition.BlockCompositions;
import java.net.URL;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.DataEntityMessageContext;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.OwnershipPair;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertChunkPojo;
import org.opendatadiscovery.oddplatform.notification.dto.AlertNotificationMessage;

import static com.slack.api.model.block.Blocks.context;
import static com.slack.api.model.block.Blocks.divider;
import static com.slack.api.model.block.Blocks.header;
import static com.slack.api.model.block.Blocks.section;
import static com.slack.api.model.block.composition.BlockCompositions.markdownText;
import static com.slack.api.model.block.composition.BlockCompositions.plainText;
import static java.util.Collections.singletonList;
import static java.util.stream.Collectors.collectingAndThen;
import static java.util.stream.Collectors.joining;
import static org.opendatadiscovery.oddplatform.notification.dto.AlertNotificationMessage.AlertEventType;
import static org.opendatadiscovery.oddplatform.notification.dto.AlertNotificationMessage.AlertedDataEntity;
import static org.opendatadiscovery.oddplatform.notification.processor.message.MrkdwnUtils.bold;
import static org.opendatadiscovery.oddplatform.notification.processor.message.MrkdwnUtils.buildLink;

@RequiredArgsConstructor
public class SlackMessageGenerator {
    private static final String MESSAGE_COLOR = "#0080f0";

    private final URL platformBaseUrl;

    public List<Attachment> generateMessage(final DataEntityMessageContext messageContext) {
        final List<LayoutBlock> blocks = new ArrayList<>();
        final DataEntityMessageContext.DataEntity dataEntity = messageContext.dataEntity();

        blocks.add(section(c -> c.text(markdownText(":speech_balloon: "
            + buildDataEntityLink(dataEntity.dataEntityId(), dataEntity.dataEntityName(), dataEntity.type())))));

        blocks.add(divider());
        blocks.add(section(c -> c.text(markdownText(messageContext.message().getText()))));

        resolveInformationalContextSection(dataEntity.dataSourceName(), dataEntity.namespaceName())
            .ifPresent(blocks::add);

        resolveOwnerContextSection(dataEntity.owners()).ifPresent(blocks::add);
        resolveTagsContextSection(dataEntity.tags()).ifPresent(blocks::add);
        resolveDEGContextSection(messageContext.degNames()).ifPresent(blocks::add);

        final Attachment attachment = Attachment.builder()
            .color(MESSAGE_COLOR)
            .blocks(blocks)
            .build();

        return singletonList(attachment);
    }

    public List<LayoutBlock> generateAlertMessage(final AlertNotificationMessage message) {
        final AlertedDataEntity dataEntity = message.getDataEntity();

        final List<LayoutBlock> blocks = new ArrayList<>();

        blocks.add(AlertEventType.RESOLVED.equals(message.getEventType())
            ? header(c -> c.text(plainText(":white_check_mark: Alert: " + message.getAlertType().getDescription())))
            : header(c -> c.text(plainText(":exclamation: Alert: " + message.getAlertType().getDescription()))));

        blocks.add(divider());
        blocks.add(section(c -> c.text(markdownText(
            buildDataEntityLink(dataEntity) + "\n" + buildDescriptionsFromChunks(message.getAlertChunks())))));

        if (message.getUpdatedBy() != null && AlertEventType.RESOLVED.equals(message.getEventType())) {
            blocks.add(section(c -> c.text(markdownText(
                String.format("Resolved by @%s", message.getUpdatedBy())))));
        }

        if (AlertEventType.RESOLVED_AUTOMATICALLY.equals(message.getEventType())) {
            blocks.add(section(c -> c.text(markdownText("Resolved automatically"))));
        }

        resolveInformationalContextSection(dataEntity).ifPresent(blocks::add);
        resolveOwnerContextSection(dataEntity).ifPresent(blocks::add);
        resolveDownstreamSections(message.getDownstream()).ifPresent(blocks::addAll);

        return blocks;
    }

    private String buildDescriptionsFromChunks(final List<AlertChunkPojo> alertChunks) {
        return alertChunks.stream()
            .sorted(Comparator.comparing(AlertChunkPojo::getCreatedAt).reversed())
            .map(AlertChunkPojo::getDescription)
            .limit(3)
            .collect(Collectors.joining("\n"));
    }

    private Optional<LayoutBlock> resolveInformationalContextSection(final AlertedDataEntity dataEntity) {
        return resolveInformationalContextSection(dataEntity.dataSourceName(), dataEntity.namespaceName());
    }

    private Optional<LayoutBlock> resolveInformationalContextSection(final String dataSource, final String namespace) {
        if (dataSource == null && namespace == null) {
            return Optional.empty();
        }

        final StringBuilder sb = new StringBuilder();
        if (dataSource != null) {
            sb.append("Data Source: ");
            sb.append(dataSource);
        }

        if (namespace != null) {
            sb.append(", ");
            sb.append("Namespace: ");
            sb.append(namespace);
        }

        return Optional.of(
            context(c -> c.elements(List.of(BlockCompositions.markdownText(cc -> cc.text(sb.toString()))))));
    }

    private Optional<LayoutBlock> resolveOwnerContextSection(final AlertedDataEntity dataEntity) {
        return resolveOwnerContextSection(dataEntity.owners());
    }

    private Optional<LayoutBlock> resolveOwnerContextSection(final Set<OwnershipPair> owners) {
        if (owners.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(
            context(c -> c.elements(List.of(BlockCompositions.markdownText(extractOwners(owners)))))
        );
    }

    private Optional<LayoutBlock> resolveTagsContextSection(final Set<String> tags) {
        if (tags.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(context(c ->
            c.elements(List.of(BlockCompositions.markdownText("Tags: " + String.join(", ", tags))))));
    }

    private Optional<LayoutBlock> resolveDEGContextSection(final List<String> degNames) {
        if (degNames.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(context(c ->
            c.elements(List.of(BlockCompositions.markdownText("Contains in: " + String.join(", ", degNames))))));
    }

    private Optional<List<LayoutBlock>> resolveDownstreamSections(final List<AlertedDataEntity> dataEntities) {
        if (dataEntities.isEmpty()) {
            return Optional.empty();
        }

        final ArrayList<LayoutBlock> downstreamSectionBlocks = new ArrayList<>();

        downstreamSectionBlocks.add(divider());
        downstreamSectionBlocks.add(section(c -> c.text(markdownText(bold("Affected data entities")))));

        final SectionBlock downstreamDataEntitiesSection = dataEntities.stream()
            .map(this::buildDataEntityLink)
            .collect(collectingAndThen(
                joining(", "),
                downstreamEntities -> section(c -> c.text(markdownText(downstreamEntities)))
            ));

        downstreamSectionBlocks.add(downstreamDataEntitiesSection);

        final Set<OwnershipPair> owners = dataEntities.stream()
            .flatMap(de -> de.owners().stream())
            .collect(Collectors.toSet());

        if (!owners.isEmpty()) {
            downstreamSectionBlocks.add(
                context(c -> c.elements(List.of(markdownText(cc -> cc.text(extractOwners(owners)))))));
        }

        return Optional.of(downstreamSectionBlocks);
    }

    private String buildDataEntityLink(final AlertedDataEntity dataEntity) {
        return buildDataEntityLink(dataEntity.id(), dataEntity.name(), dataEntity.type());
    }

    private String buildDataEntityLink(final long id, final String name, final DataEntityTypeDto type) {
        return buildLink(
            String.format("%s %s", bold(type.resolveName()), bold(name)),
            buildDataEntityUrl(id)
        );
    }

    private String extractOwners(final Set<OwnershipPair> ownershipPairs) {
        return ownershipPairs
            .stream()
            .map(owner -> String.format("@%s (%s)", owner.ownerName(), owner.titleName()))
            .collect(joining(", "));
    }

    private String buildDataEntityUrl(final long id) {
        return String.format("%s/dataentities/%d/overview", platformBaseUrl, id);
    }
}