import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

class EmployeeService {

    // ==========================================
    // Get All Employees
    // ==========================================
    getAllEmployees() {
        return axios.get(BASE_URL);
    }

    // ==========================================
    // Get Employee By ID
    // ==========================================
    getEmployeeById(id) {
        return axios.get(BASE_URL + "/" + id);
    }

    // ==========================================
    // Add Employee
    // ==========================================
    addEmployee(employee) {
        return axios.post(BASE_URL, employee);
    }

    // ==========================================
    // Update Employee
    // ==========================================
    updateEmployee(id, employee) {
        return axios.put(BASE_URL + "/" + id, employee);
    }

    // ==========================================
    // Delete Employee
    // ==========================================
    deleteEmployee(id) {
        return axios.delete(BASE_URL + "/" + id);
    }

}

export default new EmployeeService();