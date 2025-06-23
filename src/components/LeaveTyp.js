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

const LeaveDataTable = () => {
  // Base API URL
  const API_URL = "https://localhost:44353/api/CrudApplication";
  
  // State variables
  const [isLoading, setIsLoading] = useState(false);
  const [leaves, setLeaves] = useState([]);
  
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  ///const [selectedJob, setSelectedJob] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState("");
  const [sortField, setSortField] = useState("jobId");
  const [sortDirection, setSortDirection] = useState("asc");
  const [isLeaveLoading, setLeaveLoading] = useState(false);
  
  // Modal states
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    id: 0,
    status: "",
    valid_days: ""
  });

  // Load initial data
  useEffect(() => {
    ///fetchJobs();
    fetchLeaves();
  }, []);

  // Apply filters when searchTerm or selectedSection changes
  useEffect(() => {
    // applyFilters();
  }, [searchTerm, selectedLeave, leaves]);

  // Reset job form when modal opens
  useEffect(() => {
    if (showLeaveModal) {
      if (selectedLeave) {
        // Edit mode - populate form with selected job data
        setLeaveFormData({
          id: selectedLeave.id,
          status: selectedLeave.status || "",
          valid_days: selectedLeave.valid_days || "",
          
        });
      } else {
        // Add mode - reset form
        setLeaveFormData({
            id: 0,
            status: "",
            valid_days: ""
        });
      }
    }
  }, [showLeaveModal, selectedLeave]);

  // Fetch jobs data
  const fetchLeaves = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/LVTReadInformation`);

      if (response.data && response.data.isSuccess) {
        if (Array.isArray(response.data.lvtreadInformation)) {
          const leavesData = response.data.lvtreadInformation;
          setLeaves(leavesData);
          setFilteredLeaves(leavesData);
          console.log("Leaves loaded:", leavesData);
        } else {
          throw new Error("Unexpected data format received from API");
        }
      } else {
        throw new Error(
          response.data?.message || "Failed to retrieve Leave data"
        );
      }
    } catch (err) {
      console.error("Error fetching Leave data:", err);
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
//   const fetchSections = async () => {
//     try {
//       setSectionLoading(true);
//       setError(null);

//       const response = await axios.get(`${API_URL}/JSReadInformation`);

//       if (response.data && response.data.isSuccess) {
//         if (Array.isArray(response.data.jsreadInformation)) {
//           setSections(response.data.jsreadInformation);
//           console.log("Sections loaded:", response.data.jsreadInformation);
//         } else {
//           throw new Error("Unexpected data format received from API");
//         }
//       } else {
//         throw new Error(
//           response.data?.message || "Failed to retrieve section data"
//         );
//       }
//     } catch (err) {
//       console.error("Error fetching section data:", err);
//       setError(
//         err.response
//           ? `Error: ${err.response.status} - ${
//               err.response.data?.message || JSON.stringify(err.response.data)
//             }`
//           : err.message || "An error occurred while fetching sections"
//       );
//     } finally {
//       setSectionLoading(false);
//     }
//   };

  // Create job
  const handleAddLeave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const payload = {
        id: 0, // API will assign proper ID
        
        status: leaveFormData.status,
        valid_days: parseInt(leaveFormData.valid_days)
      };
      
      console.log("Creating Leave with payload:", payload);
      
      const response = await axios.post(`${API_URL}/LVTCreateInformation`, payload);

      if (response.status === 200 && response.data.isSuccess) {
        alert("Leave type added successfully!");
        setShowLeaveModal(false);
        fetchLeaves(); // Refresh the data
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to add Leave type");
      }
    } catch (err) {
      console.error("Error adding Leave type:", err);
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
  const handleUpdateLeave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const payload = {
        id: leaveFormData.id, // API will assign proper ID
        
        status: leaveFormData.status,
        valid_days: parseInt(leaveFormData.valid_days)
      };
      
      console.log("Updating Leave type with payload:", payload);
      
      const response = await axios.put(`${API_URL}/LVTUpdateInformation`, payload);

      if (response.status === 200 && response.data.isSuccess) {
        alert("Leave type updated successfully!");
        setShowLeaveModal(false);
        fetchLeaves(); // Refresh the data
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to update Leave Type");
      }
    } catch (err) {
      console.error("Error updating Leave type:", err);
      setError(
        err.response
          ? `Error: ${err.response.status} - ${
              err.response.data?.message || JSON.stringify(err.response.data)
            }`
          : err.message || "An error occurred while updating Leave type"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete job
  const handleDeleteLeave = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Type?")) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/LVTDeleteInformation`, {
        id: id
      });

      if (response.status === 200 && response.data.isSuccess) {
        alert("Type deleted successfully!");
        fetchLeaves(); // Refresh the data
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to delete Type");
      }
    } catch (err) {
      console.error("Error deleting Type:", err);
      setError(
        err.response
          ? `Error: ${err.response.status} - ${
              err.response.data?.message || JSON.stringify(err.response.data)
            }`
          : err.message || "An error occurred while deleting Type"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle section selection for filtering
//   const handleSectionChange = (e) => {
//     const value = e.target.value;
//     console.log("Selected section:", value);
//     setSelectedSection(value);
//   };

  // Apply filters based on selected section and search term
//   const applyFilters = () => {
//     let filtered = [...leaves];

//     // Apply section filter if selected
//     if (selectedSection && selectedSection !== "") {
//       filtered = filtered.filter(
//         (job) => job.sectionsId.toString() === selectedSection
//       );
//     }

//     // Apply search term filter if present
//     if (searchTerm.trim() !== "") {
//       const lowercasedSearch = searchTerm.toLowerCase();
//       filtered = filtered.filter(
//         (job) =>
//           (job.jobName || "").toLowerCase().includes(lowercasedSearch) ||
//           (job.grade || "").toString().includes(lowercasedSearch) ||
//           (job.jobId || "").toString().includes(lowercasedSearch)
//       );
//     }

//     setFilteredJobs(filtered);
//   };

  // Handle form input changes
  const handleLeaveInputChange = (e) => {
    const { name, value } = e.target;
    setLeaveFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle job save action
  const handleSaveLeave = () => {
    if (selectedLeave) {
      // Update existing job
      handleUpdateLeave();
    } else {
      // Add new job
      handleAddLeave();
    }
  };

  // Sorting function
  const handleSort = (field) => {
    const newDirection = field === sortField && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
    
    const sorted = [...filteredLeaves].sort((a, b) => {
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
    
    setFilteredLeaves(sorted);
  };

  // Render sort icon
  const renderSortIcon = (field) => {
    if (field !== sortField) return null;
    return sortDirection === "asc" ? " ▲" : " ▼";
  };

  // Get section name by ID
//   const getSectionName = (sectionId) => {
//     const section = sections.find(s => s.sectionsId.toString() === sectionId.toString());
//     return section ? section.sectionsName : "Unknown";
//   };

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
          <Button variant="outline-danger" onClick={fetchLeaves}>
            Retry
          </Button>
        </Alert>
      )}

      <Card>
        <Card.Header className="bg-primary text-white">
          <h2 className="mb-0">Leave Information Management</h2>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Search Leaves..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            {/* <Col md={4}>
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
            </Col> */}
            <Col md={4} className="text-end">
              <Button
                variant="success"
                className="me-2"
                onClick={() => {
                  setSelectedLeave(null);
                  setShowLeaveModal(true);
                }}
              >
                Add New Type
              </Button>
              <Button
                variant="secondary"
                onClick={fetchLeaves}
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
                  <th onClick={() => handleSort("id")}>
                    ID {renderSortIcon("id")}
                  </th>
                  <th onClick={() => handleSort("status")}>
                    Name {renderSortIcon("status")}
                  </th>
                  
                  <th onClick={() => handleSort("valid_days")}>
                    Valid Days {renderSortIcon("valid_days")}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.length > 0 ? (
                  filteredLeaves.map((leaves) => (
                    <tr key={leaves.id}>
                      <td>{leaves.id}</td>
                      <td>{leaves.status}</td>
                      
                      <td>{leaves.valid_days}</td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          className="me-1"
                          onClick={() => {
                            setSelectedLeave(leaves);
                            setShowLeaveModal(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteLeave(leaves.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      {isLoading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        "No Leave data found"
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
                Total Types: {filteredLeaves.length}
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
      <Modal show={showLeaveModal} onHide={() => setShowLeaveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedLeave ? "Edit Leave Type" : "Add New Type"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Type Name</Form.Label>
              <Form.Control
                type="text"
                name="status"
                value={leaveFormData.status}
                onChange={handleLeaveInputChange}
                required
              />
            </Form.Group>
            {/* <Form.Group className="mb-3">
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
            </Form.Group> */}
            <Form.Group className="mb-3">
              <Form.Label>Valid Days</Form.Label>
              <Form.Control
                type="number"
                name="valid_days"
                value={leaveFormData.valid_days}
                onChange={handleLeaveInputChange}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLeaveModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveLeave}
            disabled={
              !leaveFormData.status ||
              
              !leaveFormData.valid_days ||
              isLoading
            }
          >
            {isLoading ? (
              <Spinner animation="border" size="sm" />
            ) : selectedLeave ? (
              "Update Type"
            ) : (
              "Add Type"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default LeaveDataTable;
