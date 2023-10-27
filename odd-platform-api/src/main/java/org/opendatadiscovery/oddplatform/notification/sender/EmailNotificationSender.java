package org.opendatadiscovery.oddplatform.notification.sender;

import java.io.IOException;
import java.io.StringWriter;
import java.net.http.HttpClient;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import freemarker.template.TemplateException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import freemarker.template.Configuration;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.dto.OwnershipPair;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertChunkPojo;
import org.opendatadiscovery.oddplatform.notification.dto.AlertNotificationMessage;
import org.opendatadiscovery.oddplatform.notification.exception.NotificationSenderException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

public class EmailNotificationSender extends AbstractNotificationSender<AlertNotificationMessage> {
    private final JavaMailSender emailSender;
    private final List<String> notificationsEmails;
    private final Configuration configuration;

    public EmailNotificationSender(final HttpClient httpClient,
                                   final JavaMailSender mailSender,
                                   final Configuration configuration,
                                   final List<String> notificationsEmails) {
        super(httpClient);
        this.emailSender = mailSender;
        this.configuration = configuration;
        this.notificationsEmails = notificationsEmails;
    }

    @Override
    public void send(final AlertNotificationMessage message) throws InterruptedException, NotificationSenderException {
        MimeMessage mimeMessage = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage);
        try {
            helper.setSubject(message.getAlertType().getDescription());
            String emailContent = getEmailContent(message);
            helper.setText(emailContent, true);

            for (String notificationsEmail : notificationsEmails) {
                helper.setTo(notificationsEmail);
                emailSender.send(mimeMessage);
            }
        } catch (MessagingException | TemplateException | IOException e) {
            throw new RuntimeException(e);
        }
    }

    String getEmailContent(final AlertNotificationMessage message) throws IOException, TemplateException {
        StringWriter stringWriter = new StringWriter();
        Map<String, Object> model = new HashMap<>();
        model.put("dataEntity", message.getDataEntity());
        configuration.getTemplate("email.ftlh").process(model, stringWriter);
        return stringWriter.getBuffer().toString();
    }

    private String buildMessage(final AlertNotificationMessage message) {
        final List<String> chunksMessages = message.getAlertChunks()
                .stream().map(this::buildChunkMessage)
                .toList();
        final List<String> downstreamMessages = message.getDownstream().stream()
                .map(this::buildEntityMessage)
                .toList();

        return ALERT_EMAIL_MESSAGE.replace("dataEntity", buildEntityMessage(message.getDataEntity()))
                .replace("alertType", message.getAlertType().name())
                .replace("alertDescription", message.getAlertType().getDescription())
                .replace("eventAtTime", message.getEventAt().toString())
                .replace("chunks", chunksMessages.isEmpty() ? "null " : chunksMessages.toString())
                .replace("downstream", downstreamMessages.isEmpty() ? "null " : downstreamMessages.toString());
    }

    private String buildEntityMessage(final AlertNotificationMessage.AlertedDataEntity dataEntity) {
        return ALERT_EMAIL_ENTITY.replace("dataEntityID", String.valueOf(dataEntity.id()))
                .replace("dataEntityName", dataEntity.name())
                .replace("dataEntityType", dataEntity.type().resolveName())
                .replace("dataEntityOwners", dataEntity.owners().stream()
                        .map(OwnershipPair::ownerName)
                        .collect(Collectors.joining(",")))
                .replace("dataSourceName", StringUtils.isBlank(dataEntity.dataSourceName())
                        ? "" : dataEntity.dataSourceName())
                .replace("namespaceName", StringUtils.isBlank(dataEntity.namespaceName())
                        ? "" : dataEntity.namespaceName());
    }

    private String buildChunkMessage(final AlertChunkPojo chunkPojo) {
        return ALERT_EMAIL_CHUNK.replace("alertID", String.valueOf(chunkPojo.getAlertId()))
                .replace("description", chunkPojo.getDescription())
                .replace("createdChunkAt", chunkPojo.getCreatedAt().toString());
    }

    @Override
    public String receiverId() {
        return "email";
    }

    private final String ALERT_EMAIL_MESSAGE =
            "Data Entity:dataEntity"
                    + "Alert:\n"
                    + " Alert Type: alertType\n"
                    + " Alert Description: alertDescription\n"
                    + " Event at: eventAtTime\n"
                    + "Alert Chunks:\nchunks\n"
                    + "Downstream Entities:\ndownstream";

    private final String ALERT_EMAIL_ENTITY =
            "\n Data Entity Id: dataEntityID\n"
                    + " Data Entity name: dataEntityName\n"
                    + " Data Entity Type: dataEntityType\n"
                    + " Data Entity owners: dataEntityOwners\n"
                    + " Data Source Name: dataSourceName\n"
                    + " Namespace Name: namespaceName\n";
    private final String ALERT_EMAIL_CHUNK =
            "\n Chunk:"
                    + "     Alert Id: alertID\n"
                    + "     Description: description\n"
                    + "     Created At: createdChunkAt\n";
}
