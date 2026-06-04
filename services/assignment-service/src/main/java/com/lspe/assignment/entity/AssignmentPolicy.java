package com.lspe.assignment.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "assignment_policies", schema = "assignment_schema")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentPolicy {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @Column(nullable = false)
    private String policyVersionId;

    @Column(nullable = false, columnDefinition = "boolean DEFAULT true")
    private Boolean active;

    @Column(nullable = false)
    private LocalDateTime assignedAt;

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.assignedAt == null) {
            this.assignedAt = LocalDateTime.now();
        }
        if (this.active == null) {
            this.active = true;
        }
    }
}
