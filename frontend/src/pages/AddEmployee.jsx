import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeService from "../services/EmployeeService";

function AddEmployee() {

    const navigate = useNavigate();

    const [employee, setEmployee] = useState({
        employeeId: "",
        name: "",
        email: "",
        department: "",
        designation: "",
        salary: "",
        joiningDate: ""
    });

    const handleChange = (e) => {

        const { name, value } = e.target;

        setEmployee({
            ...employee,
            [name]: value
        });

    };

    const saveEmployee = (e) => {

        e.preventDefault();

        EmployeeService.addEmployee(employee)
            .then(() => {

                alert("Employee Added Successfully!");

                navigate("/");

            })
            .catch((error) => {

                console.log(error);

                alert("Unable to Save Employee");

            });

    };

    return (

        <div className="container mt-5">

            <div className="card shadow">

                <div className="card-header bg-primary text-white">

                    <h3>Add Employee</h3>

                </div>

                <div className="card-body">

                    <form onSubmit={saveEmployee}>

                        <div className="mb-3">
                            <label>Employee ID</label>
                            <input
                                type="text"
                                className="form-control"
                                name="employeeId"
                                value={employee.employeeId}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label>Name</label>
                            <input
                                type="text"
                                className="form-control"
                                name="name"
                                value={employee.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label>Email</label>
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                value={employee.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label>Department</label>
                            <input
                                type="text"
                                className="form-control"
                                name="department"
                                value={employee.department}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label>Designation</label>
                            <input
                                type="text"
                                className="form-control"
                                name="designation"
                                value={employee.designation}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label>Salary</label>
                            <input
                                type="number"
                                className="form-control"
                                name="salary"
                                value={employee.salary}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label>Joining Date</label>
                            <input
                                type="date"
                                className="form-control"
                                name="joiningDate"
                                value={employee.joiningDate}
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-success"
                        >
                            Save Employee
                        </button>

                    </form>

                </div>

            </div>

        </div>

    );

}

export default AddEmployee;