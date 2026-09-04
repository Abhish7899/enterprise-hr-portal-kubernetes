package com.technova.hrportal.controller;

import com.technova.hrportal.entity.Employee;
import com.technova.hrportal.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    // ==========================================
    // Add Single Employee
    // ==========================================
    @PostMapping
    public Employee addEmployee(@Valid @RequestBody Employee employee) {
        return employeeService.saveEmployee(employee);
    }

    // ==========================================
    // Add Multiple Employees (Bulk Insert)
    // ==========================================
    @PostMapping("/bulk")
    public List<Employee> addEmployees(@RequestBody List<Employee> employees) {
        return employeeService.saveAllEmployees(employees);
    }

    // ==========================================
    // Get All Employees
    // ==========================================
    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    // ==========================================
    // Get Employee By ID
    // ==========================================
    @GetMapping("/{id}")
    public Employee getEmployeeById(@PathVariable Long id) {
        return employeeService.getEmployeeById(id);
    }

    // ==========================================
    // Update Employee
    // ==========================================
    @PutMapping("/{id}")
    public Employee updateEmployee(@PathVariable Long id,
                                   @Valid @RequestBody Employee employee) {
        return employeeService.updateEmployee(id, employee);
    }

    // ==========================================
    // Delete Employee
    // ==========================================
    @DeleteMapping("/{id}")
    public String deleteEmployee(@PathVariable Long id) {
        return employeeService.deleteEmployee(id);
    }
}