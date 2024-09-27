import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import logoHaryana from "../assets/img/hr_police2.png";
import logoCdac from "../assets/img/112_hr_logo.png";

const BASE_URL = "http://10.26.0.19/qaAPI/api/users";

// Generic function to transform data
const transformData = (data, columns) => {
  if (!Array.isArray(data)) {
    Swal.fire({
      icon: "error",
      title: "Data Not Found",
      text: "There was an error to find the data. Please try again.",
    });
    return [];
  }
  if (!Array.isArray(columns)) {
    //console.error('Columns is not an array:', columns);
    Swal.fire({
      icon: "error",
      title: "Something Went Wrong",
      text: "There was an error. Please try again.",
    });

    return [];
  }
  return data.map((item) => {
    const transformedItem = {};
    columns.forEach((col) => {
      transformedItem[col.dataField] = item[col.dataField] || ""; // Default to empty string if data is missing
    });
    return transformedItem;
  });
};

export const exportToExcel = async (
  dataUrl,
  columns,
  filename = "data.xlsx"
) => {
  try {
    const response = await axios.get(`${BASE_URL}${dataUrl}`);
    const data = response.data;

    // Add Sr. No to each row
    const transformedData = data.map((row, index) => ({
      srNo: index + 1, // Add Sr. No starting from 1
      ...row,
    }));

    const columnHeaders = [{ dataField: "srNo", text: "Sr. No" }, ...columns];

    const worksheet = XLSX.utils.json_to_sheet(transformedData, {
      header: columnHeaders.map((col) => col.dataField),
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Generate Excel file and create a Blob
    const excelBlob = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBlob], { type: "application/octet-stream" });

    // Create a link element
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;

    // Append the link element to the DOM
    document.body.appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    // Clean up and remove the link element
    document.body.removeChild(link);
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Export Error",
      text: "Error exporting Excel. Please try again.",
    });
  }
};

// export const exportToExcel = async (dataUrl, columns, filename = 'data.xlsx') => {
//   try {
//     const response = await axios.get(`${BASE_URL}${dataUrl}`);
//     const transformedData = transformData(response.data, columns);

//     const worksheet = XLSX.utils.json_to_sheet(transformedData, { header: columns.map(col => col.dataField) });
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

//     // Generate Excel file and create a Blob
//     const excelBlob = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
//     const blob = new Blob([excelBlob], { type: "application/octet-stream" });

//     // Create a link element
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = filename;

//     // Append the link element to the DOM
//     document.body.appendChild(link);

//     // Programmatically click the link to trigger the download
//     link.click();

//     // Clean up and remove the link element
//     document.body.removeChild(link);
//   } catch (error) {
//     Swal.fire({
//         icon: "error",
//         title: "Not Exporting",
//         text: "Error exporting Excel. Please try again."
//     });
//   }
// };

// export const exportToPDF = async (dataUrl, columns, filename = 'data.pdf') => {
//   try {
//     const response = await axios.get(`${BASE_URL}${dataUrl}`);
//     const transformedData = transformData(response.data, columns);
//     const doc = new jsPDF();

//     // Prepare table data and headers
//     const columnHeaders = columns.map(col => col.text);
//     const tableData = transformedData.map(row => columns.map(col => row[col.dataField]));

//     // Add autoTable with headers and data
//     doc.autoTable({
//       head: [columnHeaders],
//       body: tableData,
//     });

//     doc.save(filename);
//   } catch (error) {

//   }
// };
export const exportToPDF = async (dataUrl, columns, filename = "data.pdf") => {
  try {
    const response = await axios.get(`${BASE_URL}${dataUrl}`);
    const data = response.data;

    // Map data to include Sr No.
    const transformedData = data.map((row, index) => ({
      srNo: index + 1,
      ...row,
    }));

    // Column headers
    const columnHeaders = [
      ...columns.map((col) => ({ header: col.text, dataKey: col.dataField })),
    ];

    // Extract table data using only the dataFields
    const tableData = transformedData.map((row) =>
      columnHeaders.map((col) => row[col.dataKey])
    );

    const doc = new jsPDF();

    // Load logos
    const leftLogo = await loadImage(logoHaryana);
    const rightLogo = await loadImage(logoCdac);

    // Add logos to PDF
    doc.addImage(leftLogo, "PNG", 10, 10, 30, 30); // Left logo with original positioning

    // Add right logo with increased right margin (move it leftward slightly)
    doc.addImage(rightLogo, "PNG", 160, 10, 30, 30); // Adjust the X-coordinate to 160 to increase the right margin

    const topMargin = 20;

    // Add header text
    doc.setFontSize(16);
    doc.text(
      "Quality Assurance Management System",
      doc.internal.pageSize.getWidth() / 2,
      topMargin,
      { align: "center" }
    );
    doc.setFontSize(12);
    doc.text(
      "Performance Report From 2024-08-04 to 2024-09-05",
      doc.internal.pageSize.getWidth() / 2,
      topMargin + 10,
      { align: "center" }
    );
    doc.text(
      "Emergency Response Centre (ERSS)",
      doc.internal.pageSize.getWidth() / 2,
      topMargin + 20,
      { align: "center" }
    );
    doc.text(
      "Sector 3, Panchkula, Haryana 134112",
      doc.internal.pageSize.getWidth() / 2,
      topMargin + 30,
      { align: "center" }
    );

    // Draw a line below the header
    const lineY = topMargin + 40;
    doc.setLineWidth(0.5);
    doc.line(10, lineY, doc.internal.pageSize.getWidth() - 10, lineY);

    // Configure table design with reduced top margin
    doc.autoTable({
      head: [columnHeaders.map((col) => col.header)],
      body: tableData,
      startY: 70, // Reduced top margin for the table (was 90 before)
      startX: 20, // Reduced top margin for the table (was 90 before)
      styles: {
        fontSize: 10, // Adjust font size for better readability
        halign: "center", // Center-align text
        valign: "middle", // Vertically center text in cells
        cellPadding: 1, // Add padding to cells for more space
      },
      columnStyles: {
        0: { cellWidth: 35 }, // Sr. No. column with increased width
        1: { cellWidth: 70 }, // First data column width
        2: { cellWidth: 80 }, // Second data column width
        // Define more column widths as needed or increase size
      },
      headStyles: {
        fillColor: [22, 160, 133], // Change header background color
        textColor: [255, 255, 255], // White text in header
        fontStyle: "bold",
      },
      bodyStyles: {
        fillColor: [245, 245, 245], // Light grey alternating row colors
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255], // White for alternating rows
      },
      margin: { top: 100 }, // Adjust top margin to fit title and logos
      tableWidth: "auto", // Ensure table uses full width
    });

    // Save the PDF
    doc.save(filename);
  } catch (error) {
    console.error("Export Error:", error);
    Swal.fire({
      icon: "error",
      title: "Export Error",
      text: "Error exporting PDF. Please try again.",
    });
  }
};

// Helper function to load images
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
};

export const goBack = () => {
  window.history.back();
};

// Generic function to fetch data using GET
export const getData = async (url) => {
  try {
    const response = await axios.get(`${BASE_URL}${url}`);
    return response.data;
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error Fetching Data",
      text: error.response
        ? error.response.data.message
        : "An error occurred while fetching data.",
    });
    throw error; // Rethrow the error to handle it further up if needed
  }
};

// Generic function to post data
export const postData = async (url, data) => {
  console.log(url);
  console.log("<hr>");
  console.log(data);
  try {
    const response = await axios.post(`${BASE_URL}${url}`, data);
    return response.data;
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error Posting Data",
      text: error.response
        ? error.response.data.message
        : "An error occurred while posting data.",
    });
    throw error; // Rethrow the error to handle it further up if needed
  }
};

// Utility function to format duration in milliseconds to MM:SS
export const formatDurationMinutesSeconds = (millis) => {
  let seconds = Math.floor((millis / 1000) % 60);
  let minutes = Math.floor((millis / (1000 * 60)) % 60);

  // Pad with zeroes if necessary
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return `${minutes}:${seconds}`;
};

// Function to fetch performance data
// export const fetchPerformanceData = async (
//   page,
//   reportType,
//   fromDate,
//   toDate,
//   selectedShift,
//   itemsPerPage
// ) => {
//   console.log(itemsPerPage);
//   const startDate = fromDate || new Date().toISOString().split("T")[0];
//   const endDate = toDate || new Date().toISOString().split("T")[0];

//   const apiUrl = `${BASE_URL}/co-qa-data?reportType=${
//     reportType === "SCO Performance" ? "SCO" : "CO"
//   }&startDate=${startDate}&endDate=${endDate}&limit=${itemsPerPage}${
//     selectedShift ? `&shift=${selectedShift}` : ""
//   }`;
//   try {
//     const { data } = await axios.get(apiUrl); // Assuming axios is already configured with BASE_URL

//     // Format the data
//     return data.map((item, index) => ({
//       ...item,
//       srNo: index + 1 + (page - 1) * itemsPerPage, // SR No starts from 1 and increments
//       average_call_duration_millis: formatDurationMinutesSeconds(
//         item.average_call_duration_millis
//       ),
//     }));
//   } catch (error) {
//     console.error("Error fetching performance data:", error);
//     throw error; // Rethrow error to handle it in fetchData
//   }
// };

export const fetchPerformanceData = async (
  page,
  reportType,
  fromDate,
  toDate,
  selectedShift,
  itemsPerPage,
  sortColumn = "srNo", // Default sort column
  sortDirection = "asc" // Default sort direction ('asc' or 'desc')
) => {
  const startDate = fromDate || new Date().toISOString().split("T")[0];
  const endDate = toDate || new Date().toISOString().split("T")[0];

  // Ensure the API URL includes pagination, sorting, and shift filter parameters
  const apiUrl = `${BASE_URL}/co-qa-data?reportType=${
    reportType === "SCO Performance" ? "SCO" : "CO"
  }&startDate=${startDate}&endDate=${endDate}&limit=${itemsPerPage}&page=${page}${
    selectedShift ? `&shift=${selectedShift}` : ""
  }&sortColumn=${sortColumn}&sortDirection=${sortDirection}`;

  try {
    const { data } = await axios.get(apiUrl); // Assuming axios is already configured with BASE_URL

    // Format the data for the data table
    return data.map((item, index) => ({
      ...item,
      srNo: index + 1 + (page - 1) * itemsPerPage, // SR No starts from 1 and increments across pages
      average_call_duration_millis: formatDurationMinutesSeconds(
        item.average_call_duration_millis
      ), // Format call duration
    }));
  } catch (error) {
    console.error("Error fetching performance data:", error);
    throw error; // Rethrow error to handle it in fetchData
  }
};


// Fetch Call Summary
export const fetchData = async (url) => {
  try {
    const response = await fetch(`${BASE_URL}${url}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from ${url}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

// New function for fetching call data based on parameters
export const fetchCallData = async (signalType, currentPage, itemsPerPage) => {
  const url = `http://10.26.0.19/qaAPI/api/users/call-data?page=${currentPage}&limit=${itemsPerPage}&signalType=${signalType}`;
  try {
    const response = await axios.get(url);
    return response.data; // Assuming the response structure matches your needs
  } catch (error) {
    console.error("Error fetching call data:", error);
    throw error;
  }
};
