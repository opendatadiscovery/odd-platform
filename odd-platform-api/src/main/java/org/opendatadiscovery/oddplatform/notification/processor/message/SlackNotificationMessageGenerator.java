package org.opendatadiscovery.oddplatform.notification.processor.message;

import com.slack.api.model.block.LayoutBlock;
import com.slack.api.model.block.SectionBlock;
import com.slack.api.model.block.composition.BlockCompositions;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.notification.dto.AlertNotificationMessage;
import org.opendatadiscovery.oddplatform.notification.dto.OwnershipPair;

import static com.slack.api.model.block.Blocks.context;
import static com.slack.api.model.block.Blocks.divider;
import static com.slack.api.model.block.Blocks.header;
import static com.slack.api.model.block.Blocks.section;
import static com.slack.api.model.block.composition.BlockCompositions.markdownText;
import static com.slack.api.model.block.composition.BlockCompositions.plainText;
import static java.util.stream.Collectors.collectingAndThen;
import static java.util.stream.Collectors.joining;
import static org.opendatadiscovery.oddplatform.notification.dto.AlertNotificationMessage.AlertEventType;
import static org.opendatadiscovery.oddplatform.notification.dto.AlertNotificationMessage.AlertedDataEntity;
import static org.opendatadiscovery.oddplatform.notification.processor.message.MrkdwnUtils.bold;
import static org.opendatadiscovery.oddplatform.notification.processor.message.MrkdwnUtils.buildLink;

@RequiredArgsConstructor
public class SlackNotificationMessageGenerator {
    private final URL platformBaseUrl;

    public List<LayoutBlock> generate(final AlertNotificationMessage message) {
        final AlertedDataEntity dataEntity = message.getDataEntity();

        final List<LayoutBlock> blocks = new ArrayList<>();

        blocks.add(AlertEventType.RESOLVED.equals(message.getEventType())
            ? header(c -> c.text(plainText(":white_check_mark: Alert: " + message.getAlertType().getDescription())))
            : header(c -> c.text(plainText(":exclamation: Alert: " + message.getAlertType().getDescription()))));

        blocks.add(divider());
        blocks.add(section(c -> c.text(
            markdownText(buildDataEntityLink(dataEntity) + "\n" + message.getAlertDescription()))));

        if (message.getUpdatedBy() != null) {
            final String updatedByText = switch (message.getEventType()) {
                case REOPENED -> "Reopened by";
                case RESOLVED -> "Resolved by";
                default -> throw new IllegalArgumentException(
                    "Not supported type for updated_by text building: %s".formatted(message.getEventType()));
            };

            blocks.add(section(c -> c.text(markdownText(
                String.format("%s @%s", updatedByText, message.getUpdatedBy())))));
        }

        resolveInformationalContextSection(dataEntity).ifPresent(blocks::add);
        resolveOwnerContextSection(dataEntity).ifPresent(blocks::add);
        resolveDownstreamSections(message.getDownstream()).ifPresent(blocks::addAll);

        return blocks;
    }

    private Optional<LayoutBlock> resolveInformationalContextSection(final AlertedDataEntity dataEntity) {
        if (dataEntity.namespaceName() == null && dataEntity.dataSourceName() == null) {
            return Optional.empty();
        }

        final StringBuilder sb = new StringBuilder();
        if (dataEntity.dataSourceName() != null) {
            sb.append("Data Source: ");
            sb.append(dataEntity.dataSourceName());
        }

        if (dataEntity.namespaceName() != null) {
            sb.append(", ");
            sb.append("Namespace: ");
            sb.append(dataEntity.namespaceName());
        }

        return Optional.of(
            context(c -> c.elements(List.of(BlockCompositions.markdownText(cc -> cc.text(sb.toString()))))));
    }

    private Optional<LayoutBlock> resolveOwnerContextSection(final AlertedDataEntity dataEntity) {
        if (dataEntity.owners().isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(
            context(c -> c.elements(List.of(BlockCompositions.markdownText(extractOwners(dataEntity.owners())))))
        );
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
        return buildLink(
            String.format("%s %s", dataEntity.type().resolveName(), bold(dataEntity.name())),
            buildDataEntityUrl(dataEntity.id())
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