import React, { useState, useEffect, useMemo } from "react";
import "./BonusManagement.css";
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

const BonusManagement = () => {
  const [workerData, setWorkerData] = useState([]);
  //const [bonusType, setBonusType] = useState("");
  const [bonus, setBonus] = useState([]);
  const [selectedBonus, setSelectedBonus] = useState("");
  const [selectedBonusMonth, setSelectedBonusMonth] = useState(""); // Add state for bonus month
  const [isBonusLoading, setBonusLoading] = useState(false);
  const [sections, setSections] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [isSectionLoading, setSectionLoading] = useState(false);
  const [isJobLoading, setJobLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [workerDeductions, setWorkerDeductions] = useState({});

  // API base URL - using https as shown in your curl request
  const API_URL = "https://localhost:44353/api/CrudApplication";

  useEffect(() => {
    fetchSections();
    fetchBonus();
  }, []);

  useEffect(() => {
    filterWorkerData();
  }, [searchTerm, workerData, selectedSection, selectedJob]);

  // NEW: Initialize worker deductions when worker data changes
  useEffect(() => {
    if (workerData && workerData.length > 0) {
      const initialDeductions = {};
      workerData.forEach((worker) => {
        const workerId = worker.id;
        if (workerId) {
          // Only set if not already in state (preserve user changes)
          if (workerDeductions[workerId] === undefined) {
            initialDeductions[workerId] = worker.deduct || 0;
          }
        }
      });
      
      // Only update if we have new deductions to add
      if (Object.keys(initialDeductions).length > 0) {
        setWorkerDeductions(prev => ({
          ...prev,
          ...initialDeductions
        }));
      }
    }
  }, [workerData]); // Remove workerDeductions from dependency array to avoid infinite loop

  const fetchWorkerData = async (sectionsId) => {
    if (!sectionsId) {
      setWorkerData([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/BSalSearchBySection`, {
        id: sectionsId,
        date: getConcatenatedBonusType(),
      });

      if (response.data && response.data.isSuccess) {
        const workers = response.data.bsalreadInformationBySection || [];
        setWorkerData(workers);
        console.log("Workers loaded:", workers);
      } else {
        throw new Error(
          response.data?.message || "Failed to retrieve worker data"
        );
      }
    } catch (err) {
      console.error("Error fetching worker data:", err);
      setError(
        err.response
          ? `Error: ${err.response.status} - ${
              err.response.data?.message || JSON.stringify(err.response.data)
            }`
          : `${
              err.message || "An error occurred while fetching workers"
            }. Please check your API server.`
      );
      setWorkerData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const monthsWithYear = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const months = [
      "JANUARY",
      "FEBRUARY",
      "MARCH",
      "APRIL",
      "MAY",
      "JUNE",
      "JULY",
      "AUGUST",
      "SEPTEMBER",
      "OCTOBER",
      "NOVEMBER",
      "DECEMBER",
    ];

    return months.map((month) => `${month}, ${currentYear}`);
  }, []);

  // Format month string to YYYY-MM
  const formatMonthToYYYYMM = (monthStr) => {
    if (!monthStr) return null;

    // Parse month string like "JANUARY, 2025"
    const parts = monthStr.split(", ");
    if (parts.length !== 2) return null;

    const monthName = parts[0].trim();
    const year = parseInt(parts[1]);

    // Map month names to their numeric values (1-based for display)
    const monthMap = {
      JANUARY: "01",
      FEBRUARY: "02",
      MARCH: "03",
      APRIL: "04",
      MAY: "05",
      JUNE: "06",
      JULY: "07",
      AUGUST: "08",
      SEPTEMBER: "09",
      OCTOBER: "10",
      NOVEMBER: "11",
      DECEMBER: "12",
    };

    if (monthMap[monthName] === undefined || isNaN(year)) return null;

    // Return in YYYY-MM format (no date)
    return `${year}-${monthMap[monthName]}`;
  };

  const handleMonthChange = (e) => {
    const selectedMonth = e.target.value;
    setSelectedBonusMonth(selectedMonth); // Store the selected month
    const formattedMonth = formatMonthToYYYYMM(selectedMonth);

    console.log("Selected month:", selectedMonth);
    console.log("Formatted month:", formattedMonth);

    // Update work details based on selected month
    //updateWorkDetailsForMonth(selectedMonth);
  };

  const getConcatenatedBonusType = () => {
    if (!selectedBonus && !selectedBonusMonth) {
      return "N/A";
    }

    const bonusTypePart = selectedBonus || "";
    const monthPart = selectedBonusMonth || "";

    if (bonusTypePart && monthPart) {
      return `${bonusTypePart} - ${monthPart}`;
    } else if (bonusTypePart) {
      return bonusTypePart;
    } else if (monthPart) {
      return monthPart;
    }

    return "N/A";
  };

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

  const fetchBonus = async () => {
    try {
      setBonusLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/BReadInformation`);

      if (response.data && response.data.isSuccess) {
        if (Array.isArray(response.data.breadInformation)) {
          setBonus(response.data.breadInformation);
          console.log("Bonus loaded:", response.data.breadInformation);
        } else {
          throw new Error("Unexpected data format received from API");
        }
      } else {
        throw new Error(
          response.data?.message || "Failed to retrieve bonus data"
        );
      }
    } catch (err) {
      console.error("Error fetching bonus data:", err);
      setError(
        err.response
          ? `Error: ${err.response.status} - ${
              err.response.data?.message || JSON.stringify(err.response.data)
            }`
          : `${
              err.message || "An error occurred while fetching bonus"
            }. Please check your API server.`
      );
      setBonus([]);
    } finally {
      setBonusLoading(false);
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
          : `${
              err.message || "An error occurred while fetching sections"
            }. Please check your API server.`
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
          : `${
              err.message || "An error occurred while fetching jobs"
            }. Please check your API server.`
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
        fetchWorkerData(section.sectionsId);
      } else {
        setJobs([]);
        setWorkerData([]);
      }
    } else {
      setJobs([]);
      setWorkerData([]);
    }
  };

  const handleJobChange = (e) => {
    const jobName = e.target.value;
    setSelectedJob(jobName);
    console.log("Selected job:", jobName);
  };

  const handleBonusChange = (e) => {
    const btype = e.target.value;
    setSelectedBonus(btype);
    console.log("Selected Bonus:", btype);
  };

  // Updated function to handle deduction changes
  const handleDeductChange = (workerId, value) => {
    setWorkerDeductions(prev => ({
      ...prev,
      [workerId]: value === "" ? 0 : parseFloat(value) || 0
    }));
  };

  // Add Go button handler to fetch filtered worker data
  const handleGoClick = async () => {
    if (!selectedSection) {
      setError("Please select a section first");
      return;
    }

    const selectedSectionObj = sections.find(
      (section) => section.sectionsName === selectedSection
    );

    if (!selectedSectionObj) {
      setError("Selected section not found");
      return;
    }

    // Clear previous deductions when fetching new data
    setWorkerDeductions({});

    // Fetch worker data for the selected section
    await fetchWorkerData(selectedSectionObj.sectionsId);
  };

  const handleSave = async () => {
    // Validate required fields
    if (!selectedSection) {
      setError("Please select a section before saving");
      return;
    }

    if (!selectedBonus) {
      setError("Please select a bonus type before saving");
      return;
    }

    if (!selectedBonusMonth) {
      setError("Please select a bonus month before saving");
      return;
    }

    if (!filteredData || filteredData.length === 0) {
      setError("No worker data to save");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updateResults = [];
      const concatenatedBonusType = getConcatenatedBonusType();

      // Process each worker sequentially
      for (const worker of filteredData) {
        try {
          // Skip workers without a valid ID
          if (!worker.id) {
            console.warn(
              `Worker ${
                worker.name || "Unknown"
              } doesn't have a valid ID. Skipping update.`
            );
            updateResults.push({
              worker: worker.name || "Unknown",
              success: false,
              message: "Missing valid worker ID",
            });
            continue;
          }

          // Get worker-specific deduction from the table input
          const workerId = worker.id;
          const deduction = parseFloat(workerDeductions[workerId]) || 0;

          // Calculate financial data using the same logic as the table display
          const bonusAmount1 = parseFloat(worker.bonus) || 0;
          const gross = worker.gross || bonusAmount1;
          const bonusAmount = gross; // Use existing gross or fallback to bonus
          const net = gross - deduction; // Net = gross - deduction (same as table calculation)

          // Format payload with the calculated table values
          const payload = {
            id: parseInt(worker.id),
            name: worker.name || "",
            sectionName: worker.sectionName || selectedSection,
            jobName: worker.jobName || "",
            bType: concatenatedBonusType,
            cardNo: worker.cardNo || "",
            bankAC: worker.bankAcc || worker.bankAC || "",
            bonus: bonusAmount, // Original bonus amount
            gross: gross, // Calculated gross (from table)
            net: net, // Calculated net (from table: gross - deduction)
            deduct: deduction, // User input deduction (from table)
          };

          console.log(`Payload for worker ${worker.name}:`, payload);
          console.log(
            `Table calculations - Gross: ${gross}, Deduction: ${deduction}, Net: ${net}`
          );

          const response = await axios.put(
            `${API_URL}/BSalUpdateInformation`,
            payload,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          // Check if the response is successful
          if (response.status === 200 || response.status === 204) {
            updateResults.push({
              worker: worker.name || "Unknown",
              success: true,
              message: response.data?.message || "Updated successfully",
            });
          } else {
            throw new Error(`Unexpected response status: ${response.status}`);
          }
        } catch (workerError) {
          console.error(`Error updating worker ${worker.name}:`, workerError);

          const errorMessage =
            workerError.response?.data?.message ||
            workerError.response?.data ||
            workerError.message ||
            "Unknown error occurred";

          updateResults.push({
            worker: worker.name || "Unknown",
            success: false,
            message: errorMessage,
          });
        }
      }

      // Calculate success rate and show status
      const successCount = updateResults.filter((r) => r.success).length;
      const totalWorkers = filteredData.length;
      const failedWorkers = updateResults.filter((r) => !r.success);

      if (successCount === totalWorkers) {
        setError(null);
        alert(`Bonus data saved successfully for all ${totalWorkers} workers`);

        // Refresh data after successful save
        const selectedSectionObj = sections.find(
          (section) => section.sectionsName === selectedSection
        );
        if (selectedSectionObj) {
          await fetchWorkerData(selectedSectionObj.sectionsId);
        }
      } else if (successCount > 0) {
        const failedNames = failedWorkers.map((w) => w.worker).join(", ");
        setError(
          `Partially successful: Updated ${successCount} out of ${totalWorkers} workers. Failed: ${failedNames}`
        );
        console.warn("Failed worker updates:", failedWorkers);
      } else {
        const firstError = failedWorkers[0]?.message || "Unknown error";
        setError(
          `Failed to save bonus data for any workers. Error: ${firstError}`
        );
        console.error("All worker update failures:", failedWorkers);
      }
    } catch (err) {
      console.error("Error in save operation:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Failed to save bonus data. Please try again.";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const printBonusPDF = async () => {
    try {
      // Validate required fields
      if (!selectedSection) {
        setError("Please select a section first");
        return;
      }

      if (!selectedBonus || !selectedBonusMonth) {
        setError("Please select both bonus type and bonus month first");
        return;
      }

      // Find the selected section object to get the ID
      const selectedSectionObj = sections.find(
        (section) => section.sectionsName === selectedSection
      );

      if (!selectedSectionObj) {
        setError("Selected section not found");
        return;
      }

      setIsLoading(true);
      setError(null);

      // Get the concatenated bonus type (same as what's shown in the table)
      const bType = getConcatenatedBonusType();

      console.log("Printing PDF with:", {
        sectionId: selectedSectionObj.sectionsId,
        bType: bType,
      });

      // Call the API with blob response type for PDF download
      const response = await axios.post(
        `${API_URL}/generatebonuspdf`,
        {
          id: selectedSectionObj.sectionsId, // Section ID
          date: bType, // Bonus type (concatenated with month)
        },
        {
          responseType: "blob", // Important: handle response as binary data
        }
      );

      // Create a blob URL from the PDF data
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link and trigger the download
      const link = document.createElement("a");

      // Get the filename from the Content-Disposition header if available
      const contentDisposition = response.headers["content-disposition"];
      let filename = `BonusReport_${selectedSection}_${selectedBonusMonth}.pdf`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }

      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Success message
      setError(null);
      alert("Bonus PDF downloaded successfully");
    } catch (err) {
      console.error("Error downloading Bonus PDF:", err);
      const errorMessage = err.response
        ? `Error: ${err.response.status} - ${
            err.response.data?.message || "Failed to download Bonus PDF"
          }`
        : err.message ||
          "An unexpected error occurred while downloading Bonus PDF";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bonus-wrapper">
      <div className="bonus-container">
        {/* Error Display */}
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {/* Controls */}
        <div className="form-card">
          <div className="form-row">
            <div className="form-group">
              <label>Bonus Month:</label>
              <select
                onChange={handleMonthChange}
                //disabled={isBonusLoading}
                value={selectedBonusMonth}
              >
                <option value="">
                  {isBonusLoading ? "Loading..." : "All Months"}
                </option>
                {monthsWithYear.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Bonus Type:</label>
              <select
                onChange={handleBonusChange}
                disabled={isBonusLoading}
                value={selectedBonus}
              >
                <option value="">
                  {isBonusLoading ? "Loading..." : "All Bonus"}
                </option>
                {bonus.map((bonusItem, index) => (
                  <option
                    key={bonusItem.bcode || index}
                    value={bonusItem.btype}
                  >
                    {bonusItem.btype}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Section:</label>
              <select
                onChange={handleSectionChange}
                disabled={isSectionLoading}
                value={selectedSection}
              >
                <option value="">
                  {isSectionLoading ? "Loading..." : "All Sections"}
                </option>
                {sections.map((section) => (
                  <option key={section.sectionsId} value={section.sectionsName}>
                    {section.sectionsName}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Job:</label>
              <select
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
              </select>
            </div>
            <div className="form-actions">
              <button onClick={handleGoClick} disabled={isLoading}>
                {isLoading ? "Loading..." : "Go"}
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading || !filteredData.length}
              >
                {isLoading ? "Saving..." : "SAVE"}
              </button>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="button-group">
          <button
            className="btn orange"
            onClick={printBonusPDF}
            disabled={
              isLoading ||
              !selectedSection ||
              !selectedBonus ||
              !selectedBonusMonth
            }
          >
            {isLoading ? "Generating..." : "PrintBkash"}
          </button>
          <button className="btn purple">PrintBank</button>
          <button className="btn teal">Print Pages</button>
          <button className="btn red">✕</button>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="text-center">
            <Spinner animation="border" />
            <p>Loading worker data...</p>
          </div>
        )}

        {/* Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>CARD #</th>
                <th>NAME</th>
                <th>JOB</th>
                <th>Bank/AC</th>
                <th>SALARY</th>
                <th>Bonus</th>
                <th>DEDUCT</th>
                <th>BONUS TYPE</th>
                <th>NET PAY</th>
              </tr>
            </thead>
            <tbody>
              {filteredData && filteredData.length > 0 ? (
                filteredData.map((worker, index) => {
                  // Calculate values using existing worker data first, then fallbacks
                  const salary = worker.salary || 0;
                  const bonus = worker.bonus || 0;
                  const gross = worker.gross || bonus;
                  const workerId = worker.id || index;

                  // FIXED: Always use the state value, which now includes initialized values
                  const currentDeduct = workerDeductions[workerId] || 0;

                  // FIXED: Calculate net pay consistently
                  const netPay = gross - currentDeduct;

                  return (
                    <tr key={workerId}>
                      <td>{worker.cardNo || "N/A"}</td>
                      <td>{worker.name || "N/A"}</td>
                      <td>{worker.jobName || "N/A"}</td>
                      <td>{worker.bankAcc || "N/A"}</td>
                      <td>{worker.salary || 0}</td>
                      <td>{gross ? gross.toLocaleString() : "0"}</td>
                      <td>
                        <input
                          type="number"
                          value={currentDeduct || ""}
                          onChange={(e) =>
                            handleDeductChange(workerId, e.target.value)
                          }
                          placeholder="0"
                          style={{
                            width: "80px",
                            padding: "4px 6px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            textAlign: "center",
                          }}
                        />
                      </td>
                      <td>{getConcatenatedBonusType()}</td>
                      <td>{netPay.toLocaleString()}</td>
                    </tr>
                  );
                })
              ) : !isLoading ? (
                <tr>
                  <td
                    colSpan="9"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    {selectedSection
                      ? "No workers found for selected section"
                      : "Please select a section to view workers"}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        {filteredData && filteredData.length > 0 && (
          <div className="summary">
            <div className="summary-box">
              Total Workers: {filteredData.length} | Net pay:{" "}
              {filteredData
                .reduce((total, worker) => {
                  const bonus = worker.bonus || 0;
                  const gross = worker.gross || bonus;
                  const workerId = worker.id || filteredData.indexOf(worker);
                  const deduct = workerDeductions[workerId] || 0;
                  const netPay = gross - deduct;
                  return total + netPay;
                }, 0)
                .toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BonusManagement;