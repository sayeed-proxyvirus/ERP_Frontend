import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Spinner,
  Form,
  Modal,
  Alert,
  Card,
  Row,
  Col,
  Container,
} from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EmployeeDataTable = () => {
  const [employeeData, setEmployeeData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [sections, setSections] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [isSectionLoading, setSectionLoading] = useState(false);
  const [isJobLoading, setJobLoading] = useState(false);

  // API base URL
  const API_URL = "https://localhost:44353/api/CrudApplication";

  // Form state for the modal - matching the API field names
  const [formData, setFormData] = useState({
    empName: "",
    sectionName: "",
    jobname: "", // lowercase 'n' to match API
    joinDate: "",
    cardNo: "",
    bankAcc: "",
  });

  useEffect(() => {
    fetchEmployeeData();
    fetchSections();
  }, []);

  useEffect(() => {
    filterEmployeeData();
  }, [searchTerm, employeeData, selectedSection, selectedJob]);

  // Reset form when modal opens
  useEffect(() => {
    if (showModal) {
      if (selectedEmployee) {
        // Edit mode - populate form with selected employee data
        setFormData({
          empName: selectedEmployee.empName || "",
          sectionName: selectedEmployee.sectionName || "",
          jobname: selectedEmployee.jobname || "", // matches API response
          joinDate: selectedEmployee.joinDate
            ? selectedEmployee.joinDate.split("T")[0]
            : "",
          cardNo: selectedEmployee.cardNo || "",
          bankAcc: selectedEmployee.bankAcc || "",
        });
        if (selectedEmployee.sectionName) {
          const section = sections.find(
            (s) => s.sectionsName === selectedEmployee.sectionName
          );
          if (section) {
            fetchJobs(section.sectionsId);
          }
        }
      } else {
        // Add mode - reset form
        setFormData({
          empName: "",
          sectionName: "",
          jobname: "",
          joinDate: "",
          cardNo: "",
          bankAcc: "",
        });
      }
    }
  }, [showModal, selectedEmployee]);

  // Separate function to handle filtering logic
  const filterEmployeeData = () => {
    let result = [...employeeData];

    // Filter by section name if selected
    if (selectedSection) {
      result = result.filter(
        (employee) =>
          employee.sectionName &&
          employee.sectionName.toString() === selectedSection.toString()
      );
    }

    // Filter by job name if selected
    if (selectedJob) {
      result = result.filter(
        (employee) =>
          employee.jobname &&
          employee.jobname.toString() === selectedJob.toString()
      );
    }

    // Filter data based on search term
    if (searchTerm.trim() !== "") {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(
        (employee) =>
          (employee.empName || "").toLowerCase().includes(lowercasedSearch) ||
          (employee.sectionName || "")
            .toLowerCase()
            .includes(lowercasedSearch) ||
          (employee.jobname || "").toLowerCase().includes(lowercasedSearch) ||
          (employee.cardNo || "").toString().includes(lowercasedSearch) ||
          (employee.empId || "").toString().includes(lowercasedSearch)
      );
    }

    // Update the filtered data state
    setFilteredData(result);
  };

  const fetchEmployeeData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching data from:", `${API_URL}/EReadInformation`);

      const response = await axios.get(`${API_URL}/EReadInformation`);
      console.log("API Response:", response);

      // Check if data exists and has the correct structure
      if (response.data && response.data.isSuccess) {
        // The API returns ereadInformation (note the capital I)
        if (Array.isArray(response.data.ereadInformation)) {
          setEmployeeData(response.data.ereadInformation);
          setFilteredData(response.data.ereadInformation);
          console.log("Employee data loaded:", response.data.ereadInformation);
        } else {
          console.error("Unexpected response format:", response.data);
          throw new Error("Unexpected data format received from API");
        }
      } else {
        console.error("API response indicates failure:", response.data);
        throw new Error(
          response.data?.message || "Failed to retrieve employee data"
        );
      }
    } catch (err) {
      console.error("Error fetching employee data:", err);
      setError(
        err.response
          ? `Error: ${err.response.status} - ${
              err.response.data?.message || JSON.stringify(err.response.data)
            }`
          : err.message || "An error occurred while fetching data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmployee = async (employeeData) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${API_URL}/ECreateInformation`,
        employeeData
      );

      if (response.data && response.data.isSuccess) {
        fetchEmployeeData(); // Refresh the data
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to add employee");
      }
    } catch (err) {
      console.error("Error adding employee:", err);
      setError(
        err.response
          ? `Error: ${err.response.status} - ${
              err.response.data?.message || JSON.stringify(err.response.data)
            }`
          : err.message || "An error occurred while adding employee"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmployee = async (employeeData) => {
    try {
      setIsLoading(true);
      const response = await axios.put(`${API_URL}/EUpdateInformation`, {
        empId: employeeData.empId,
        empName: employeeData.empName,
        sectionName: employeeData.sectionName,
        jobname: employeeData.jobname,
        joinDate: employeeData.joinDate,
        cardNo: employeeData.cardNo,
        bankAcc: employeeData.bankAcc,
      });

      if (response.status === 200) {
        fetchEmployeeData(); // Refresh the data
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to update employee");
      }
    } catch (err) {
      console.error("Error updating employee:", err);
      setError(
        err.response
          ? `Error: ${err.response.status} - ${
              err.response.data?.message || JSON.stringify(err.response.data)
            }`
          : err.message || "An error occurred while updating employee"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async (empId) => {
    try {
      setIsLoading(true);

      const response = await axios.post(`${API_URL}/EDeleteInformation`, {
        id: empId,
      });

      if (response.status === 200) {
        fetchEmployeeData(); // Refresh the data
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to delete employee");
      }
    } catch (err) {
      console.error("Error deleting employee:", err);
      setError(
        err.response
          ? `Error: ${err.response.status} - ${
              err.response.data?.message || JSON.stringify(err.response.data)
            }`
          : err.message || "An error occurred while deleting employee"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });

    const sortedData = [...filteredData].sort((a, b) => {
      const aValue = a[key] || "";
      const bValue = b[key] || "";

      if (aValue < bValue) {
        return direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

    setFilteredData(sortedData);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleDelete = (empId) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      handleDeleteEmployee(empId);
    }
  };

  const handleSaveEmployee = (formData) => {
    const employeeData = {
      empName: formData.empName,
      sectionName: formData.sectionName,
      jobname: formData.jobname, // lowercase 'n' to match API
      joinDate: formData.joinDate,
      cardNo: formData.cardNo,
      bankAcc: formData.bankAcc,
    };

    if (selectedEmployee) {
      // Update existing employee
      handleUpdateEmployee({
        ...employeeData,
        empId: selectedEmployee.empId,
      }).then((success) => {
        if (success) {
          alert("Employee updated successfully!");
          setShowModal(false);
        }
      });
    } else {
      // Add new employee
      handleAddEmployee(employeeData).then((success) => {
        if (success) {
          alert("Employee added successfully!");
          setShowModal(false);
        }
      });
    }
  };

  const fetchSections = async () => {
    try {
      setSectionLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/JSReadInformation`);

      if (response.data && response.data.isSuccess) {
        if (Array.isArray(response.data.jsreadInformation)) {
          setSections(response.data.jsreadInformation);
          console.log("Sections loaded:", response.data.jsreadInformation);
        } else {
          throw new Error("Unexpected data format received from API");
        }
      } else {
        throw new Error(
          response.data?.message || "Failed to retrieve section data"
        );
      }
    } catch (err) {
      console.error("Error fetching section data:", err);
      setError(
        err.response
          ? `Error: ${err.response.status} - ${
              err.response.data?.message || JSON.stringify(err.response.data)
            }`
          : err.message || "An error occurred while fetching sections"
      );
    } finally {
      setSectionLoading(false);
    }
  };

  const fetchJobs = async (sectionsId) => {
    if (!sectionsId) {
      setJobs([]);
      return;
    }

    try {
      setJobLoading(true);
      setError(null);

      console.log("Fetching jobs for section ID:", sectionsId);

      const response = await axios.post(
        `${API_URL}/JSearchInformationBySection`,
        {
          id: sectionsId,
        }
      );

      if (response.data && response.data.isSuccess) {
        // Use the correct field name from the response
        if (Array.isArray(response.data.jSearchInformationBySections)) {
          setJobs(response.data.jSearchInformationBySections);
          console.log(
            "Jobs loaded:",
            response.data.jSearchInformationBySections
          );
        } else {
          console.error(
            "Unexpected data format received from API:",
            response.data
          );
          throw new Error("Unexpected data format received from API");
        }
      } else {
        throw new Error(
          response.data?.message || "Failed to retrieve job data"
        );
      }
    } catch (err) {
      console.error("Error fetching job data:", err);
      setError(
        err.response
          ? `Error: ${err.response.status} - ${
              err.response.data?.message || JSON.stringify(err.response.data)
            }`
          : err.message || "An error occurred while fetching jobs"
      );
      // Set empty jobs array to avoid UI issues
      setJobs([]);
    } finally {
      setJobLoading(false);
    }
  };

  const handleSectionChange = (e) => {
    const sectionValue = e.target.value;
    setSelectedSection(sectionValue);
    console.log("Selected section:", sectionValue);

    // Reset job selection when section changes
    setSelectedJob("");

    // Call fetchJobs with the selected section's ID
    if (sectionValue) {
      // Find the section object based on name
      const section = sections.find((s) => s.sectionsName === sectionValue);
      if (section) {
        fetchJobs(section.sectionsId);
      }
    } else {
      setJobs([]);
    }
  };

  const handleJobChange = (e) => {
    const jobName = e.target.value;
    setSelectedJob(jobName);
    console.log("Selected job:", jobName);
  };

  const clearFilters = () => {
    setSelectedSection("");
    setSelectedJob("");
    setSearchTerm("");
    setJobs([]);
    // This will trigger the useEffect to reset the filtered data
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return "⇵";
    }
    return sortConfig.direction === "ascending" ? "↑" : "↓";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "sectionName" && value) {
      const section = sections.find((s) => s.sectionsName === value);
      if (section) {
        fetchJobs(section.sectionsId);
      }
    }
  };

  if (isLoading && employeeData.length === 0) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading employee data...</p>
      </div>
    );
  }

  return (
    <Container fluid className="p-4">
      {error && (
        <Alert
          variant="danger"
          className="mb-4"
          dismissible
          onClose={() => setError(null)}
        >
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={fetchEmployeeData}>
            Retry
          </Button>
        </Alert>
      )}

      <Card>
        <Card.Header className="bg-primary text-white">
          <h2 className="mb-0">Employee Information Management</h2>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <div className="position-relative">
                  <Form.Control
                    as="select"
                    className="form-select"
                    onChange={handleSectionChange}
                    disabled={isSectionLoading}
                    value={selectedSection}
                    style={{
                      height: "38px",
                      borderRadius: "4px",
                      borderColor: "#ced4da",
                      padding: "0.375rem 0.75rem",
                    }}
                  >
                    <option value="">
                      {isSectionLoading ? "Loading..." : "All Sections"}
                    </option>
                    {sections.map((section) => (
                      <option
                        key={section.sectionsId}
                        value={section.sectionsName}
                      >
                        {section.sectionsName}
                      </option>
                    ))}
                  </Form.Control>
                  {isSectionLoading && (
                    <Spinner
                      animation="border"
                      size="sm"
                      className="position-absolute"
                      style={{ right: "10px", top: "10px" }}
                    />
                  )}
                </div>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <div className="position-relative">
                  <Form.Control
                    as="select"
                    className="form-select"
                    onChange={handleJobChange}
                    disabled={isJobLoading || !selectedSection}
                    value={selectedJob}
                    style={{
                      height: "38px",
                      borderRadius: "4px",
                      borderColor: "#ced4da",
                      padding: "0.375rem 0.75rem",
                    }}
                  >
                    <option value="">
                      {isJobLoading ? "Loading..." : "All Jobs"}
                    </option>
                    {jobs.map((job) => (
                      <option key={job.jobId} value={job.jobName}>
                        {job.jobName}
                      </option>
                    ))}
                  </Form.Control>
                  {isJobLoading && (
                    <Spinner
                      animation="border"
                      size="sm"
                      className="position-absolute"
                      style={{ right: "10px", top: "10px" }}
                    />
                  )}
                </div>
              </Form.Group>
            </Col>
            <Col md={3} className="text-end">
              <Button
                variant="success"
                className="me-2"
                onClick={() => {
                  setSelectedEmployee(null);
                  setShowModal(true);
                }}
              >
                Add New Employee
              </Button>
              <Button
                variant="secondary"
                onClick={fetchEmployeeData}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span className="visually-hidden">Loading...</span>
                  </>
                ) : (
                  "Refresh Data"
                )}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={clearFilters}
                disabled={!selectedSection && !selectedJob && !searchTerm}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr className="bg-light">
                  <th onClick={() => handleSort("empId")}>
                    ID {renderSortIcon("empId")}
                  </th>
                  <th onClick={() => handleSort("empName")}>
                    Employee Name {renderSortIcon("empName")}
                  </th>
                  <th onClick={() => handleSort("sectionName")}>
                    Section {renderSortIcon("sectionName")}
                  </th>
                  <th onClick={() => handleSort("jobname")}>
                    Job {renderSortIcon("jobname")}
                  </th>
                  <th onClick={() => handleSort("joinDate")}>
                    Join Date {renderSortIcon("joinDate")}
                  </th>
                  <th onClick={() => handleSort("cardNo")}>
                    Card No {renderSortIcon("cardNo")}
                  </th>
                  <th onClick={() => handleSort("bankAcc")}>
                    Bank Account {renderSortIcon("bankAcc")}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((employee) => (
                    <tr key={employee.empId}>
                      <td>{employee.empId}</td>
                      <td>{employee.empName}</td>
                      <td>{employee.sectionName}</td>
                      <td>{employee.jobname}</td>
                      <td>{formatDate(employee.joinDate)}</td>
                      <td>{employee.cardNo}</td>
                      <td>{employee.bankAcc}</td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleEdit(employee)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(employee.empId)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No employee data found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          <div className="d-flex justify-content-between mt-3">
            <div>
              <small className="text-muted">
                Total Workers: {filteredData.length}{" "}
                {filteredData.length !== employeeData.length &&
                  `(filtered from ${employeeData.length})`}
              </small>
            </div>
            <div>
              <small className="text-muted">
                Last Updated: {new Date().toLocaleString()}
              </small>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Modal for Add/Edit Employee */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedEmployee ? "Edit Employee" : "Add New Employee"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Employee Name</Form.Label>
              <Form.Control
                type="text"
                name="empName"
                value={formData.empName}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Section</Form.Label>
              <Form.Control
                as="select"
                name="sectionName"
                value={formData.sectionName}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Section</option>
                {sections.map((section) => (
                  <option key={section.sectionsId} value={section.sectionsName}>
                    {section.sectionsName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Job</Form.Label>
              <Form.Control
                as="select"
                name="jobname" // Changed to lowercase 'n' to match state and API
                value={formData.jobname}
                onChange={handleInputChange}
                required
                disabled={!formData.sectionName}
              >
                <option value="">Select Job</option>
                {jobs.map((job) => (
                  <option key={job.jobId} value={job.jobName}>
                    {job.jobName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Join Date</Form.Label>
              <Form.Control
                type="date"
                name="joinDate"
                value={formData.joinDate}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Card No</Form.Label>
              <Form.Control
                type="text"
                name="cardNo"
                value={formData.cardNo}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Bank Account</Form.Label>
              <Form.Control
                type="text"
                name="bankAcc"
                value={formData.bankAcc}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSaveEmployee(formData)}
            disabled={
              !formData.empName ||
              !formData.sectionName ||
              !formData.jobname ||
              !formData.joinDate
            }
          >
            {selectedEmployee ? "Update" : "Add"} Employee
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EmployeeDataTable;