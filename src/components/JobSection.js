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
  ListGroup
} from "react-bootstrap";
import axios from "axios";

const JobDataTable = () => {
  // Base API URL
  const API_URL = "https://localhost:44353/api/CrudApplication";
  
  // State variables
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [sections, setSections] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedSection, setSelectedSection] = useState("");
  const [sortField, setSortField] = useState("jobId");
  const [sortDirection, setSortDirection] = useState("asc");
  const [isSectionLoading, setSectionLoading] = useState(false);
  
  // Modal states
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    jobId: 0,
    jobName: "",
    sectionsId: "",
    grade: 0,
    food: 0,
    att_Bonus: 0,
  });

  // Load initial data
  useEffect(() => {
    fetchJobs();
    fetchSections();
  }, []);

  // Apply filters when searchTerm or selectedSection changes
  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedSection, jobs]);

  // Reset job form when modal opens
  useEffect(() => {
    if (showJobModal) {
      if (selectedJob) {
        // Edit mode - populate form with selected job data
        setJobFormData({
          jobId: selectedJob.jobId,
          jobName: selectedJob.jobName || "",
          sectionsId: selectedJob.sectionsId || "",
          grade: selectedJob.grade || 0,
          food: selectedJob.food || 0,  // Fixed: Default to 0 instead of ""
          att_Bonus: selectedJob.att_Bonus || 0  // Fixed: Default to 0 instead of ""
        });
      } else {
        // Add mode - reset form
        setJobFormData({
          jobId: 0,
          jobName: "",
          sectionsId: "",
          grade: 0,
          food: 0,  // Fixed: Default to 0 instead of ""
          att_Bonus: 0  // Fixed: Default to 0 instead of ""
        });
      }
    }
  }, [showJobModal, selectedJob]);

  // Fetch jobs data
  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/JReadInformation`);

      if (response.data && response.data.isSuccess) {
        if (Array.isArray(response.data.jreadInformation)) {
          const jobsData = response.data.jreadInformation;
          setJobs(jobsData);
          setFilteredJobs(jobsData);
          console.log("Jobs loaded:", jobsData);
        } else {
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
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch sections for dropdown
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

  // Create job
  const handleAddJob = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const payload = {
        jobId: 0, // API will assign proper ID
        sectionsId: parseInt(jobFormData.sectionsId),
        jobName: jobFormData.jobName,
        grade: parseInt(jobFormData.grade),
        food: parseInt(jobFormData.food) || 0,  // Fixed: Ensure it's parsed as integer
        att_Bonus: parseInt(jobFormData.att_Bonus) || 0  // Fixed: Ensure it's parsed as integer
      };
      
      console.log("Creating job with payload:", payload);
      
      const response = await axios.post(`${API_URL}/JCreateInformation`, payload);

      if (response.status === 200 && response.data.isSuccess) {
        alert("Job added successfully!");
        setShowJobModal(false);
        fetchJobs(); // Refresh the data
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to add job");
      }
    } catch (err) {
      console.error("Error adding job:", err);
      setError(
        err.response
          ? `Error: ${err.response.status} - ${
              err.response.data?.message || JSON.stringify(err.response.data)
            }`
          : err.message || "An error occurred while adding job"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update job
  const handleUpdateJob = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const payload = {
        jobId: jobFormData.jobId,
        sectionsId: parseInt(jobFormData.sectionsId),
        jobName: jobFormData.jobName,
        grade: parseInt(jobFormData.grade),
        food: parseInt(jobFormData.food) || 0,  // Fixed: Ensure it's parsed as integer
        att_Bonus: parseInt(jobFormData.att_Bonus) || 0  // Fixed: Ensure it's parsed as integer
      };
      
      console.log("Updating job with payload:", payload);
      
      const response = await axios.put(`${API_URL}/JUpdateInformation`, payload);

      if (response.status === 200 && response.data.isSuccess) {
        alert("Job updated successfully!");
        setShowJobModal(false);
        fetchJobs(); // Refresh the data
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to update job");
      }
    } catch (err) {
      console.error("Error updating job:", err);
      setError(
        err.response
          ? `Error: ${err.response.status} - ${
              err.response.data?.message || JSON.stringify(err.response.data)
            }`
          : err.message || "An error occurred while updating job"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete job
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/JDeleteInformation`, {
        id: jobId
      });

      if (response.status === 200 && response.data.isSuccess) {
        alert("Job deleted successfully!");
        fetchJobs(); // Refresh the data
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to delete job");
      }
    } catch (err) {
      console.error("Error deleting job:", err);
      setError(
        err.response
          ? `Error: ${err.response.status} - ${
              err.response.data?.message || JSON.stringify(err.response.data)
            }`
          : err.message || "An error occurred while deleting job"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle section selection for filtering
  const handleSectionChange = (e) => {
    const value = e.target.value;
    console.log("Selected section:", value);
    setSelectedSection(value);
  };

  // Apply filters based on selected section and search term
  const applyFilters = () => {
    let filtered = [...jobs];

    // Apply section filter if selected
    if (selectedSection && selectedSection !== "") {
      filtered = filtered.filter(
        (job) => job.sectionsId.toString() === selectedSection
      );
    }

    // Apply search term filter if present
    if (searchTerm.trim() !== "") {
      const lowercasedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          (job.jobName || "").toLowerCase().includes(lowercasedSearch) ||
          (job.grade || "").toString().includes(lowercasedSearch) ||
          (job.jobId || "").toString().includes(lowercasedSearch)
      );
    }

    setFilteredJobs(filtered);
  };

  // Fixed: Handle form input changes with proper numeric handling
  const handleJobInputChange = (e) => {
    const { name, value } = e.target;
    
    // For numeric fields, ensure proper handling
    if (name === 'food' || name === 'att_Bonus' || name === 'grade') {
      // Remove leading zeros and handle empty values
      let numericValue = value.replace(/^0+/, '') || '0';
      
      // If user cleared the field completely, set to 0
      if (numericValue === '' || numericValue === '0') {
        numericValue = 0;
      } else {
        // Parse as integer to ensure it's a valid number
        numericValue = parseInt(numericValue) || 0;
      }
      
      setJobFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      // For non-numeric fields, handle normally
      setJobFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle job save action
  const handleSaveJob = () => {
    if (selectedJob) {
      // Update existing job
      handleUpdateJob();
    } else {
      // Add new job
      handleAddJob();
    }
  };

  // Sorting function
  const handleSort = (field) => {
    const newDirection = field === sortField && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
    
    const sorted = [...filteredJobs].sort((a, b) => {
      if (a[field] === null) return 1;
      if (b[field] === null) return -1;
      
      if (typeof a[field] === 'string') {
        return newDirection === "asc" 
          ? a[field].localeCompare(b[field]) 
          : b[field].localeCompare(a[field]);
      } else {
        return newDirection === "asc" 
          ? a[field] - b[field] 
          : b[field] - a[field];
      }
    });
    
    setFilteredJobs(sorted);
  };

  // Render sort icon
  const renderSortIcon = (field) => {
    if (field !== sortField) return null;
    return sortDirection === "asc" ? " ▲" : " ▼";
  };

  // Get section name by ID
  const getSectionName = (sectionId) => {
    const section = sections.find(s => s.sectionsId.toString() === sectionId.toString());
    return section ? section.sectionsName : "Unknown";
  };

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
          <Button variant="outline-danger" onClick={fetchJobs}>
            Retry
          </Button>
        </Alert>
      )}

      <Card>
        <Card.Header className="bg-primary text-white">
          <h2 className="mb-0">Job Information Management</h2>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <div className="position-relative">
                  <Form.Control
                    as="select"
                    className="form-select"
                    onChange={handleSectionChange}
                    disabled={isSectionLoading}
                    value={selectedSection}
                  >
                    <option value="">All Sections</option>
                    {sections.map((section) => (
                      <option
                        key={section.sectionsId}
                        value={section.sectionsId}
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
            <Col md={4} className="text-end">
              <Button
                variant="success"
                className="me-2"
                onClick={() => {
                  setSelectedJob(null);
                  setShowJobModal(true);
                }}
              >
                Add New Job
              </Button>
              <Button
                variant="secondary"
                onClick={fetchJobs}
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
            </Col>
          </Row>

          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr className="bg-light">
                  <th onClick={() => handleSort("jobId")}>
                    ID {renderSortIcon("jobId")}
                  </th>
                  <th onClick={() => handleSort("jobName")}>
                    Job Name {renderSortIcon("jobName")}
                  </th>
                  <th onClick={() => handleSort("sectionsId")}>
                    Section {renderSortIcon("sectionsId")}
                  </th>
                  <th onClick={() => handleSort("grade")}>
                    Grade {renderSortIcon("grade")}
                  </th>
                  <th>Att_Bonus</th>
                  <th>Food</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <tr key={job.jobId}>
                      <td>{job.jobId}</td>
                      <td>{job.jobName}</td>
                      <td>{getSectionName(job.sectionsId)}</td>
                      <td>{job.grade}</td>
                      <td>{job.att_Bonus}</td>
                      <td>{job.food}</td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          className="me-1"
                          onClick={() => {
                            setSelectedJob(job);
                            setShowJobModal(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteJob(job.jobId)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
                      {isLoading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        "No job data found"
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          <div className="d-flex justify-content-between mt-3">
            <div>
              <small className="text-muted">
                Total Jobs: {filteredJobs.length}
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

      {/* Job Management Modal */}
      <Modal show={showJobModal} onHide={() => setShowJobModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedJob ? "Edit Job" : "Add New Job"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Job Name</Form.Label>
              <Form.Control
                type="text"
                name="jobName"
                value={jobFormData.jobName}
                onChange={handleJobInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Section</Form.Label>
              <Form.Select
                name="sectionsId"
                value={jobFormData.sectionsId}
                onChange={handleJobInputChange}
                required
              >
                <option value="">Select Section</option>
                {sections.map((section) => (
                  <option key={section.sectionsId} value={section.sectionsId}>
                    {section.sectionsName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Grade</Form.Label>
              <Form.Control
                type="number"
                name="grade"
                value={jobFormData.grade}
                onChange={handleJobInputChange}
                min="0"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Att_Bonus</Form.Label>
              <Form.Control
                type="number"
                name="att_Bonus"
                value={jobFormData.att_Bonus}
                onChange={handleJobInputChange}
                min="0"
                placeholder="0"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Food</Form.Label>
              <Form.Control
                type="number"
                name="food"
                value={jobFormData.food}
                onChange={handleJobInputChange}
                min="0"
                placeholder="0"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowJobModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveJob}
            disabled={
              !jobFormData.jobName ||
              !jobFormData.sectionsId ||
              jobFormData.grade === "" ||
              isLoading
            }
          >
            {isLoading ? (
              <Spinner animation="border" size="sm" />
            ) : selectedJob ? (
              "Update Job"
            ) : (
              "Add Job"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default JobDataTable;