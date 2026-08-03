package com.myiu.portal.repository;

import com.myiu.portal.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GroupMemberRepository extends JpaRepository<GroupMember, UUID> {
    List<GroupMember> findByGroupId(UUID groupId);
    List<GroupMember> findByCourseId(UUID courseId);
    List<GroupMember> findByStudentId(UUID studentId);
    Optional<GroupMember> findByGroupIdAndStudentId(UUID groupId, UUID studentId);
}
