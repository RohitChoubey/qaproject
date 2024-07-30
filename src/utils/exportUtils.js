import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

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
    const response = await axios.get(dataUrl);
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
    const response = await axios.get(dataUrl);
    // console.log('Data fetched from API:', response.data);
    // console.log('Columns:', columns);
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
