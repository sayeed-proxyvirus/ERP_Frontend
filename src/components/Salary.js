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

const WorkerDataTable = () => {
  const [workerData, setWorkerData] = useState([]);
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

  // API base URL - using https as shown in your curl request
  const API_URL = "https://localhost:44353/api/CrudApplication";

  useEffect(() => {
    fetchSalaryData();
    fetchSections();
  }, []);

  // Fixed useEffect for filtering data
  useEffect(() => {
    filterWorkerData();
  }, [searchTerm, workerData, selectedSection, selectedJob]);

  // Separate function to handle filtering logic
  const filterWorkerData = () => {
    if (!workerData || workerData.length === 0) {
      setFilteredData([]);
      return;
    }

    let result = [...workerData];

    // Filter by section name if selected
    if (selectedSection) {
      result = result.filter(
        (worker) => worker.sectionName && 
                   worker.sectionName.toString() === selectedSection.toString()
      );
    }

    // Filter by job name if selected
    if (selectedJob) {
      result = result.filter(
        (worker) => worker.jobName && 
                   worker.jobName.toString() === selectedJob.toString()
      );
    }

    // Filter by search term
    if (searchTerm.trim() !== "") {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(
        (worker) =>
          (worker.name || "").toLowerCase().includes(lowercasedSearch) ||
          (worker.sectionName || "").toString().toLowerCase().includes(lowercasedSearch) ||
          (worker.jobName || "").toString().toLowerCase().includes(lowercasedSearch) ||
          (worker.cardNo || "").toString().includes(lowercasedSearch) ||
          (worker.id || "").toString().includes(lowercasedSearch)
      );
    }

    setFilteredData(result);
  };

  const fetchSalaryData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching data from:", `${API_URL}/SReadInformation`);

      const response = await axios.get(`${API_URL}/SReadInformation`);
      console.log("API Response:", response);

      // Check if data exists and has the correct structure
      if (response.data && response.data.isSuccess) {
        // The API returns sreadInformation
        if (Array.isArray(response.data.sreadInformation)) {
          // Map response data and ensure salary_Amount is properly handled
          const processedData = response.data.sreadInformation.map(worker => ({
            ...worker,
            // Make sure salary_Amount is converted to a number
            salary_Amount: worker.salary_Amount !== null ? Number(worker.salary_Amount) : 0
          }));
          
          setWorkerData(processedData);
          setFilteredData(processedData);
          console.log("Worker data loaded:", processedData);
        } else {
          console.error("Unexpected response format:", response.data);
          throw new Error("Unexpected data format received from API");
        }
      } else {
        console.error("API response indicates failure:", response.data);
        throw new Error(response.data?.message || "Failed to retrieve Worker data");
      }
    } catch (err) {
      console.error("Error fetching Worker data:", err);
      setError(
        err.response
          ? `Error: ${err.response.status} - ${err.response.data?.message || JSON.stringify(err.response.data)}`
          : err.message || "An error occurred while fetching data. Please check your API server."
      );
      // Initialize empty arrays when API fails
      setWorkerData([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSalary = async (salaryData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Format current date as YYYY-MM-DD for API
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      
      // Log the data being sent
      console.log("Updating salary with data:", {
        id: salaryData.id,
        salary_Amount: parseFloat(salaryData.salaryAmount),
        update_date: formattedDate
      });
      
      // Make PUT request with current date and salary amount
      const response = await axios.put(`${API_URL}/SUpdateInformation`, {
        id: salaryData.id,
        salary_Amount: parseFloat(salaryData.salaryAmount),
        update_date: formattedDate
      });
  
      console.log("Update salary response:", response);
      
      if (!response.data || !response.data.isSuccess) {
        throw new Error(response.data?.message || "Failed to update salary");
      }
      
      return true;
    } catch (err) {
      console.error("Error updating salary:", err);
      setError(`Failed to update salary: ${err.message || "Unknown error"}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleDateString();
    } catch (e) {
      return "Error";
    }
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });

    // Special handling for salary_Amount
    const actualKey = key === "salary" ? "salary_Amount" : key;

    const sortedData = [...filteredData].sort((a, b) => {
      const aValue = a[actualKey] || "";
      const bValue = b[actualKey] || "";

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

  const handleEdit = (worker) => {
    setSelectedWorker(worker);
    setShowModal(true);

    // Load jobs for the worker's section
    if (worker.sectionName) {
      // Find the section ID based on the name
      const section = sections.find(s => s.sectionsName === worker.sectionName);
      if (section) {
        fetchJobs(section.sectionsId);
      }
    }
  };

  const handleSaveSalary = async (formData) => {
    if (!selectedWorker || !formData.salaryAmount) {
      setError("Missing worker information or salary amount");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const salaryData = {
        id: selectedWorker.id,
        salaryAmount: parseFloat(formData.salaryAmount)
      };
      
      const updateSuccessful = await handleUpdateSalary(salaryData);
      
      if (updateSuccessful) {
        alert("Salary updated successfully!");
        setShowModal(false);
        await fetchSalaryData(); // Properly refresh data after successful update
      }
    } catch (err) {
      console.error("Error in save salary workflow:", err);
      setError(err.message || "Error updating salary");
    } finally {
      setIsLoading(false);
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
        throw new Error(response.data?.message || "Failed to retrieve section data");
      }
    } catch (err) {
      console.error("Error fetching section data:", err);
      setError(
        err.response
          ? `Error: ${err.response.status} - ${err.response.data?.message || JSON.stringify(err.response.data)}`
          : `${err.message || "An error occurred while fetching sections"}. Please check your API server.`
      );
      setSections([]);
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

      const response = await axios.post(`${API_URL}/JSearchInformationBySection`, {
        id: sectionsId,
      });

      if (response.data && response.data.isSuccess) {
        // Use the correct field name from the response
        if (Array.isArray(response.data.jSearchInformationBySections)) {
          setJobs(response.data.jSearchInformationBySections);
          console.log("Jobs loaded:", response.data.jSearchInformationBySections);
        } else {
          console.error("Unexpected data format received from API:", response.data);
          throw new Error("Unexpected data format received from API");
        }
      } else {
        throw new Error(response.data?.message || "Failed to retrieve job data");
      }
    } catch (err) {
      console.error("Error fetching job data:", err);
      setError(
        err.response
          ? `Error: ${err.response.status} - ${err.response.data?.message || JSON.stringify(err.response.data)}`
          : `${err.message || "An error occurred while fetching jobs"}. Please check your API server.`
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
      } else {
        setJobs([]);
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
  
  const refreshData = async () => {
    await fetchSalaryData();
    if (selectedSection) {
      const section = sections.find(s => s.sectionsName === selectedSection);
      if (section) {
        await fetchJobs(section.sectionsId);
      }
    }
  };

  // Form state for the modal - matching the updated API field names
  const [formData, setFormData] = useState({
    salaryAmount: "",
  });

  // Reset form when modal opens
  useEffect(() => {
    if (showModal && selectedWorker) {
      setFormData({
        salaryAmount: selectedWorker.salary_Amount || "", // Changed to match API response property
      });
    }
  }, [showModal, selectedWorker]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isLoading && workerData.length === 0) {
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
          <Button variant="outline-danger" onClick={fetchSalaryData}>
            Retry
          </Button>
        </Alert>
      )}

      <Card>
        <Card.Header className="bg-primary text-white">
          <h2 className="mb-0">Salary Information Management</h2>
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
                variant="secondary"
                onClick={refreshData}
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
                  <th onClick={() => handleSort("cardNo")}>
                    Card No {renderSortIcon("cardNo")}
                  </th>
                  <th onClick={() => handleSort("salary")}>
                    Salary {renderSortIcon("salary")}
                  </th>
                  <th onClick={() => handleSort("update_date")}>
                    Update_date {renderSortIcon("update_date")}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((worker) => (
                    <tr key={worker.id}>
                      <td>{worker.id}</td>
                      <td>{worker.name}</td>
                      <td>{worker.sectionName}</td>
                      <td>{worker.jobName}</td>
                      <td>{worker.cardNo}</td>
                      <td>{worker.salaryAmt || worker.salary_Amount || 0}</td>
                      <td>{formatDate(worker.update_date)}</td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleEdit(worker)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
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
                Last Updated: {new Date().toLocaleString()}
              </small>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Modal for Edit Worker Salary */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Worker Salary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedWorker && (
            <div className="mb-3">
              <p><strong>WorkerID:</strong> {selectedWorker.id}</p>
              <p><strong>Worker:</strong> {selectedWorker.name}</p>
              <p><strong>Section:</strong> {selectedWorker.sectionName}</p>
              <p><strong>Job:</strong> {selectedWorker.jobName}</p>
              <p><strong>Card No:</strong> {selectedWorker.cardNo}</p>
              <p><strong>Current Salary:</strong> {selectedWorker.salaryAmt || selectedWorker.salary_Amount || '0'}</p>
            </div>
          )}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Salary Amount</Form.Label>
              <Form.Control
                type="number"
                name="salaryAmount"
                value={formData.salaryAmount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
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
            onClick={() => handleSaveSalary(formData)}
            disabled={!formData.salaryAmount}
          >
            Update Salary
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default WorkerDataTable;