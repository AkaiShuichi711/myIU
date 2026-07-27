package com.myiu.portal.service;

import com.myiu.portal.dto.CourseDTO;
import com.myiu.portal.entity.*;
import com.myiu.portal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public List<CourseDTO> getAll() {
        return courseRepository.findByIsActiveTrueOrderByCreatedAtDesc()
                .stream().map(this::toDTO).toList();
    }

    public CourseDTO getById(UUID id) {
        return toDTO(courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found")));
    }

    @Transactional
    public CourseDTO create(UUID creatorId, CourseDTO req) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Course course = Course.builder()
                .name(req.getName()).code(req.getCode())
                .semester(req.getSemester()).description(req.getDescription())
                .coverColor(req.getCoverColor() != null ? req.getCoverColor() : "#0B2275")
                .isActive(true).creator(creator).build();
        return toDTO(courseRepository.save(course));
    }

    @Transactional
    public CourseDTO update(UUID id, CourseDTO req) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        if (req.getName() != null) course.setName(req.getName());
        if (req.getCode() != null) course.setCode(req.getCode());
        if (req.getSemester() != null) course.setSemester(req.getSemester());
        if (req.getDescription() != null) course.setDescription(req.getDescription());
        if (req.getCoverColor() != null) course.setCoverColor(req.getCoverColor());
        return toDTO(courseRepository.save(course));
    }

    @Transactional
    public void delete(UUID id) {
        courseRepository.deleteById(id);
    }

    private CourseDTO toDTO(Course c) {
        return CourseDTO.builder()
                .id(c.getId()).name(c.getName()).code(c.getCode())
                .semester(c.getSemester()).description(c.getDescription())
                .coverColor(c.getCoverColor()).isActive(c.isActive())
                .creatorId(c.getCreator().getId()).creatorName(c.getCreator().getName())
                .createdAt(c.getCreatedAt()).build();
    }
}
