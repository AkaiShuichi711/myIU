package com.myiu.portal.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Async("emailExecutor")
    public void sendFormApproved(String toEmail, String recipientName, String formTitle, String submissionId) {
        String subject = "[myIU] Đơn \"" + formTitle + "\" đã được duyệt";
        String html = buildHtml(
                recipientName,
                "Đơn của bạn đã được duyệt",
                "Chúc mừng! Đơn <strong>\"" + escHtml(formTitle) + "\"</strong> của bạn đã được phê duyệt.",
                null,
                submissionId,
                true
        );
        send(toEmail, subject, html);
    }

    @Async("emailExecutor")
    public void sendFormRejected(String toEmail, String recipientName, String formTitle,
                                  String rejectionReason, String submissionId) {
        String subject = "[myIU] Đơn \"" + formTitle + "\" chưa được duyệt";
        String html = buildHtml(
                recipientName,
                "Đơn của bạn chưa được duyệt",
                "Đơn <strong>\"" + escHtml(formTitle) + "\"</strong> của bạn chưa được phê duyệt.",
                rejectionReason,
                submissionId,
                false
        );
        send(toEmail, subject, html);
    }

    private void send(String to, String subject, String html) {
        if (fromAddress == null || fromAddress.isBlank()) {
            log.warn("SMTP_USER not configured — skipping email to {}", to);
            return;
        }
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(fromAddress, "myIU Portal");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(msg);
            log.info("Email sent → {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private String buildHtml(String name, String heading, String body,
                              String rejectionReason, String submissionId, boolean approved) {
        String accentColor = approved ? "#16a34a" : "#dc2626";
        String badgeLabel  = approved ? "Đã duyệt" : "Từ chối";
        String ctaUrl      = frontendUrl + "/forms/submissions/" + submissionId;

        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html lang=\"vi\"><head>")
          .append("<meta charset=\"UTF-8\">")
          .append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">")
          .append("<title>").append(heading).append("</title>")
          .append("</head>")
          .append("<body style=\"margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;\">")
          .append("<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#f1f5f9;padding:32px 0;\">")
          .append("<tr><td align=\"center\">")
          .append("<table width=\"560\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);\">")

          // Header bar
          .append("<tr><td style=\"background:#003087;padding:24px 32px;\">")
          .append("<span style=\"color:#ffffff;font-size:20px;font-weight:700;letter-spacing:.5px;\">myIU Portal</span>")
          .append("</td></tr>")

          // Status badge row
          .append("<tr><td style=\"padding:28px 32px 0;\">")
          .append("<span style=\"display:inline-block;padding:5px 14px;border-radius:99px;background:").append(accentColor).append(";color:#fff;font-size:13px;font-weight:600;\">")
          .append(badgeLabel).append("</span>")
          .append("</td></tr>")

          // Heading
          .append("<tr><td style=\"padding:12px 32px 0;\">")
          .append("<h1 style=\"margin:0;font-size:20px;font-weight:700;color:#1e293b;\">").append(escHtml(heading)).append("</h1>")
          .append("</td></tr>")

          // Greeting + body
          .append("<tr><td style=\"padding:16px 32px 0;font-size:15px;color:#475569;line-height:1.6;\">")
          .append("Xin chào <strong>").append(escHtml(name)).append("</strong>,<br><br>")
          .append(body)
          .append("</td></tr>");

        // Rejection reason box
        if (rejectionReason != null && !rejectionReason.isBlank()) {
            sb.append("<tr><td style=\"padding:16px 32px 0;\">")
              .append("<div style=\"background:#fef2f2;border-left:4px solid #dc2626;border-radius:6px;padding:14px 16px;\">")
              .append("<p style=\"margin:0 0 4px;font-size:12px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:.5px;\">Lý do</p>")
              .append("<p style=\"margin:0;font-size:14px;color:#7f1d1d;\">").append(escHtml(rejectionReason)).append("</p>")
              .append("</div>")
              .append("</td></tr>");
        }

        // CTA button
        sb.append("<tr><td style=\"padding:24px 32px;\">")
          .append("<a href=\"").append(ctaUrl).append("\" style=\"display:inline-block;padding:11px 24px;background:#009CD1;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;\">")
          .append("Xem chi tiết đơn</a>")
          .append("</td></tr>")

          // Divider + footer
          .append("<tr><td style=\"padding:0 32px 24px;\">")
          .append("<hr style=\"border:none;border-top:1px solid #e2e8f0;margin-bottom:16px;\">")
          .append("<p style=\"margin:0;font-size:12px;color:#94a3b8;\">Email này được gửi tự động từ hệ thống myIU Portal. Vui lòng không trả lời email này.</p>")
          .append("</td></tr>")
          .append("</table>")
          .append("</td></tr></table>")
          .append("</body></html>");

        return sb.toString();
    }

    private String escHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
