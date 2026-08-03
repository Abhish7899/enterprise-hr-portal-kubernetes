package com.technova.hrportal.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Entity
@Table(name = "employees")
@Data
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Employee ID
    @NotBlank(message = "Employee ID is required")
    @Column(nullable = false)
    private String employeeId;

    // Employee Name
    @NotBlank(message = "Employee Name is required")
    @Column(nullable = false)
    private String name;

    // Employee Email
    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email address")
    @Column(unique = true)
    private String email;

    // Department
    @NotBlank(message = "Department is required")
    private String department;

    // Designation
    @NotBlank(message = "Designation is required")
    private String designation;

    // Salary
    @Positive(message = "Salary must be greater than 0")
    private Double salary;

    // Joining Date
    @NotBlank(message = "Joining Date is required")
    private String joiningDate;
}