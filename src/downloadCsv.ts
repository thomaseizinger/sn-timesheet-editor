export default function downloadCsv(csv: string, filename: string): void {
  // Create a Blob object from the CSV data
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create a new anchor element
  const link = document.createElement('a');
  link.href = url;

  // Set the download attribute to force a file download
  link.download = filename;

  // Simulate a click on the anchor element
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Release the URL resource
  URL.revokeObjectURL(url);
}
