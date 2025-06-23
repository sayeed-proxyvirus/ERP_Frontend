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
      workerData.forEach((worker) => {
        const workerId = worker.id;
        if (workerId) {
          // Only set if not already in state (preserve user changes)
          if (workerDeductions[workerId] === undefined) {
            initialDeductions[workerId] = worker.deduct || 0;
          }
          // Initialize att_bonus to 0 instead of worker.att_Bonus
          if (workerAtt_Bonus[workerId] === undefined) {
            initialAtt_Bonus[workerId] = 0;
          }
        }
      });

      // Only update if we have new deductions to add
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
    }
  }, [workerData]);

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

          // Store att_bonus data for each job
          const attBonusMap = {};
          jobsData.forEach((job) => {
            if (job.jobName) {
              // Use att_Bonus from the job data, fallback to 0 if not present
              attBonusMap[job.jobName] = job.att_Bonus || job.attBonus || 0;
            }
          });
          setJobAttBonusData(attBonusMap);

          console.log("Jobs loaded:", jobsData);
          console.log("Att_bonus data:", attBonusMap);
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

  const handleSectionChange = (e) => {
    const sectionValue = e.target.value;
    setSelectedSection(sectionValue);
    console.log("Selected section:", sectionValue);

    // Reset job selection when section changes
    setSelectedJob("");

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

  // Modified attendance bonus change handler
  const handleAtt_BonusChange = (workerId, value, worker) => {
    const numericValue = parseFloat(value) || 0;
    const currentAttBonus = workerAtt_Bonus[workerId] || 0;

    // Only use fetchJobs att_Bonus when current value is 0 and user enters non-zero
    let newValue;
    if (currentAttBonus === 0 && numericValue !== 0) {
      // Get att_bonus from job data based on worker's job
      const jobAttBonus = jobAttBonusData[worker.jobName] || 0;
      newValue = jobAttBonus;
    } else {
      // For all other cases, use the entered value
      newValue = numericValue;
    }

    setWorkerAtt_Bonus((prev) => ({
      ...prev,
      [workerId]: newValue,
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
    if (!selectedSection) {
      setError("Please select a section before saving");
      return;
    }

    if (!selectedMonth) {
      setError("Please select a month type before saving");
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
      const month1 = formatMonthToYYYYMM(selectedMonth);

      for (const worker of filteredData) {
        try {
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

          const workerId = worker.id;
          const deduction = parseFloat(workerDeductions[workerId]) || 0;
          const att_Bonusamt = parseFloat(workerAtt_Bonus[workerId]) || 0;
          const ot_Amount = worker.ot_Amount || worker.oT_Amount || 0;
          const gross = worker.gross_Wages || 0;

          // Calculate net wages and net pay using the same logic as display
          const { netWages, netPay } = calculateWages(worker, workerId);

          const payload = {
            id: parseInt(worker.id),
            name: worker.name || "",
            sectionName: worker.sectionName || selectedSection,
            jobName: worker.jobName || "",
            month: month1,
            cardNo: worker.cardNo || "",
            basic: worker.basic || 0.0,
            hr: worker.hr || 0.0,
            medical: worker.medical || 0.0,
            conv: worker.conv || 0.0,
            food: worker.food || 0.0,
            wages: worker.wages || 0.0,
            days: worker.days || 0,
            grade: worker.grade || 0,
            ot_Amount: ot_Amount,
            ot_Hours: worker.ot_Hours || worker.oT_Hours || 0.0,
            rate: worker.rate || 0.0,
            bankAC: worker.bankAcc || worker.bankAC || "",
            att_Bonus: att_Bonusamt,
            gross_Wages: gross,
            net_Wages: netWages,
            net_Pay: netPay,
            deduct: deduction,
          };

          console.log(`Payload for worker ${worker.name}:`, payload);

          const response = await axios.put(
            `${API_URL}/WagSlipUpdateInformation`,
            payload,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

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
                        <input
                          type="number"
                          value={currentatt_Bonus || ""}
                          onChange={(e) =>
                            handleAtt_BonusChange(
                              workerId,
                              e.target.value,
                              worker
                            )
                          }
                          placeholder="0.00"
                          style={{
                            width: "80px",
                            padding: "4px 6px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            textAlign: "center",
                          }}
                        />
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
                            borderRadius: "4px",
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
