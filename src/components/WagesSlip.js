import React, { useState, useEffect, useMemo } from "react";
import "./WagesSlip.css";
import { Spinner, Alert } from "react-bootstrap";
import axios from "axios";

const WSlipManagement = () => {
  const [workerData, setWorkerData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isMonthLoading, setMonthoading] = useState(false);
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
  const [workerAtt_Bonus, setWorkerAtt_Bonus] = useState({});
  const [jobAttBonusData, setJobAttBonusData] = useState({});
  const [workerAttBonusChecked, setWorkerAttBonusChecked] = useState({});

  // API base URL - using https as shown in your curl request
  const API_URL = "https://localhost:44353/api/CrudApplication";

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    filterWorkerData();
  }, [searchTerm, workerData, selectedSection, selectedJob]);

  useEffect(() => {
    if (workerData && workerData.length > 0) {
      const initialDeductions = {};
      const initialAtt_Bonus = {};
      const initialCheckboxState = {};

      workerData.forEach((worker) => {
        const workerId = worker.id;
        if (workerId) {
          // Only initialize if the worker ID doesn't exist in our state at all
          if (!(workerId in workerDeductions)) {
            initialDeductions[workerId] = worker.deduct || 0;
          }
          if (!(workerId in workerAtt_Bonus)) {
            initialAtt_Bonus[workerId] = worker.att_Bonus || 0;
          }
          if (!(workerId in workerAttBonusChecked)) {
            // Initialize checkbox as checked if worker already has att_Bonus value
            initialCheckboxState[workerId] = (worker.att_Bonus || 0) > 0;
          }
        }
      });

      // Only update state if we have new workers to initialize
      if (Object.keys(initialDeductions).length > 0) {
        setWorkerDeductions((prev) => ({
          ...prev,
          ...initialDeductions,
        }));
      }
      if (Object.keys(initialAtt_Bonus).length > 0) {
        setWorkerAtt_Bonus((prev) => ({
          ...prev,
          ...initialAtt_Bonus,
        }));
      }
      if (Object.keys(initialCheckboxState).length > 0) {
        setWorkerAttBonusChecked((prev) => ({
          ...prev,
          ...initialCheckboxState,
        }));
      }
    }
  }, [workerData]);

  // Enhanced handleAttBonusCheckboxChange function with detailed logging
  const handleAttBonusCheckboxChange = (workerId, workerJobName, isChecked) => {
    

    // Check if the job name exists in our data
    const jobAttBonusValue = jobAttBonusData[workerJobName];
    

    

    // Update checkbox state
    setWorkerAttBonusChecked((prev) => {
      const newState = {
        ...prev,
        [workerId]: isChecked,
      };
      console.log("Updated checkbox state:", newState);
      return newState;
    });

    if (isChecked) {
      // Get the att_bonus value for this worker's job from jobAttBonusData
      const finalValue = jobAttBonusValue || 0;
      console.log("Setting att_bonus to:", finalValue);

      setWorkerAtt_Bonus((prev) => {
        const newState = {
          ...prev,
          [workerId]: finalValue,
        };
        console.log("Updated att_bonus state:", newState);
        return newState;
      });
    } else {
      // Clear the att_bonus value when unchecked
      console.log("Clearing att_bonus (setting to 0)");
      setWorkerAtt_Bonus((prev) => {
        const newState = {
          ...prev,
          [workerId]: 0,
        };
        console.log("Cleared att_bonus state:", newState);
        return newState;
      });
    }
    console.log("=== END CHECKBOX DEBUG ===");
  };

  const fetchWorkerData = async (sectionsId) => {
    if (!sectionsId) {
      setWorkerData([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/WSlipReadBySection`, {
        id: sectionsId,
        date: formatMonthToYYYYMM(selectedMonth),
      });

      if (response.data && response.data.isSuccess) {
        const workers = response.data.wslipreadInformationBySection || [];
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
    const selectedMonthValue = e ? e.target.value : selectedMonth;
    if (e) {
      setSelectedMonth(selectedMonthValue);
    }
    const formattedMonth = formatMonthToYYYYMM(selectedMonthValue);

    console.log("Selected month:", selectedMonthValue);
    console.log("Formatted month:", formattedMonth);

    return formattedMonth;
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
      setJobAttBonusData({}); // Clear job att_bonus data
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
        if (Array.isArray(response.data.jSearchInformationBySections)) {
          const jobsData = response.data.jSearchInformationBySections;
          setJobs(jobsData);

          // Store att_bonus data for each job with enhanced logging
          const attBonusMap = {};
          
          jobsData.forEach((job, index) => {
            

            if (job.jobName) {
              // Try multiple possible field names for att_bonus
              const attBonusValue =
                job.att_Bonus ||
                job.attBonus ||
                job.att_bonus ||
                job.AttBonus ||
                0;
              attBonusMap[job.jobName] = attBonusValue;
              
            }
          });

          
          setJobAttBonusData(attBonusMap);
          

          console.log("Jobs loaded:", jobsData);
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
      setJobs([]);
      setJobAttBonusData({}); // Clear on error
    } finally {
      setJobLoading(false);
    }
  };

  // Add debugging to the table render to see current states
  // Add this just before your table JSX:
  

  const handleSectionChange = (e) => {
    const sectionValue = e.target.value;
    setSelectedSection(sectionValue);
    console.log("Selected section:", sectionValue);

    // Reset job selection when section changes
    setSelectedJob("");

    // Clear checkbox state when section changes
    setWorkerAttBonusChecked({});

    // Call fetchJobs with the selected section's ID
    if (sectionValue) {
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

  const handleDeductChange = (workerId, value) => {
    setWorkerDeductions((prev) => ({
      ...prev,
      [workerId]: value === "" ? 0 : parseFloat(value) || 0,
    }));
  };

  const handleAtt_BonusChange = (workerId, value) => {
    const numericValue = value === "" ? 0 : parseFloat(value) || 0;

    setWorkerAtt_Bonus((prev) => ({
      ...prev,
      [workerId]: numericValue,
    }));

    // Update checkbox state based on whether value is greater than 0
    setWorkerAttBonusChecked((prev) => ({
      ...prev,
      [workerId]: numericValue > 0,
    }));
  };

  const calculateWages = (worker, workerId) => {
    const currentDeduct = workerDeductions[workerId] || 0;
    const currentatt_Bonus = workerAtt_Bonus[workerId] || 0;
    const grossWages = worker.gross_Wages || 0;
    const otAmount = worker.ot_Amount || worker.oT_Amount || 0;

    // Calculate Net Wages: Gross Wages - Deductions + Attendance Bonus
    const netWages = grossWages - currentDeduct + currentatt_Bonus;

    // Calculate Net Pay: Net Wages + OT Amount
    const netPay = netWages + otAmount;

    return {
      netWages,
      netPay,
    };
  };

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

    setWorkerDeductions({});
    setWorkerAtt_Bonus({});

    await fetchWorkerData(selectedSectionObj.sectionsId);
  };

  const handleSave = async () => {
    // Validation checks
    if (!selectedSection) {
      setError("Please select a section before saving");
      return;
    }

    if (!selectedMonth) {
      setError("Please select a month before saving");
      return;
    }

    if (!filteredData || filteredData.length === 0) {
      setError("No worker data to save");
      return;
    }

    console.log("Starting save operation...");
    console.log("Selected Section:", selectedSection);
    console.log("Selected Month:", selectedMonth);
    console.log("Filtered Data Length:", filteredData.length);
    console.log("Worker Deductions:", workerDeductions);
    console.log("Worker Att_Bonus:", workerAtt_Bonus);

    setIsLoading(true);
    setError(null);

    try {
      const updateResults = [];
      const month1 = formatMonthToYYYYMM(selectedMonth);

      console.log("Formatted month for API:", month1);

      // Process each worker
      for (const worker of filteredData) {
        try {
          // Validate worker ID
          if (!worker.id) {
            console.warn(`Worker ${worker.name || "Unknown"} missing ID`);
            updateResults.push({
              worker: worker.name || "Unknown",
              success: false,
              message: "Missing worker ID",
            });
            continue;
          }

          const workerId = worker.id;
          const deduction = parseFloat(workerDeductions[workerId]) || 0;
          const att_Bonusamt = parseFloat(workerAtt_Bonus[workerId]) || 0;
          const ot_Amount = worker.ot_Amount || worker.oT_Amount || 0;
          const gross = worker.gross_Wages || 0;

          // Calculate wages using same logic as display
          const { netWages, netPay } = calculateWages(worker, workerId);

          // Create payload
          const payload = {
            id: parseInt(worker.id),
            name: worker.name || "",
            sectionName: worker.sectionName || selectedSection,
            jobName: worker.jobName || "",
            month: month1,
            cardNo: worker.cardNo || "",
            basic: parseFloat(worker.basic) || 0.0,
            hr: parseFloat(worker.hr) || 0.0,
            medical: parseFloat(worker.medical) || 0.0,
            conv: parseFloat(worker.conv) || 0.0,
            food: parseFloat(worker.food) || 0.0,
            wages: parseFloat(worker.wages) || 0.0,
            days: parseInt(worker.days) || 0,
            grade: parseInt(worker.grade) || 0,
            ot_Amount: parseFloat(ot_Amount),
            ot_Hours: parseFloat(worker.ot_Hours || worker.oT_Hours) || 0.0,
            rate: parseFloat(worker.rate) || 0.0,
            bankAcc: worker.bankAcc || worker.bankAC || "",
            att_Bonus: att_Bonusamt,
            gross_Wages: parseFloat(gross),
            net_Wages: parseFloat(netWages),
            net_Pay: parseFloat(netPay),
            deduct: deduction,
          };

          // Also add this check to see if the worker ID exists in your state

          // Make API request
          const response = await axios.put(
            `${API_URL}/WagSlipUpdateInformation`,
            payload,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          // Check the response data structure
          console.log("API Response status:", response.status);
          console.log("API Response data:", response.data);

          //console.log(`Response for worker ${worker.name}:`, response);

          // Check response
          if (response.status === 200 || response.status === 204) {
            updateResults.push({
              worker: worker.name || "Unknown",
              success: true,
              message: response.data?.message || "Updated successfully",
            });
            console.log(`Successfully updated worker: ${worker.name}`);
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

      const successCount = updateResults.filter((r) => r.success).length;
      const totalWorkers = filteredData.length;
      const failedWorkers = updateResults.filter((r) => !r.success);

      if (successCount === totalWorkers) {
        setError(null);
        alert(`Bonus data saved successfully for all ${totalWorkers} workers`);

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

  const printWSlipPDF = async () => {
    try {
      if (!selectedSection) {
        setError("Please select a section first");
        return;
      }

      if (!selectedMonth) {
        setError("Please select OT month first");
        return;
      }

      const selectedSectionObj = sections.find(
        (section) => section.sectionsName === selectedSection
      );

      if (!selectedSectionObj) {
        setError("Selected section not found");
        return;
      }

      setIsLoading(true);
      setError(null);

      const month = formatMonthToYYYYMM(selectedMonth);

      console.log("Printing PDF with:", {
        sectionId: selectedSectionObj.sectionsId,
        month: month,
      });

      const response = await axios.post(
        `${API_URL}/generatewslippdf`,
        {
          id: selectedSectionObj.sectionsId,
          date: month,
        },
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      const contentDisposition = response.headers["content-disposition"];
      let filename = `Wages_Slip_Report_${selectedSection}_${selectedMonth}.pdf`;

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

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setError(null);
      alert("Wages Slip PDF downloaded successfully");
    } catch (err) {
      console.error("Error downloading Wages Slip PDF:", err);
      const errorMessage = err.response
        ? `Error: ${err.response.status} - ${
            err.response.data?.message || "Failed to download Wages Slip PDF"
          }`
        : err.message ||
          "An unexpected error occurred while downloading Wages Slip PDF";

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
              <label>Month:</label>
              <select
                onChange={handleMonthChange}
                disabled={isMonthLoading}
                value={selectedMonth}
              >
                <option value="">
                  {isMonthLoading ? "Loading..." : "All Months"}
                </option>
                {monthsWithYear.map((month) => (
                  <option key={month} value={month}>
                    {month}
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
            onClick={printWSlipPDF}
            disabled={isLoading || !selectedSection || !selectedMonth}
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
                <th>CARDNo</th>
                <th>NAME</th>
                <th>JOB</th>
                <th>Bank/AC</th>
                <th>GRADE</th>
                <th>Salary</th>
                <th>Basic</th>
                <th>HR</th>
                <th>Medical</th>
                <th>Conv</th>
                <th>Food</th>
                <th>Days</th>
                <th>Att_Bonus</th>
                <th>DEDUCT</th>
                <th>NET_Wages</th>
                <th>OT_Amount</th>
                <th>OT_Hours</th>
                <th>Rate</th>
                <th>NET PAY</th>
                <th>Month</th>
              </tr>
            </thead>
            <tbody>
              {filteredData && filteredData.length > 0 ? (
                filteredData.map((worker, index) => {
                  const workerId = worker.id || index;
                  const currentDeduct = workerDeductions[workerId] || 0;
                  const currentatt_Bonus = workerAtt_Bonus[workerId] || 0;

                  // Calculate dynamic net wages and net pay
                  const { netWages, netPay } = calculateWages(worker, workerId);
                  const displayOtAmount =
                    worker.ot_Amount || worker.oT_Amount || 0;
                  const displayOtHours =
                    worker.ot_Hours || worker.oT_Hours || 0;

                  return (
                    <tr key={workerId}>
                      <td>{worker.cardNo || "N/A"}</td>
                      <td>{worker.name || "N/A"}</td>
                      <td>{worker.jobName || "N/A"}</td>
                      <td>{worker.bankAcc || worker.bankAC || "N/A"}</td>
                      <td>{worker.grade || 0}</td>
                      <td>{worker.wages || 0}</td>
                      <td>{worker.basic || 0}</td>
                      <td>{worker.hr || 0}</td>
                      <td>{worker.medical || 0}</td>
                      <td>{worker.conv || 0}</td>
                      <td>{worker.food || 0}</td>
                      <td>{worker.days || 0}</td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={workerAttBonusChecked[workerId] || false}
                            onChange={(e) => {
                              console.log(
                                `Checkbox clicked for worker ${workerId}, job: ${worker.jobName}`
                              );
                              handleAttBonusCheckboxChange(
                                workerId,
                                worker.jobName,
                                e.target.checked
                              );
                            }}
                            style={{
                              width: "16px",
                              height: "16px",
                              cursor: "pointer",
                            }}
                            title={`Job: ${worker.jobName}, att_bonus: ${
                              jobAttBonusData[worker.jobName] || 0
                            }`}
                          />
                          <input
                            type="number"
                            value={currentatt_Bonus || ""}
                            onChange={(e) => {
                              console.log(
                                `Manual input change for worker ${workerId}: ${e.target.value}`
                              );
                              handleAtt_BonusChange(workerId, e.target.value);
                            }}
                            disabled={!workerAttBonusChecked[workerId]}
                            placeholder="0.00"
                            style={{
                              width: "60px",
                              padding: "4px 6px",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                              textAlign: "center",
                              backgroundColor: workerAttBonusChecked[workerId]
                                ? "#fff"
                                : "#f5f5f5",
                              cursor: workerAttBonusChecked[workerId]
                                ? "text"
                                : "not-allowed",
                              opacity: workerAttBonusChecked[workerId]
                                ? 1
                                : 0.6,
                            }}
                          />
                          
                        </div>
                      </td>
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
                            borderRadius: "5px",
                            textAlign: "center",
                          }}
                        />
                      </td>
                      <td>{netWages.toLocaleString()}</td>
                      <td>{displayOtAmount.toLocaleString()}</td>
                      <td>{displayOtHours}</td>
                      <td>{worker.rate || 0}</td>
                      <td>{netPay.toLocaleString()}</td>
                      <td>{formatMonthToYYYYMM(selectedMonth) || "N/A"}</td>
                    </tr>
                  );
                })
              ) : !isLoading ? (
                <tr>
                  <td
                    colSpan="20"
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
                  const workerId = worker.id;
                  const { netPay } = calculateWages(worker, workerId);
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

export default WSlipManagement;
