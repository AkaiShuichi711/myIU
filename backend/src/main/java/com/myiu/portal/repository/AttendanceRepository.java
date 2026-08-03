package com.myiu.portal.repository;

import com.myiu.portal.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {
    List<Attendance> findByCourseIdAndDateOrderByStudentNameAsc(UUID courseId, LocalDate date);
    List<Attendance> findByCourseIdAndStudentIdOrderByDateAsc(UUID courseId, UUID studentId);
    List<Attendance> findByCourseIdOrderByDateAscStudentNameAsc(UUID courseId);
    Optional<Attendance> findByCourseIdAndStudentIdAndDate(UUID courseId, UUID studentId, LocalDate date);
}