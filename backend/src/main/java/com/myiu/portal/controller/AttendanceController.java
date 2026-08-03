package com.myiu.portal.controller;

import com.myiu.portal.dto.ApiResponse;
import com.myiu.portal.entity.Attendance;
import com.myiu.portal.entity.User;
import com.myiu.portal.exception.NotFoundException;
import com.myiu.portal.repository.AttendanceRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController extends BaseController {

    private final AttendanceRepository attendanceRepo;

    /** Lecturer: get attendance for a course (optionally filtered by date or student) */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Attendance>>> get(
            @RequestParam UUID courseId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) UUID studentId) {
        List<Attendance> result;
        if (date != null) {
            result = attendanceRepo.findByCourseIdAndDateOrderByStudentNameAsc(courseId, date);
        } else if (studentId != null) {
            result = attendanceRepo.findByCourseIdAndStudentIdOrderByDateAsc(courseId, studentId);
        } else {
            result = attendanceRepo.findByCourseIdOrderByDateAscStudentNameAsc(courseId);
        }
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /** Student: get own attendance for a course */
    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<Attendance>>> mine(
            @RequestParam UUID courseId,
            @AuthenticationPrincipal UserDetails principal) {
        User user = currentUser(principal);
        return ResponseEntity.ok(ApiResponse.ok(
                attendanceRepo.findByCourseIdAndStudentIdOrderByDateAsc(courseId, user.getId())));
    }

    /** Lecturer: upsert a single attendance record */
    @PostMapping
    @PreAuthorize("hasRole('lecturer')")
    public ResponseEntity<ApiResponse<Attendance>> upsert(
            @Valid @RequestBody UpsertRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        User lecturer = currentUser(principal);
        Attendance record = attendanceRepo
                .findByCourseIdAndStudentIdAndDate(req.getCourseId(), req.getStudentId(), req.getDate())
                .orElseGet(Attendance::new);

        record.setCourseId(req.getCourseId());
        record.setStudentId(req.getStudentId());
        record.setStudentName(req.getStudentName());
        record.setDate(req.getDate());
        record.setStatus(req.getStatus());
        record.setNote(req.getNote());
        record.setMarkedBy(lecturer.getId());

        return ResponseEntity.ok(ApiResponse.ok(attendanceRepo.save(record)));
    }

    /** Lecturer: bulk upsert for a whole class on one date */
    @PostMapping("/bulk")
    @PreAuthorize("hasRole('lecturer')")
    public ResponseEntity<ApiResponse<List<Attendance>>> bulk(
            @Valid @RequestBody BulkRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        User lecturer = currentUser(principal);
        List<Attendance> saved = req.getRecords().stream().map(r -> {
            Attendance record = attendanceRepo
                    .findByCourseIdAndStudentIdAndDate(req.getCourseId(), r.getStudentId(), req.getDate())
                    .orElseGet(Attendance::new);
            record.setCourseId(req.getCourseId());
            record.setStudentId(r.getStudentId());
            record.setStudentName(r.getStudentName());
            record.setDate(req.getDate());
            record.setStatus(r.getStatus());
            record.setNote(r.getNote());
            record.setMarkedBy(lecturer.getId());
            return record;
        }).map(attendanceRepo::save).toList();
        return ResponseEntity.ok(ApiResponse.ok(saved));
    }

    /** Lecturer: delete a record */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('lecturer')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        Attendance record = attendanceRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Attendance record not found"));
        attendanceRepo.delete(record);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @Data static class UpsertRequest {
        @NotNull
        private UUID courseId;
        @NotNull
        private UUID studentId;
        private String studentName;
        @NotNull
        private LocalDate date;
        @NotNull
        private Attendance.Status status;
        private String note;
    }

    @Data static class BulkRequest {
        @NotNull
        private UUID courseId;
        @NotNull
        private LocalDate date;
        @NotEmpty @Valid
        private List<StudentRecord> records;

        @Data static class StudentRecord {
            @NotNull
            private UUID studentId;
            private String studentName;
            @NotNull
            private Attendance.Status status;
            private String note;
        }
    }
}