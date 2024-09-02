import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

const BASE_URL = "api/users";


// Generic function to transform data
const transformData = (data, columns) => {
  if (!Array.isArray(data)) {
    Swal.fire({
        icon: "error",
        title: "Data Not Found",
        text: "There was an error to find the data. Please try again."
    });
    return [];
  }
  if (!Array.isArray(columns)) {
    //console.error('Columns is not an array:', columns);
    Swal.fire({
        icon: "error",
        title: "Something Went Wrong",
        text: "There was an error. Please try again."
    });

    return [];
  }
  return data.map(item => {
    const transformedItem = {};
    columns.forEach(col => {
      transformedItem[col.dataField] = item[col.dataField] || ""; // Default to empty string if data is missing
    });
    return transformedItem;
  });
};

export const exportToExcel = async (dataUrl, columns, filename = 'data.xlsx') => {
  try {
    const response = await axios.get(`${BASE_URL}${dataUrl}`);
    const transformedData = transformData(response.data, columns);

    const worksheet = XLSX.utils.json_to_sheet(transformedData, { header: columns.map(col => col.dataField) });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Generate Excel file and create a Blob
    const excelBlob = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
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
        title: "Not Exporting",
        text: "Error exporting Excel. Please try again."
    });
  }
};

export const exportToPDF = async (dataUrl, columns, filename = 'data.pdf') => {
  try {
    const response = await axios.get(`${BASE_URL}${dataUrl}`);
    const transformedData = transformData(response.data, columns);
    const doc = new jsPDF();
  
    // Prepare table data and headers
    const columnHeaders = columns.map(col => col.text);
    const tableData = transformedData.map(row => columns.map(col => row[col.dataField]));

    // Add autoTable with headers and data
    doc.autoTable({
      head: [columnHeaders],
      body: tableData,
    });

    doc.save(filename);
  } catch (error) {
    
  }
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
      text: error.response ? error.response.data.message : "An error occurred while fetching data."
    });
    throw error; // Rethrow the error to handle it further up if needed
  }
};

// Generic function to post data
export const postData = async (url, data) => {
  try {
    const response = await axios.post(`${BASE_URL}${url}`, data);
    return response.data;
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error Posting Data",
      text: error.response ? error.response.data.message : "An error occurred while posting data."
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
export const fetchPerformanceData = async (page, reportType, fromDate, toDate, selectedShift, itemsPerPage) => {
  console.log(itemsPerPage);
  const startDate = fromDate || new Date().toISOString().split("T")[0];
  const endDate = toDate || new Date().toISOString().split("T")[0];

  const apiUrl = `${BASE_URL}/co-qa-data?reportType=${reportType === "SCO Performance" ? "SCO" : "CO"}&startDate=${startDate}&endDate=${endDate}&limit=${itemsPerPage}${selectedShift ? `&shift=${selectedShift}` : ""}`;
  try {
    const { data } = await axios.get(apiUrl); // Assuming axios is already configured with BASE_URL

    // Format the data
    return data.map((item, index) => ({
      ...item,
      srNo: index + 1 + (page - 1) * itemsPerPage, // SR No starts from 1 and increments
      average_call_duration_millis: formatDurationMinutesSeconds(item.average_call_duration_millis),
    }));
  } catch (error) {
    console.error("Error fetching performance data:", error);
    throw error; // Rethrow error to handle it in fetchData
  }
};
