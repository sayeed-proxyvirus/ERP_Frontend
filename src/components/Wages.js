import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Card,
  Spinner,
  Alert,
} from "react-bootstrap";
import axios from "axios";

const WorkerSalaryForm = () => {
  const API_URL = "https://localhost:44353/api/CrudApplication";

  const [workerData, setWorkerData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedJob, setSelectedJob] = useState("");

  // Loading and Error States
  const [loading, setLoading] = useState({
    sections: false,
    jobs: false,
    workers: false,
    saving: false,
  });

  // Dropdown Data
  const [dropdowns, setDropdowns] = useState({
    sections: [],
    jobs: [],
  });

  const [formData, setFormData] = useState({
    salaryMonth: "",
    formattedMonth: "", // Add formatted month in YYYY-MM format
    section: "",
    sectionCode: "",
    job: "",
    language: "English",
    workDetails: {
      days: 31,
      workingDays: 31,
      weekends: 0,
      festiveH: 0,
    },
    tableData: [],
  });

  // Generate months for the current year dynamically
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
      "JANUARY": "01", "FEBRUARY": "02", "MARCH": "03", "APRIL": "04", 
      "MAY": "05", "JUNE": "06", "JULY": "07", "AUGUST": "08",
      "SEPTEMBER": "09", "OCTOBER": "10", "NOVEMBER": "11", "DECEMBER": "12"
    };
    
    if (monthMap[monthName] === undefined || isNaN(year)) return null;
    
    // Return in YYYY-MM format (no date)
    return `${year}-${monthMap[monthName]}`;
  };

  // Calculate total days based on inputs
  const calculateTotalDays = (workDay, fh, we, el, cl, sl, abs) => {
    workDay = parseInt(workDay) || 0;
    fh = parseInt(fh) || 0;
    we = parseInt(we) || 0;
    el = parseInt(el) || 0;
    cl = parseInt(cl) || 0;
    sl = parseInt(sl) || 0;
    abs = parseInt(abs) || 0;

    // Total days = working days - (fh + we + el + cl + sl + abs)
    return workDay - fh - we - el - cl - sl - abs;
  };

  // Process worker data to match the screenshot format
  const processWorkerData = (workers, selectedMonth, formattedMonth) => {
    if (!workers || !Array.isArray(workers)) {
      console.error("Invalid worker data format:", workers);
      return [];
    }

    return workers.map((worker) => {
      // Ensure all required fields have non-null values
      return {
        id: worker.id || 0,
        cardNo: worker.cardNo || "",
        name: worker.name || "",
        designation: worker.jobName || "",
        salary: worker.salary,
        workDay: worker.work_Day, // Always use the current workDay value
        othr: worker.other,
        fH: worker.festH,
        we: worker.we,
        el: worker.el,
        cl: worker.cl,
        sl: worker.sl,
        abs: worker.absent,
        tDays: worker.tDays,
        bns: worker.bonus,
        lwp: worker.lwp,
        gross: worker.gross,
        deduct: worker.deduct,
        net: worker.net,
        actRe: worker.acT_RE, // Changed to default integer value 0
        bKashAcct: worker.bankAC || "",
        code: worker.code || "",
        month: selectedMonth,
        formattedMonth: formattedMonth // Include formatted month YYYY-MM
      };
    });
  };
  
  // Fetch Sections on Component Mount
  useEffect(() => {
    fetchSections();
  }, []);

  // Filter Worker Data when search, worker data, or filters change
  useEffect(() => {
    filterWorkerData();
  }, [searchTerm, workerData, selectedJob]);

  // Calculate weekends based on month and year
  const calculateWeekends = (monthYear) => {
    if (!monthYear) return 0;

    const [monthName, yearStr] = monthYear.split(", ");
    if (!monthName || !yearStr) return 0;

    const year = parseInt(yearStr);
    const monthIndex = [
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
    ].indexOf(monthName);

    if (monthIndex === -1 || isNaN(year)) return 0;

    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    let weekendCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day);
      const dayOfWeek = date.getDay();

      // Count Fridays and Saturdays as weekends (0 is Sunday, 5 is Friday, 6 is Saturday)
      if (dayOfWeek === 5) {
        weekendCount++;
      }
    }

    return weekendCount;
  };

  // Update work details when month changes
  const updateWorkDetailsForMonth = (monthYear) => {
    if (!monthYear) return;

    const [monthName, yearStr] = monthYear.split(", ");
    if (!monthName || !yearStr) return;

    const year = parseInt(yearStr);
    const monthIndex = [
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
    ].indexOf(monthName);

    if (monthIndex === -1 || isNaN(year)) return;

    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const weekends = calculateWeekends(monthYear);
    const workingDays = daysInMonth - weekends;

    setFormData((prev) => ({
      ...prev,
      workDetails: {
        ...prev.workDetails,
        days: daysInMonth,
        workingDays: workingDays,
        weekends: weekends,
      },
    }));
  };

  const filterWorkerData = () => {
    if (workerData.length === 0) {
      setFilteredData([]);
      return;
    }

    let result = [...workerData];

    if (selectedJob && selectedJob !== "") {
      result = result.filter(
        (worker) =>
          worker.designation &&
          worker.designation.toString() === selectedJob.toString()
      );
    }

    if (searchTerm.trim() !== "") {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(
        (worker) =>
          (worker.name || "").toLowerCase().includes(lowercasedSearch) ||
          (worker.designation || "").toLowerCase().includes(lowercasedSearch) ||
          (worker.cardNo || "").toString().includes(lowercasedSearch)
      );
    }

    setFilteredData(result);

    // Update tableData in formData to reflect the filtered workers
    setFormData((prev) => ({
      ...prev,
      tableData: result,
    }));
  };

  // Fetch workers by section
  const fetchWorkersBySection = async (sectionId) => {
    try {
      if (!formData.formattedMonth) {
        setError({
          message: "Please select a month first",
          type: "warning",
        });
        return;
      }

      setIsLoading(true);
      setLoading((prev) => ({ ...prev, workers: true }));
      setError(null);

      // Get worker information with the month parameter
      const workerResponse = await axios.post(
        `${API_URL}/WSearchInformationBySection`,
        { 
          id: sectionId,
          date: formData.formattedMonth // Include formatted month in request
        }
      );
  
      if (!workerResponse || !workerResponse.data) {
        throw new Error("No data received from the server");
      }
  
      if (workerResponse.data.isSuccess === true) {
        const workerInfo = workerResponse.data.wsearchInformationBySection || [];
        const workerDataArray = Array.isArray(workerInfo) ? workerInfo : [];
  
        // Process the worker data with the correct month format
        const processedData = processWorkerData(
          workerDataArray,
          formData.salaryMonth,
          formData.formattedMonth
        );
  
        setWorkerData(processedData);
        setFilteredData(processedData);
  
        // Update the formData state with the processed worker data
        setFormData((prev) => ({
          ...prev,
          tableData: processedData,
        }));
      } else {
        throw new Error(
          workerResponse.data?.message || "Failed to retrieve Worker data"
        );
      }
    } catch (err) {
      console.error("Error fetching Worker data:", err);
      const errorMessage = err.response
        ? `Error: ${err.response.status} - ${
            err.response.data?.message || JSON.stringify(err.response.data)
          }`
        : err.message || "An unexpected error occurred while fetching data";
  
      setError({
        message: errorMessage,
        type: "danger",
      });
    } finally {
      setIsLoading(false);
      setLoading((prev) => ({ ...prev, workers: false }));
    }
  };
  const printWorkersBySection = async (sectionId) => {
  try {
    if (!formData.formattedMonth) {
      setError({
        message: "Please select a month first",
        type: "warning",
      });
      return;
    }

    setIsLoading(true);
    setLoading((prev) => ({ ...prev, workers: true }));
    setError(null);

    // For PDF download, we need to use response type 'blob'
    const response = await axios.post(
      `${API_URL}/generatesalarypdf`,
      { 
        id: sectionId,
        date: formData.formattedMonth
      },
      {
        responseType: 'blob' // Important: this tells axios to handle the response as binary data
      }
    );
    
    // Create a blob URL from the PDF data
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary link and trigger the download
    const link = document.createElement('a');
    
    // Get the filename from the Content-Disposition header if available
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'SalaryReport.pdf';
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }
    
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    // Success message
    setError({
      message: "Salary PDF downloaded successfully",
      type: "success",
    });
    
  } catch (err) {
    console.error("Error downloading PDF:", err);
    const errorMessage = err.response
      ? `Error: ${err.response.status} - ${
          err.response.data?.message || "Failed to download PDF"
        }`
      : err.message || "An unexpected error occurred while downloading PDF";

    setError({
      message: errorMessage,
      type: "danger",
    });
  } finally {
    setIsLoading(false);
    setLoading((prev) => ({ ...prev, workers: false }));
  }
};

  // Fetch Sections API Call
  const fetchSections = async () => {
    setLoading((prev) => ({ ...prev, sections: true }));
    try {
      const response = await axios.get(`${API_URL}/JSReadInformation`);

      if (
        response.data?.isSuccess &&
        Array.isArray(response.data.jsreadInformation)
      ) {
        setDropdowns((prev) => ({
          ...prev,
          sections: response.data.jsreadInformation,
        }));
      } else {
        throw new Error("Invalid sections data format");
      }
    } catch (err) {
      setError({
        message: err.response?.data?.message || "Failed to fetch sections",
        type: "danger",
      });
    } finally {
      setLoading((prev) => ({ ...prev, sections: false }));
    }
  };

  // Fetch Jobs based on Selected Section
  const fetchJobs = async (sectionId) => {
    if (!sectionId) {
      setDropdowns((prev) => ({ ...prev, jobs: [] }));
      return;
    }

    setLoading((prev) => ({ ...prev, jobs: true }));
    try {
      const response = await axios.post(
        `${API_URL}/JSearchInformationBySection`,
        { id: sectionId }
      );

      if (
        response.data?.isSuccess &&
        Array.isArray(response.data.jSearchInformationBySections)
      ) {
        setDropdowns((prev) => ({
          ...prev,
          jobs: response.data.jSearchInformationBySections,
        }));
      } else {
        throw new Error("Invalid jobs data format");
      }
    } catch (err) {
      setError({
        message: err.response?.data?.message || "Failed to fetch jobs",
        type: "danger",
      });
    } finally {
      setLoading((prev) => ({ ...prev, jobs: false }));
    }
  };

  // Event Handlers
  const handleMonthChange = (e) => {
    const selectedMonth = e.target.value;
    const formattedMonth = formatMonthToYYYYMM(selectedMonth);
    
    setFormData((prev) => ({
      ...prev,
      salaryMonth: selectedMonth,
      formattedMonth: formattedMonth, // Set the formatted month
    }));
    
    // Update work details based on selected month
    updateWorkDetailsForMonth(selectedMonth);
  };

  const handleSectionChange = (e) => {
    const selectedSectionName = e.target.value;
    const selectedSectionObj = dropdowns.sections.find(
      (section) => section.sectionsName === selectedSectionName
    );

    setFormData((prev) => ({
      ...prev,
      section: selectedSectionName,
      sectionCode: selectedSectionObj?.sectionsId || "",
      job: "", // Reset job when section changes
    }));

    setSelectedSection(selectedSectionName);
    setSelectedJob("");

    // Fetch jobs for selected section
    if (selectedSectionObj) {
      fetchJobs(selectedSectionObj.sectionsId);

      // Fetch workers for selected section
      fetchWorkersBySection(selectedSectionObj.sectionsId);
    } else {
      // Clear worker data if no section is selected
      setWorkerData([]);
      setFilteredData([]);
      setFormData((prev) => ({
        ...prev,
        tableData: [],
      }));
    }
  };

  const handleWorkingDaysChange = (e) => {
    const workingDays = parseInt(e.target.value) || 0;

    setFormData((prev) => ({
      ...prev,
      workDetails: {
        ...prev.workDetails,
        workingDays,
      },
    }));
  };

  const handleFestiveHolidaysChange = (e) => {
    const festiveH = parseInt(e.target.value) || 0;

    setFormData((prev) => ({
      ...prev,
      workDetails: {
        ...prev.workDetails,
        festiveH,
      },
    }));
  };
  
  const handleWeekDaysChange = (e) => {
    const weekends = parseInt(e.target.value) || 0;

    setFormData((prev) => ({
      ...prev,
      workDetails: {
        ...prev.workDetails,
        weekends,
      },
    }));
  };

  const handleApplyWorkDetails = () => {
    setFormData((prev) => {
      const updatedTableData = prev.tableData.map((row) => {
        const workDay = prev.workDetails.workingDays;
        const fh = prev.workDetails.festiveH;
        const we = prev.workDetails.weekends;

        // Recalculate total days
        const tDays = calculateTotalDays(
          workDay,
          fh,
          we,
          row.el,
          row.cl,
          row.sl,
          row.abs
        );

        return {
          ...row,
          workDay: workDay,
          fH: fh,
          we: we,
          tDays: tDays,
        };
      });

      return {
        ...prev,
        tableData: updatedTableData,
      };
    });
  };

  // Validate worker data before saving
  const validateWorkerDataBeforeSave = () => {
    const invalidRecords = formData.tableData.filter((worker) => {
      return (
        !worker.id ||
        worker.workDay === null ||
        worker.workDay === undefined ||
        isNaN(parseInt(worker.workDay))
      );
    });

    if (invalidRecords.length > 0) {
      const workerNames = invalidRecords
        .map((w) => w.name || "Unknown")
        .join(", ");
      setError({
        message: `Cannot save. Missing required information for: ${workerNames}`,
        type: "warning",
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    // Validate data before proceeding
    if (!validateWorkerDataBeforeSave()) {
      return;
    }
  
    setLoading((prev) => ({ ...prev, saving: true }));
    try {
      // Create an array to track the results of each update operation
      const updateResults = [];
  
      // Process each worker sequentially
      for (const worker of formData.tableData) {
        try {
          // Skip workers without a valid ID
          if (!worker.id) {
            console.warn(
              `Worker ${worker.name} doesn't have a valid ID. Skipping update.`
            );
            updateResults.push({
              worker: worker.name,
              success: false,
              message: "Missing valid worker ID",
            });
            continue;
          }
  
          // Calculate gross and net pay
          const salaryAmt = parseFloat(worker.salary) || 0;
          const bonus = parseFloat(worker.bns) || 0;
          const deduction = parseFloat(worker.deduct) || 0;
          const grossPay = salaryAmt + bonus;
          const netPay = grossPay - deduction;
  
          // Format payload according to the API requirements
          const payload = {
            id: worker.id, 
            salaryAmt: salaryAmt,
            work_Day: parseInt(worker.workDay) || 0,
            other: parseFloat(worker.othr) || 0,
            festH: parseInt(worker.fH) || 0,
            we: parseInt(worker.we) || 0,
            sl: parseInt(worker.sl) || 0,
            cl: parseInt(worker.cl) || 0,
            el: parseInt(worker.el) || 0,
            absent: parseInt(worker.abs) || 0,
            tdays: parseInt(worker.tDays) || 0,
            bonus: parseFloat(worker.bns) || 0,
            lwp: parseInt(worker.lwp) || 0,
            gross: grossPay,
            net: netPay,
            deduct: parseFloat(worker.deduct) || 0,
            // acT_RE: parseInt(worker.actRe) || 0,
            month: formData.formattedMonth, // Use YYYY-MM format
          };
  
          // Debug - Log payload before sending
          console.log(`Payload for worker ${worker.name}:`, payload);
  
          const response = await axios({
            method: "put",
            url: `${API_URL}/WagUpdateInformation`,
            data: payload,
            headers: {
              "Content-Type": "application/json",
            },
          });
  
          updateResults.push({
            worker: worker.name,
            success: response.status === 200,
            message: response.data?.message || "Updated",
          });
        } catch (workerError) {
          console.error(`Error updating worker ${worker.name}:`, workerError);
          updateResults.push({
            worker: worker.name,
            success: false,
            message: workerError.message,
          });
        }
      }
  
      // Calculate success rate and show status
      const successCount = updateResults.filter((r) => r.success).length;
      const totalWorkers = formData.tableData.length;
  
      if (successCount === totalWorkers) {
        setError({
          message: "Salary data saved successfully for all workers",
          type: "success",
        });
  
        // Refresh data after successful save
        if (selectedSection) {
          const selectedSectionObj = dropdowns.sections.find(
            (section) => section.sectionsName === selectedSection
          );
          if (selectedSectionObj) {
            fetchWorkersBySection(selectedSectionObj.sectionsId);
          }
        }
      } else if (successCount > 0) {
        setError({
          message: `Partially successful: Updated ${successCount} out of ${totalWorkers} workers`,
          type: "warning",
        });
      } else {
        setError({
          message: "Failed to save salary data for any workers. Please try again.",
          type: "danger",
        });
      }
    } catch (err) {
      console.error("Error in save operation:", err);
      setError({
        message:
          err.response?.data?.message ||
          "Failed to save salary data. Please try again.",
        type: "danger",
      });
    } finally {
      setLoading((prev) => ({ ...prev, saving: false }));
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    let grossPay = 0;
    let deductions = 0;
    let netPay = 0;
    let attendBonus = 0;
    let attendNos = 0;

    formData.tableData.forEach((row) => {
      grossPay += parseFloat(row.gross) || 0;
      deductions += parseFloat(row.deduct) || 0;
      netPay += parseFloat(row.net) || 0;

      // Count attendance for bonus calculation
      if (parseInt(row.actRe) === 0) {
        attendNos++;
      }
    });

    return { grossPay, deductions, netPay, attendBonus, attendNos };
  };

  const totals = calculateTotals();

  // Handler for cell editing with automatic calculations
  const handleCellEdit = (rowIndex, field, value) => {
    setFormData((prev) => {
      const updatedTableData = [...prev.tableData];
      
      // Update the specific field
      updatedTableData[rowIndex] = {
        ...updatedTableData[rowIndex],
        [field]: value,
      };

      // Recalculate tDays whenever any relevant field changes
      if (["workDay", "fH", "we", "el", "cl", "sl", "abs"].includes(field)) {
        const row = updatedTableData[rowIndex];
        updatedTableData[rowIndex].tDays = calculateTotalDays(
          row.workDay,
          row.fH,
          row.we,
          row.el,
          row.cl,
          row.sl,
          row.abs
        );
      }

      // Recalculate gross and net values
      const salary = parseFloat(updatedTableData[rowIndex].salary) || 0;
      const bonus = parseFloat(updatedTableData[rowIndex].bns) || 0;
      const deduction = parseFloat(updatedTableData[rowIndex].deduct) || 0;

      updatedTableData[rowIndex].gross = (salary + bonus).toFixed(3);
      updatedTableData[rowIndex].net = (salary + bonus - deduction).toFixed(3);

      return {
        ...prev,
        tableData: updatedTableData,
      };
    });
  };

  return (
    <Container fluid className="p-0">
      {error && (
        <Alert
          variant={error.type || "danger"}
          className="mb-3"
          dismissible
          onClose={() => setError(null)}
        >
          <p className="mb-0">{error.message}</p>
        </Alert>
      )}

      <Card className="border-0">
        <Card.Body className="p-3">
          {/* Header Controls */}
          <Row className="mb-3 align-items-center">
            <Col md={4} className="d-flex align-items-center">
              <div className="me-2">Salary for the Month</div>
              <Form.Select
                value={formData.salaryMonth}
                onChange={handleMonthChange} // Use the new handler
                required
              >
                <option value="">Select Month</option>
                {monthsWithYear.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={5} className="d-flex align-items-center">
              <div className="me-2">
                Section:{formData.sectionCode || "000"}
              </div>
              <Form.Select
                value={formData.section}
                onChange={handleSectionChange}
                className="me-2"
                style={{ width: "180px" }}
                disabled={!formData.formattedMonth}
              >
                <option value="">Select Section</option>
                {dropdowns.sections.map((section) => (
                  <option key={section.sectionsId} value={section.sectionsName}>
                    {section.sectionsName}
                  </option>
                ))}
              </Form.Select>

              <Button
                variant="secondary"
                size="sm"
                className="me-2"
                onClick={() => {
                  const selectedSectionObj = dropdowns.sections.find(
                    (section) => section.sectionsName === selectedSection
                  );
                  if (selectedSectionObj) {
                    fetchWorkersBySection(selectedSectionObj.sectionsId);
                  }
                }}
                disabled={!selectedSection || !formData.formattedMonth}
              >
                Go
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={loading.saving || formData.tableData.length === 0}
              >
                SAVE
              </Button>
            </Col>

            <Col
              md={3}
              className="d-flex align-items-center justify-content-end"
            >
              <div className="d-flex align-items-center me-3">
                <Form.Check
                  type="radio"
                  name="language"
                  id="bangla"
                  label="Bangla"
                  className="me-2"
                  checked={formData.language === "Bangla"}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, language: "Bangla" }))
                  }
                />
                <Form.Check
                  type="radio"
                  name="language"
                  id="english"
                  label="English"
                  checked={formData.language === "English"}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, language: "English" }))
                  }
                />
              </div>

              <Button variant="secondary" size="sm" className="me-2">
                X
              </Button>
            </Col>
          </Row>

          
          
          {/* Work Details Row */}
          <Row className="mb-3 align-items-center">
            <Col className="d-flex align-items-center">
              <div className="me-2">General WorkDays:</div>
              <Form.Control
                type="number"
                value={formData.workDetails.workingDays}
                onChange={handleWorkingDaysChange}
                style={{ width: "100px" }}
                className="me-2"
              />
              <div className="me-2">WE</div>
              <Form.Control
                type="number"
                value={formData.workDetails.weekends}
                onChange={handleWeekDaysChange}
                style={{ width: "100px" }}
                className="me-2"
              />
              <div className="me-2">FH</div>
              <Form.Control
                type="number"
                value={formData.workDetails.festiveH}
                onChange={handleFestiveHolidaysChange}
                style={{ width: "100px" }}
                className="me-2"
              />

              <Button
                variant="outline-secondary"
                size="sm"
                className="me-2"
                onClick={handleApplyWorkDetails}
              >
                ok
              </Button>

              <div className="ms-auto">
                <Button variant="secondary"
                size="sm"
                className="me-2"
                onClick={() => {
                  const selectedSectionObj = dropdowns.sections.find(
                    (section) => section.sectionsName === selectedSection
                  );
                  if (selectedSectionObj) {
                    printWorkersBySection(selectedSectionObj.sectionsId);
                  }
                }}
                disabled={!selectedSection || !formData.formattedMonth}>
                  Print
                </Button>
                <Button variant="outline-secondary" size="sm">
                  Print Pages
                </Button>
              </div>
            </Col>
          </Row>

          {/* Salary Table */}
          {isLoading || loading.workers ? (
            <div className="text-center my-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Loading worker data...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table bordered hover size="sm">
                <thead>
                  <tr className="bg-light">
                    <th>ID</th>
                    <th>CARD #</th>
                    <th>NAME</th>
                    <th>DESIGN.</th>
                    <th>SALARY</th>
                    <th>WORKDAY</th>
                    <th>Othr</th>
                    <th>FH</th>
                    <th>WE</th>
                    <th>EL</th>
                    <th>CL</th>
                    <th>SL</th>
                    <th>ABS</th>
                    <th>TDAYS</th>
                    <th>BNS</th>
                    <th>Lwp</th>
                    <th>GROSS</th>
                    <th>DEDUCT</th>
                    <th>NET</th>
                    <th>ACT/RE</th>
                    <th>bKash/Acc#</th>
                    
                  </tr>
                </thead>
                <tbody>
                  {formData.tableData.length > 0 ? (
                    formData.tableData.map((row, index) => (
                      <tr key={row.id || index}>
                        <td>{row.id}</td>
                        <td>{row.cardNo}</td>
                        <td>{row.name}</td>
                        <td>{row.designation}</td>
                        <td>{parseFloat(row.salary).toFixed(3)}</td>
                        <td>{row.workDay}</td>
                        <td>
                          <Form.Control
                            type="number"
                            value={row.othr}
                            onChange={(e) =>
                              handleCellEdit(index, "othr", e.target.value)
                            }
                            size="sm"
                            style={{ width: "40px", padding: "2px" }}
                          />
                        </td>
                        <td>{row.fH}</td>
                        <td>
                          <Form.Control
                            type="number"
                            value={row.we}
                            onChange={(e) =>
                              handleCellEdit(index, "we", e.target.value)
                            }
                            size="sm"
                            style={{ width: "40px", padding: "2px" }}
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            value={row.el}
                            onChange={(e) =>
                              handleCellEdit(index, "el", e.target.value)
                            }
                            size="sm"
                            style={{ width: "40px", padding: "2px" }}
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            value={row.cl}
                            onChange={(e) =>
                              handleCellEdit(index, "cl", e.target.value)
                            }
                            size="sm"
                            style={{ width: "40px", padding: "2px" }}
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            value={row.sl}
                            onChange={(e) =>
                              handleCellEdit(index, "sl", e.target.value)
                            }
                            size="sm"
                            style={{ width: "40px", padding: "2px" }}
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            value={row.abs}
                            onChange={(e) =>
                              handleCellEdit(index, "abs", e.target.value)
                            }
                            size="sm"
                            style={{ width: "40px", padding: "2px" }}
                          />
                        </td>
                        <td>{row.tDays}</td>
                        <td>
                          <Form.Control
                            type="number"
                            value={row.bns}
                            onChange={(e) =>
                              handleCellEdit(index, "bns", e.target.value)
                            }
                            size="sm"
                            style={{ width: "40px", padding: "2px" }}
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            value={row.lwp}
                            onChange={(e) =>
                              handleCellEdit(index, "lwp", e.target.value)
                            }
                            size="sm"
                            style={{ width: "40px", padding: "2px" }}
                          />
                        </td>
                        <td>{row.gross}</td>
                        <td>
                          <Form.Control
                            type="number"
                            value={row.deduct}
                            onChange={(e) =>
                              handleCellEdit(index, "deduct", e.target.value)
                            }
                            size="sm"
                            style={{ width: "40px", padding: "2px" }}
                          />
                        </td>
                        <td>{row.net}</td>
                        <td>
                          <Form.Control
                            type="text"
                            value={row.actRe}
                            onChange={(e) =>
                              handleCellEdit(index, "actRe", e.target.value)
                            }
                            size="sm"
                            style={{ width: "40px", padding: "2px" }}
                          />
                        </td>
                        <td>{row.bKashAcct}</td>
                        
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="22" className="text-center">
                        {formData.salaryMonth
                          ? formData.section
                            ? "No data available for the selected section."
                            : "Please select a section to load worker data."
                          : "Please select a month and section to load data."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}

          {/* Summary Section */}
          <Row className="mt-3">
            <Col>
              <div className="d-flex justify-content-center">
                <div className="me-5">
                  <strong>Gross Pay: {totals.grossPay.toFixed(2)}</strong>
                </div>
                <div className="me-5">
                  <strong>Deductions: {totals.deductions.toFixed(2)}</strong>
                </div>
                <div className="me-5">
                  <strong>Net Pay: {totals.netPay.toFixed(2)}</strong>
                </div>
                <div className="me-5">
                  <strong>Attend Bonus: {totals.attendBonus.toFixed(2)}</strong>
                </div>
                <div>
                  <strong>Attend Nos: {totals.attendNos}</strong>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default WorkerSalaryForm;
