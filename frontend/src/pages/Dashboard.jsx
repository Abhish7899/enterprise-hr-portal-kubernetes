import { useEffect, useState } from "react";
import EmployeeService from "../services/EmployeeService";

function Dashboard() {

    const [employees, setEmployees] = useState([]);

    useEffect(() => {

        EmployeeService.getAllEmployees()
            .then((response) => {

                setEmployees(response.data);

            })
            .catch((error) => {

                console.log(error);

            });

    }, []);

    const totalEmployees = employees.length;

    const totalDepartments = new Set(
        employees.map(emp => emp.department)
    ).size;

    const highestSalary =
        employees.length > 0
            ? Math.max(...employees.map(emp => emp.salary))
            : 0;

    const lowestSalary =
        employees.length > 0
            ? Math.min(...employees.map(emp => emp.salary))
            : 0;

    return (

        <div className="container mt-4">

            <div className="row">

                <div className="col-md-3">

                    <div className="card bg-primary text-white shadow">

                        <div className="card-body text-center">

                            <h5>Total Employees</h5>

                            <h2>{totalEmployees}</h2>

                        </div>

                    </div>

                </div>

                <div className="col-md-3">

                    <div className="card bg-success text-white shadow">

                        <div className="card-body text-center">

                            <h5>Departments</h5>

                            <h2>{totalDepartments}</h2>

                        </div>

                    </div>

                </div>

                <div className="col-md-3">

                    <div className="card bg-warning text-dark shadow">

                        <div className="card-body text-center">

                            <h5>Highest Salary</h5>

                            <h2>₹{highestSalary}</h2>

                        </div>

                    </div>

                </div>

                <div className="col-md-3">

                    <div className="card bg-danger text-white shadow">

                        <div className="card-body text-center">

                            <h5>Lowest Salary</h5>

                            <h2>₹{lowestSalary}</h2>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Dashboard;