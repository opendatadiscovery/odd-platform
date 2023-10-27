package org.opendatadiscovery.oddplatform.notification.sender;

import freemarker.template.Configuration;
import freemarker.template.TemplateException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.IOException;
import java.io.StringWriter;
import java.net.http.HttpClient;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.notification.dto.AlertNotificationMessage;
import org.opendatadiscovery.oddplatform.notification.exception.NotificationSenderException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

public class EmailNotificationSender extends AbstractNotificationSender<AlertNotificationMessage> {
    private static final String ALERT_PATH = "/dataentities/{dataEntityId}/alerts";
    private static final String EMAIL_SUBJECT_TEMPLATE = "ODD Platform - ${alertType} Alert";
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
    public String receiverId() {
        return "email";
    }

    @Override
    public void send(final AlertNotificationMessage message) throws InterruptedException, NotificationSenderException {
        final MimeMessage mimeMessage = emailSender.createMimeMessage();
        final MimeMessageHelper helper = new MimeMessageHelper(mimeMessage);
        try {
            final String emailContent = getEmailContent(message);

            helper.setSubject(EMAIL_SUBJECT_TEMPLATE.replace("${alertType}", message.getAlertType().name()));
            helper.setText(emailContent, true);

            for (final String notificationsEmail : notificationsEmails) {
                helper.setTo(notificationsEmail);
                emailSender.send(mimeMessage);
            }
        } catch (MessagingException | TemplateException | IOException e) {
            throw new RuntimeException(e);
        }
    }

    private String getEmailContent(final AlertNotificationMessage message) throws IOException, TemplateException {
        final StringWriter stringWriter = new StringWriter();
        final Map<String, Object> model = new HashMap<>();
        final String host = StringUtils.isBlank(System.getenv("PLATFORM_HOST_URL"))
                ? "http://localhost:8080"
                : System.getenv("PLATFORM_HOST_URL");
        final String alertUrl = host + ALERT_PATH.replace("{dataEntityId}",
                String.valueOf(message.getDataEntity().id()));

        model.put("dataEntityId", String.valueOf(message.getDataEntity().id()));
        model.put("dataEntityName", message.getDataEntity().name());
        model.put("dataEntityDataSourceName", message.getDataEntity().dataSourceName());
        model.put("dataEntityNamespaceName", message.getDataEntity().namespaceName());
        model.put("dataEntityType", message.getDataEntity().type().name());
        model.put("link", alertUrl);
        model.put("alertType", message.getAlertType().name());
        model.put("alertDescription", message.getAlertType().getDescription());
        model.put("eventAtTime", message.getEventAt().toString());

        configuration.getTemplate("email.ftlh").process(model, stringWriter);

        return stringWriter.getBuffer().toString();
    }
}
