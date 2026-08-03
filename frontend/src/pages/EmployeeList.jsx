import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeService from "../services/EmployeeService";

function EmployeeList() {

    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = () => {

        EmployeeService.getAllEmployees()
            .then((response) => {
                setEmployees(response.data);
            })
            .catch((error) => {
                console.log(error);
            });

    };

    const editEmployee = (id) => {
        navigate(`/edit-employee/${id}`);
    };

    const deleteEmployee = (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this employee?"
        );

        if (confirmDelete) {

            EmployeeService.deleteEmployee(id)
                .then(() => {

                    alert("Employee Deleted Successfully!");

                    loadEmployees();

                })
                .catch((error) => {

                    console.log(error);

                    alert("Unable to Delete Employee");

                });

        }

    };

    const filteredEmployees = employees.filter((employee) =>

        employee.employeeId.toLowerCase().includes(search.toLowerCase()) ||

        employee.name.toLowerCase().includes(search.toLowerCase()) ||

        employee.department.toLowerCase().includes(search.toLowerCase()) ||

        employee.designation.toLowerCase().includes(search.toLowerCase())

    );

    return (

        <div className="container mt-5">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <h2>Employee List</h2>

                <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Search Employee..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

            </div>

            <table className="table table-bordered table-striped">

                <thead className="table-dark">

                    <tr>

                        <th>ID</th>
                        <th>Employee ID</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Designation</th>
                        <th>Salary</th>
                        <th>Action</th>

                    </tr>

                </thead>

                <tbody>

                    {

                        filteredEmployees.map((employee) => (

                            <tr key={employee.id}>

                                <td>{employee.id}</td>
                                <td>{employee.employeeId}</td>
                                <td>{employee.name}</td>
                                <td>{employee.department}</td>
                                <td>{employee.designation}</td>
                                <td>{employee.salary}</td>

                                <td>

                                    <button
                                        className="btn btn-primary btn-sm me-2"
                                        onClick={() => editEmployee(employee.id)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => deleteEmployee(employee.id)}
                                    >
                                        Delete
                                    </button>

                                </td>

                            </tr>

                        ))

                    }

                </tbody>

            </table>

        </div>

    );

}

export default EmployeeList;