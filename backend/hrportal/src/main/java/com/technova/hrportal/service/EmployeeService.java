package com.technova.hrportal.service;

import com.technova.hrportal.entity.Employee;
import com.technova.hrportal.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    // ==========================================
    // Add Single Employee
    // ==========================================
    public Employee saveEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    // ==========================================
    // Add Multiple Employees (Bulk Insert)
    // ==========================================
    public List<Employee> saveAllEmployees(List<Employee> employees) {
        return employeeRepository.saveAll(employees);
    }

    // ==========================================
    // Get All Employees
    // ==========================================
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    // ==========================================
    // Get Employee By ID
    // ==========================================
    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id).orElse(null);
    }

    // ==========================================
    // Update Employee
    // ==========================================
    public Employee updateEmployee(Long id, Employee employee) {

        Employee existingEmployee = employeeRepository.findById(id).orElse(null);

        if (existingEmployee != null) {

            existingEmployee.setEmployeeId(employee.getEmployeeId());
            existingEmployee.setName(employee.getName());
            existingEmployee.setEmail(employee.getEmail());
            existingEmployee.setDepartment(employee.getDepartment());
            existingEmployee.setDesignation(employee.getDesignation());
            existingEmployee.setSalary(employee.getSalary());
            existingEmployee.setJoiningDate(employee.getJoiningDate());

            return employeeRepository.save(existingEmployee);
        }

        return null;
    }

    // ==========================================
    // Delete Employee
    // ==========================================
    public String deleteEmployee(Long id) {

        employeeRepository.deleteById(id);

        return "Employee Deleted Successfully";
    }
}