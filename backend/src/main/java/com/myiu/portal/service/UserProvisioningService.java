package com.myiu.portal.service;

import com.myiu.portal.entity.User;
import com.myiu.portal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserProvisioningService {

    private final UserRepository userRepository;

    @Value("${app.provision.max-create-per-run:200}")
    private int maxCreatePerRun;

    @Value("${app.provision.max-delete-per-run:100}")
    private int maxDeletePerRun;

    // ── Result record ─────────────────────────────────────────

    public record ProvisionResult(
            int createAttempted,
            int createSucceeded,
            int createSkipped,
            boolean createLimitHit,
            int deleteAttempted,
            int deleteSucceeded,
            int deleteSkipped,
            boolean deleteLimitHit,
            List<String> created,
            List<String> deactivated,
            List<String> errors
    ) {}

    // ── Main entry point ──────────────────────────────────────

    @Transactional
    public ProvisionResult processExcel(MultipartFile file, String adminEmail) throws IOException {
        if (!isExcelFile(file)) {
            throw new IllegalArgumentException("File must be .xlsx format");
        }

        List<UserRow> createRows;
        List<String>  deleteEmails;

        try (Workbook wb = new XSSFWorkbook(file.getInputStream())) {
            Sheet createSheet = findSheet(wb, "Create", 0);
            Sheet deleteSheet = findSheet(wb, "Delete", 1);

            createRows   = parseCreateSheet(createSheet);
            deleteEmails = parseDeleteSheet(deleteSheet);
        }

        // Validate: one email must appear in only ONE sheet
        Set<String> createEmails = new HashSet<>();
        createRows.forEach(r -> createEmails.add(r.email().toLowerCase()));

        List<String> errors = new ArrayList<>();
        deleteEmails.removeIf(email -> {
            if (createEmails.contains(email.toLowerCase())) {
                errors.add("Conflict: " + email + " appears in both Create and Delete sheets");
                return true;
            }
            return false;
        });

        // Apply limits
        boolean createLimitHit = createRows.size() > maxCreatePerRun;
        boolean deleteLimitHit = deleteEmails.size() > maxDeletePerRun;
        if (createLimitHit) createRows = createRows.subList(0, maxCreatePerRun);
        if (deleteLimitHit) deleteEmails = deleteEmails.subList(0, maxDeletePerRun);

        // Process Create sheet
        List<String> created = new ArrayList<>();
        int createSkipped = 0;
        for (UserRow row : createRows) {
            try {
                String emailLower = row.email().trim().toLowerCase();
                if (userRepository.findByEmail(emailLower).isPresent()) {
                    // Already exists — reactivate if was deactivated
                    userRepository.findByEmail(emailLower).ifPresent(u -> {
                        if (!u.isActive()) {
                            u.setActive(true);
                            u.setProvisionedBy(adminEmail);
                            u.setProvisionedAt(Instant.now());
                            userRepository.save(u);
                        }
                    });
                    createSkipped++;
                    continue;
                }

                String username = generateUniqueUsername(emailLower.split("@")[0]);
                String role     = normalizeRole(row.role());

                User user = User.builder()
                        .name(row.name() != null && !row.name().isBlank() ? row.name() : emailLower.split("@")[0])
                        .username(username)
                        .email(emailLower)
                        .authProvider("microsoft")
                        .isActive(true)
                        .msTenantId(row.msTenantId())
                        .provisionedBy(adminEmail)
                        .provisionedAt(Instant.now())
                        .roles(Set.of(role))
                        .build();

                userRepository.save(user);
                created.add(emailLower);
                log.info("Provisioned user: {} (role={}, by={})", emailLower, role, adminEmail);

            } catch (Exception e) {
                errors.add("Create failed for " + row.email() + ": " + e.getMessage());
                log.error("Provision create error for {}: {}", row.email(), e.getMessage());
            }
        }

        // Process Delete sheet
        List<String> deactivated = new ArrayList<>();
        int deleteSkipped = 0;
        for (String email : deleteEmails) {
            try {
                String emailLower = email.trim().toLowerCase();
                Optional<User> userOpt = userRepository.findByEmail(emailLower);
                if (userOpt.isEmpty()) {
                    deleteSkipped++;
                    continue;
                }
                User user = userOpt.get();
                user.setActive(false);
                user.setProvisionedBy(adminEmail);
                user.setProvisionedAt(Instant.now());
                userRepository.save(user);
                deactivated.add(emailLower);
                log.info("Deactivated user: {} (by={})", emailLower, adminEmail);

            } catch (Exception e) {
                errors.add("Delete failed for " + email + ": " + e.getMessage());
                log.error("Provision delete error for {}: {}", email, e.getMessage());
            }
        }

        return new ProvisionResult(
                createRows.size(), created.size(), createSkipped, createLimitHit,
                deleteEmails.size(), deactivated.size(), deleteSkipped, deleteLimitHit,
                created, deactivated, errors
        );
    }

    // ── Excel parsing helpers ─────────────────────────────────

    private record UserRow(String email, String name, String role, String msTenantId) {}

    private Sheet findSheet(Workbook wb, String name, int fallbackIndex) {
        Sheet s = wb.getSheet(name);
        if (s == null && wb.getNumberOfSheets() > fallbackIndex) {
            s = wb.getSheetAt(fallbackIndex);
        }
        if (s == null) throw new IllegalArgumentException("Sheet '" + name + "' not found in Excel file");
        return s;
    }

    private List<UserRow> parseCreateSheet(Sheet sheet) {
        List<UserRow> rows = new ArrayList<>();
        Map<String, Integer> headers = readHeaders(sheet);

        int emailCol      = colIndex(headers, "email");
        int nameCol       = colIndex(headers, "name",        -1);
        int roleCol       = colIndex(headers, "role",        -1);
        int tenantCol     = colIndex(headers, "ms_tenant_id", -1);

        for (int i = sheet.getFirstRowNum() + 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;
            String email = cellStr(row, emailCol);
            if (email == null || email.isBlank()) continue;
            rows.add(new UserRow(
                    email.trim(),
                    nameCol  >= 0 ? cellStr(row, nameCol)  : null,
                    roleCol  >= 0 ? cellStr(row, roleCol)  : "student",
                    tenantCol >= 0 ? cellStr(row, tenantCol) : null
            ));
        }
        return rows;
    }

    private List<String> parseDeleteSheet(Sheet sheet) {
        List<String> emails = new ArrayList<>();
        Map<String, Integer> headers = readHeaders(sheet);
        int emailCol = colIndex(headers, "email");

        for (int i = sheet.getFirstRowNum() + 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;
            String email = cellStr(row, emailCol);
            if (email != null && !email.isBlank()) emails.add(email.trim());
        }
        return emails;
    }

    private Map<String, Integer> readHeaders(Sheet sheet) {
        Map<String, Integer> map = new HashMap<>();
        Row header = sheet.getRow(sheet.getFirstRowNum());
        if (header == null) return map;
        for (Cell cell : header) {
            String v = cellStr(cell);
            if (v != null) map.put(v.trim().toLowerCase(), cell.getColumnIndex());
        }
        return map;
    }

    private int colIndex(Map<String, Integer> headers, String name) {
        Integer idx = headers.get(name);
        if (idx == null) throw new IllegalArgumentException("Column '" + name + "' not found in sheet");
        return idx;
    }

    private int colIndex(Map<String, Integer> headers, String name, int defaultVal) {
        return headers.getOrDefault(name, defaultVal);
    }

    private String cellStr(Row row, int col) {
        if (col < 0) return null;
        Cell cell = row.getCell(col);
        return cellStr(cell);
    }

    private String cellStr(Cell cell) {
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default      -> null;
        };
    }

    private String generateUniqueUsername(String base) {
        base = base.replaceAll("[^a-zA-Z0-9._-]", "").toLowerCase();
        if (base.isBlank()) base = "user";
        String username = base;
        int suffix = 1;
        while (userRepository.existsByUsername(username)) {
            username = base + suffix++;
        }
        return username;
    }

    private String normalizeRole(String raw) {
        if (raw == null || raw.isBlank()) return "student";
        return switch (raw.trim().toLowerCase()) {
            case "lecturer", "teacher", "giangvien", "giảng viên", "gv" -> "lecturer";
            case "admin", "administrator"                                -> "admin";
            default                                                      -> "student";
        };
    }

    private boolean isExcelFile(MultipartFile file) {
        String name = file.getOriginalFilename();
        return name != null && name.toLowerCase().endsWith(".xlsx");
    }
}
