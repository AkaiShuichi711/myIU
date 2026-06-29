package com.myiu.portal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "course_grades",
       uniqueConstraints = @UniqueConstraint(columnNames = {"course_id", "student_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CourseGrade {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "course_id", nullable = false)
    private UUID courseId;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "student_name")
    private String studentName;

    @Column(precision = 5, scale = 2)
    private BigDecimal quiz;

    @Column(precision = 5, scale = 2)
    private BigDecimal exercise;

    @Column(precision = 5, scale = 2)
    private BigDecimal lab;

    @Column(precision = 5, scale = 2)
    private BigDecimal midterm;

    @Column(precision = 5, scale = 2)
    private BigDecimal project;

    @Column(name = "final_score", precision = 5, scale = 2)
    private BigDecimal finalScore;

    @Column(name = "graded_by")
    private UUID gradedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
