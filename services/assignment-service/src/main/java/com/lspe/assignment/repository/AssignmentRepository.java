package com.lspe.assignment.repository;

import com.lspe.assignment.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, String> {
    
    List<Assignment> findByCourseCode(String courseCode);
    
    boolean existsByIdAndCourseCode(String id, String courseCode);
}
