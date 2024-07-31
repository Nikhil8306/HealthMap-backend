

const filePath = "/home/nikhil/Desktop/Projects/HealthMap-Backend/src/xlsx/hospitalData.xlsx";

const data = XLSX.readFile(filePath);

const firstSheetName = data.SheetNames[0];
const firstSheet = data.Sheets[firstSheetName];

console.log(xlsxParser(firstSheet));