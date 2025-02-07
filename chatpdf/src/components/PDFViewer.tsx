import React from "react";

type Props = { pdf_url: string };

// Functional component to display a PDF using an iframe
const PDFViewer = ({ pdf_url }: Props) => {
  return (
    // Embedding the PDF using Google Docs Viewer inside an iframe
    // The src attribute is constructed using the provided pdf_url
    <iframe
      src={`https://docs.google.com/gview?url=${pdf_url}&embedded=true`}
      className="w-full h-full"
    ></iframe>
  );
};

export default PDFViewer;
