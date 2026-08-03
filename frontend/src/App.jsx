import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";

import EmployeeList from "./pages/EmployeeList";
import AddEmployee from "./pages/AddEmployee";
import EditEmployee from "./pages/EditEmployee";

function App() {

    return (

        <BrowserRouter>

            <Navbar />

            <Routes>

                <Route
                    path="/"
                    element={
                        <>
                            <Dashboard />
                            <EmployeeList />
                        </>
                    }
                />

                <Route
                    path="/add-employee"
                    element={<AddEmployee />}
                />

                <Route
                    path="/edit-employee/:id"
                    element={<EditEmployee />}
                />

            </Routes>

        </BrowserRouter>

    );

}

export default App;