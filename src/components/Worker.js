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

const WorkerDataTable = () => {
  const [WorkerData, setWorkerData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [sections, setSections] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [isSectionLoading, setSectionLoading] = useState(false);
  const [isJobLoading, setJobLoading] = useState(false);

  // API base URL
  const API_URL = "https://localhost:44353/api/CrudApplication";

  useEffect(() => {
    fetchWorkerData();
    fetchSections();
  }, []);

  // Fixed useEffect for filtering data
  useEffect(() => {
    filterWorkerData();
  }, [searchTerm, WorkerData, selectedSection, selectedJob]);

  // Separate function to handle filtering logic
  const filterWorkerData = () => {
    let result = [...WorkerData];

    // Filter by section name if selected
    if (selectedSection) {
      result = result.filter(
        (worker) =>
          worker.sectionName &&
          worker.sectionName.toString() === selectedSection.toString()
      );
    }

    // Filter by job name if selected
    if (selectedJob) {
      result = result.filter(
        (worker) =>
          worker.jobName && worker.jobName.toString() === selectedJob.toString()
      );
    }

    // Filter by search term
    if (searchTerm.trim() !== "") {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(
        (worker) =>
          (worker.name || "").toLowerCase().includes(lowercasedSearch) ||
          (worker.sectionName || "")
            .toString()
            .toLowerCase()
            .includes(lowercasedSearch) ||
          (worker.jobName || "")
            .toString()
            .toLowerCase()
            .includes(lowercasedSearch) ||
          (worker.cardNo || "").toString().includes(lowercasedSearch) ||
          (worker.id || "").toString().includes(lowercasedSearch)
      );
    }

    setFilteredData(result);
  };

  const fetchWorkerData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching data from:", `${API_URL}/WReadInformation`);

      const response = await axios.get(`${API_URL}/WReadInformation`);
      console.log("API Response:", response);

      // Check if data exists and has the correct structure
      if (response.data && response.data.isSuccess) {
        // The API returns wreadInformation
        if (Array.isArray(response.data.wreadInformation)) {
          setWorkerData(response.data.wreadInformation);
          setFilteredData(response.data.wreadInformation);
          console.log("Worker data loaded:", response.data.wreadInformation);
        } else {
          console.error("Unexpected response format:", response.data);
          throw new Error("Unexpected data format received from API");
        }
      } else {
        console.error("API response indicates failure:", response.data);
        throw new Error(
          response.data?.message || "Failed to retrieve Worker data"
        );
      }
    } catch (err) {
      console.error("Error fetching Worker data:", err);
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

  const handleAddWorker = async (WorkerData) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${API_URL}/WCreateInformation`,
        WorkerData
      );

      if (response.data && response.data.isSuccess) {
        fetchWorkerData(); // Refresh the data
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to add Worker");
      }
    } catch (err) {
      console.error("Error adding Worker:", err);
      setError(
        err.response
          ? `Error: ${err.response.status} - ${
              err.response.data?.message || JSON.stringify(err.response.data)
            }`
          : err.message || "An error occurred while adding Worker"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateWorker = async (WorkerData) => {
    try {
      setIsLoading(true);
      const response = await axios.put(`${API_URL}/WUpdateInformation`, {
        id: WorkerData.id,
        name: WorkerData.name,
        sectionName: WorkerData.sectionName,
        jobName: WorkerData.jobName,
        joinDate: WorkerData.joinDate,
        cardNo: WorkerData.cardNo,
        bankAC: WorkerData.bankAC,
        grade: WorkerData.grade,
      });

      if (response.status === 200) {
        fetchWorkerData(); // Refresh the data
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to update Worker");
      }
    } catch (err) {
      console.error("Error updating Worker:", err);
      setError(
        err.response
          ? `Error: ${err.response.status} - ${
              err.response.data?.message || JSON.stringify(err.response.data)
            }`
          : err.message || "An error occurred while updating Worker"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWorker = async (id) => {
    try {
      setIsLoading(true);

      const response = await axios.post(`${API_URL}/WDeleteInformation`, {
        id: id,
      });

      if (response.status === 200) {
        fetchWorkerData(); // Refresh the data
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to delete Worker");
      }
    } catch (err) {
      console.error("Error deleting Worker:", err);
      setError(
        err.response
          ? `Error: ${err.response.status} - ${
              err.response.data?.message || JSON.stringify(err.response.data)
            }`
          : err.message || "An error occurred while deleting Worker"
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

  const handleEdit = (Worker) => {
    // Assuming this opens a modal/form with Worker data
    setSelectedWorker(Worker);
    setShowModal(true); // Or however you're handling the edit form display

    // Load jobs for the worker's section
    if (Worker.sectionName) {
      // Find the section ID based on the name
      const section = sections.find(
        (s) => s.sectionsName === Worker.sectionName
      );
      if (section) {
        fetchJobs(section.sectionsId);
      }
    }
  };

  const handleDelete = (id) => {
    // Typically you'd want a confirmation before deleting
    if (window.confirm("Are you sure you want to delete this Worker?")) {
      handleDeleteWorker(id);
    }
  };

  const handleSaveWorker = (formData) => {
    const WorkerData = {
      name: formData.name,
      sectionName: formData.sectionName,
      jobName: formData.jobName,
      joinDate: formData.joinDate,
      cardNo: formData.cardNo,
      bankAC: formData.bankAC,
      grade: formData.grade,
    };

    if (selectedWorker) {
      // Update existing Worker
      handleUpdateWorker({
        ...WorkerData,
        id: selectedWorker.id,
      }).then((success) => {
        if (success) {
          alert("Worker updated successfully!");
          setShowModal(false);
        }
      });
    } else {
      // Add new Worker
      handleAddWorker(WorkerData).then((success) => {
        if (success) {
          alert("Worker added successfully!");
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

  // Form state for the modal - matching the updated API field names
  const [formData, setFormData] = useState({
    name: "",
    sectionName: "",
    jobName: "",
    joinDate: "",
    cardNo: "",
    bankAC: "",
    grade: "",
  });

  // Reset form when modal opens
  useEffect(() => {
    if (showModal) {
      if (selectedWorker) {
        // Edit mode - populate form with selected Worker data
        setFormData({
          name: selectedWorker.name || "",
          sectionName: selectedWorker.sectionName || "",
          jobName: selectedWorker.jobName || "",
          joinDate: selectedWorker.joinDate
            ? selectedWorker.joinDate.split("T")[0]
            : "",
          cardNo: selectedWorker.cardNo || "",
          bankAC: selectedWorker.bankAC || "",
          grade: selectedWorker.grade || "",
        });

        // If there's a section name, fetch the related jobs
        if (selectedWorker.sectionName) {
          const section = sections.find(
            (s) => s.sectionsName === selectedWorker.sectionName
          );
          if (section) {
            fetchJobs(section.sectionsId);
          }
        }
      } else {
        // Add mode - reset form
        setFormData({
          name: "",
          sectionName: "",
          jobName: "",
          joinDate: "",
          cardNo: "",
          bankAC: "",
          grade: "",
        });
      }
    }
  }, [showModal, selectedWorker]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If changing section in the form, fetch related jobs
    if (name === "sectionName" && value) {
      const section = sections.find((s) => s.sectionsName === value);
      if (section) {
        fetchJobs(section.sectionsId);
      }
    }
  };

  if (isLoading && WorkerData.length === 0) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading Worker data...</p>
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
          <Button variant="outline-danger" onClick={fetchWorkerData}>
            Retry
          </Button>
        </Alert>
      )}

      <Card>
        <Card.Header className="bg-primary text-white">
          <h2 className="mb-0">Worker Information Management</h2>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Search Workers..."
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
                  setSelectedWorker(null);
                  setShowModal(true);
                }}
              >
                Add New Worker
              </Button>
              <Button
                variant="secondary"
                onClick={fetchWorkerData}
                disabled={isLoading}
                className="me-2"
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
                  <th onClick={() => handleSort("id")}>
                    ID {renderSortIcon("id")}
                  </th>
                  <th onClick={() => handleSort("name")}>
                    Worker Name {renderSortIcon("name")}
                  </th>
                  <th onClick={() => handleSort("sectionName")}>
                    Section {renderSortIcon("sectionName")}
                  </th>
                  <th onClick={() => handleSort("jobName")}>
                    Job {renderSortIcon("jobName")}
                  </th>
                  <th onClick={() => handleSort("joinDate")}>
                    Join Date {renderSortIcon("joinDate")}
                  </th>
                  <th onClick={() => handleSort("cardNo")}>
                    Card No {renderSortIcon("cardNo")}
                  </th>
                  <th onClick={() => handleSort("bankAC")}>
                    Bank Account {renderSortIcon("bankAC")}
                  </th>
                  <th onClick={() => handleSort("grade")}>
                    Grade {renderSortIcon("grade")}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((Worker) => (
                    <tr key={Worker.id}>
                      <td>{Worker.id}</td>
                      <td>{Worker.name}</td>
                      <td>{Worker.sectionName}</td>
                      <td>{Worker.jobName}</td>
                      <td>{formatDate(Worker.joinDate)}</td>
                      <td>{Worker.cardNo}</td>
                      <td>{Worker.bankAC}</td>
                      <td>{Worker.grade}</td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleEdit(Worker)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(Worker.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center">
                      No Worker data found. Try clearing filters or adjusting
                      search criteria.
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
                {filteredData.length !== WorkerData.length &&
                  `(filtered from ${WorkerData.length})`}
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

      {/* Modal for Add/Edit Worker */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedWorker ? "Edit Worker" : "Add New Worker"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Worker Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
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
                name="jobName"
                value={formData.jobName}
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
                type="number"
                name="bankAC"
                value={formData.bankAC}
                onChange={handleInputChange}
                min="0"
                step="1"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Grade</Form.Label>
              <Form.Control
                type="number"
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
                min="0"
                step="1"
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
            onClick={() => handleSaveWorker(formData)}
            disabled={
              !formData.name ||
              !formData.sectionName ||
              !formData.jobName ||
              !formData.joinDate
            }
          >
            {selectedWorker ? "Update" : "Add"} Worker
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default WorkerDataTable;
