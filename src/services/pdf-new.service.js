const PDFKit = require('pdfkit');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const { generateCertificateHTMLToPDF } = require('./html-pdf.service');

const generateInvoicePDF = async (invoiceData, certificate) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFKit({ margin: 50 });
      const invoicesDir = path.join(process.cwd(), 'uploads', 'invoices');

      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const fileName = `${invoiceData.invoiceNumber}.pdf`;
      const filePath = path.join(invoicesDir, fileName);
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header with proper spacing
      doc.fontSize(16).text(`Invoice # ${invoiceData.invoiceNumber}`, 50, 50);
      doc.fontSize(10).text('(Dealer Invoice No)', 250, 55);
      doc.text(new Date().toISOString().split('T')[0], 450, 50);

      // TO CUSTOMER Section
      doc.rect(50, 90, 500, 180).stroke();
      doc.fontSize(14).text('TO CUSTOMER', 60, 100);

      // Customer details - left column with word wrap
      doc.fontSize(10).text(`Name: ${invoiceData.customerName}`, 60, 125);

      // Address with word wrap
      doc.text(`Address: ${invoiceData.customerAddress}`, 60, 145, {
        width: 240,
        height: 30,
      });

      doc.text(`Contact: ${certificate.mobileNumber}`, 60, 185).text(`Email: ${certificate.emailAddress || ''}`, 60, 205);

      // Vehicle details - right column
      const vehicleMake = certificate.vehicleBrandRef ? certificate.vehicleBrandRef.name : '';
      const vehicleModel = certificate.vehicleModelRef ? certificate.vehicleModelRef.name : '';

      doc
        .text(`Chassis No: ${certificate.chassisNumber}`, 320, 125)
        .text(`Vehicle Make: ${vehicleMake}`, 320, 145)
        .text(`Vehicle Model: ${vehicleModel}`, 320, 165)
        .text(`Registration Number: ${certificate.registrationNo || ''}`, 320, 185);

      // Table Header
      doc.rect(50, 290, 500, 25).stroke();
      doc
        .fontSize(9)
        .text('Plan', 55, 298)
        .text('HSN Code', 105, 298)
        .text('Taxable Amt', 160, 298)
        .text('CGST 9%', 240, 298)
        .text('SGST 9%', 310, 298)
        .text('IGST 18%', 380, 298)
        .text('Invoice Amt', 450, 298);

      // Table Content
      doc.rect(50, 315, 500, 60).stroke();
      doc
        .fontSize(8)
        .text(invoiceData.planName, 55, 325)
        .text('998599', 105, 325)
        .text(`Rs ${invoiceData.taxableAmount}`, 160, 325)
        .text(`Rs ${invoiceData.cgstAmount}`, 240, 325)
        .text(`Rs ${invoiceData.sgstAmount}`, 310, 325)
        .text(`Rs ${invoiceData.igstAmount}`, 380, 325)
        .text(`Rs ${invoiceData.invoiceAmount}`, 450, 325);

      // FROM DEALER Section
      doc.rect(50, 395, 500, 150).stroke();
      doc.fontSize(14).text('FROM DEALER', 60, 405);

      // Dealer details with fallback logic
      let dealerName;
      let dealerAddress;
      let dealerContact;
      let dealerEmail;
      let dealerCode;
      let dealerGST;
      let dealerPAN;

      if (invoiceData.dealerData && certificate.userRef.mainDealerRef) {
        // Use main dealer details
        dealerName = invoiceData.dealerData.name || '';
        dealerAddress = invoiceData.dealerData.address || '';
        dealerContact = invoiceData.dealerData.contactPerson || '';
        dealerEmail = invoiceData.dealerData.email || '';
        dealerCode = invoiceData.dealerData.code || '';
        dealerGST = invoiceData.dealerData.gstDetails || '';
        dealerPAN = invoiceData.dealerData.pan || '';
      } else if (certificate.userRef) {
        // Use certificate user details
        dealerName = certificate.userRef.name || '';
        dealerAddress = certificate.userRef.address || '';
        dealerContact = certificate.userRef.contactPerson || '';
        dealerEmail = certificate.userRef.email || '';
        dealerCode = certificate.userRef.code || '';
        dealerGST = certificate.userRef.gstDetails || '';
        dealerPAN = certificate.userRef.pan || '';
      } else {
        dealerName = '';
        dealerAddress = '';
        dealerContact = '';
        dealerEmail = '';
        dealerCode = '';
        dealerGST = '';
        dealerPAN = '';
      }

      // Dealer details - left column
      doc.fontSize(10).text(`Name: ${dealerName}`, 60, 430);

      // Dealer address with word wrap
      doc.text(`Address: ${dealerAddress}`, 60, 450, {
        width: 240,
        height: 30,
      });

      doc.text(`Contact: ${dealerContact}`, 60, 490).text(`Email: ${dealerEmail}`, 60, 510);

      // Dealer details - right column
      doc
        .text(`Dealer Code: ${dealerCode}`, 320, 430)
        .text(`GST No: ${dealerGST}`, 320, 450)
        .text(`PAN No: ${dealerPAN}`, 320, 470);

      // Footer Notes
      doc
        .fontSize(8)
        .text('Note: 1. Terms and conditions applied as mentioned in the Roadside assistance product brochure.', 50, 565)
        .text('2. All disputes to be raised within 15 days of Invoice date.', 50, 580)
        .text('3. This is a computer generated invoice and does not require a signature.', 50, 595);

      // Signature section
      doc.fontSize(10).text('Dealer Stamp & Signature:', 50, 630);

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

const generateCertificatePDF = async (certificate) => {
  return generateCertificateHTMLToPDF(certificate);
};

const generateCombinedPDF = async (certificate, invoice) => {
  try {
    // Generate certificate PDF
    const certificatePdfPath = await generateCertificateHTMLToPDF(certificate);

    // Prepare invoice data with dealer information
    const invoiceData = {
      ...invoice.toObject(),
      dealerData: invoice.dealerRef || invoice.userRef,
      customerName: `${certificate.firstName} ${certificate.lastName || ''}`.trim(),
      customerAddress: [
        certificate.houseNo,
        certificate.apartment,
        certificate.cityRef && certificate.cityRef.name,
        certificate.districtRef && certificate.districtRef.name,
        certificate.stateRef && certificate.stateRef.name,
        certificate.pincode,
      ]
        .filter(Boolean)
        .join(', '),
      planName: certificate.planRef ? certificate.planRef.name : '',
    };

    // Generate invoice PDF
    const invoicePdfPath = await generateInvoicePDF(invoiceData, certificate);

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();

    // Load both PDFs
    const certificatePdfBytes = await fsPromises.readFile(certificatePdfPath);
    const invoicePdfBytes = await fsPromises.readFile(invoicePdfPath);

    const [certificatePdfDoc, invoicePdfDoc] = await Promise.all([
      PDFDocument.load(certificatePdfBytes),
      PDFDocument.load(invoicePdfBytes),
    ]);

    // Copy pages from certificate
    const certificatePages = await mergedPdf.copyPages(certificatePdfDoc, certificatePdfDoc.getPageIndices());
    certificatePages.forEach((page) => mergedPdf.addPage(page));

    // Copy pages from invoice
    const invoicePages = await mergedPdf.copyPages(invoicePdfDoc, invoicePdfDoc.getPageIndices());
    invoicePages.forEach((page) => mergedPdf.addPage(page));

    // Save the merged PDF
    const mergedPdfBytes = await mergedPdf.save();

    // Create directory if it doesn't exist
    const combinedDir = path.join(process.cwd(), 'uploads', 'combined');
    await fsPromises.mkdir(combinedDir, { recursive: true });

    // Save to file
    const combinedFilePath = path.join(combinedDir, `${certificate.certificateNumber}_combined.pdf`);
    await fsPromises.writeFile(combinedFilePath, mergedPdfBytes);

    // Clean up temporary files
    await Promise.all([fsPromises.unlink(certificatePdfPath), fsPromises.unlink(invoicePdfPath)]);

    return combinedFilePath;
  } catch (error) {
    throw new Error(`Error generating combined PDF: ${error.message}`);
  }
};

module.exports = { generateInvoicePDF, generateCertificatePDF, generateCombinedPDF };
