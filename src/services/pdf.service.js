const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoicePDF = async (invoiceData, certificate, isTemp = false) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });

      let filePath;
      if (isTemp) {
        // Generate in temp directory
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        const fileName = `invoice_${Date.now()}_${invoiceData.invoiceNumber}.pdf`;
        filePath = path.join(tempDir, fileName);
      } else {
        // Generate in permanent uploads directory
        const invoicesDir = path.join(process.cwd(), 'uploads', 'invoices');
        if (!fs.existsSync(invoicesDir)) {
          fs.mkdirSync(invoicesDir, { recursive: true });
        }
        const fileName = `${invoiceData.invoiceNumber}.pdf`;
        filePath = path.join(invoicesDir, fileName);
      }
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

      // Dealer details with proper fallback logic
      let dealerName = '';
      let dealerAddress = '';
      // let dealerContact = '';
      let dealerEmail = '';
      let dealerCode = '';
      let dealerGST = '';
      let dealerPAN = '';

      // First try to get dealer info from invoice dealerRef (populated)
      if (invoiceData.dealerRef) {
        dealerName = invoiceData.dealerRef.name || '';
        dealerAddress = invoiceData.dealerRef.address || '';
        // dealerContact = invoiceData.dealerRef.contactPerson || '';
        dealerEmail = invoiceData.dealerRef.email || '';
        dealerCode = invoiceData.dealerRef.code || '';
        dealerGST = invoiceData.dealerRef.gstDetails || '';
        dealerPAN = invoiceData.dealerRef.pan || '';
      }
      // Fallback to certificate userRef if dealer info not available
      else if (certificate.userRef) {
        dealerName = certificate.userRef.name || '';
        dealerAddress = certificate.userRef.address || '';
        // dealerContact = certificate.userRef.contactPerson || '';
        dealerEmail = certificate.userRef.email || '';
        dealerCode = certificate.userRef.code || '';
        dealerGST = certificate.userRef.gstDetails || '';
        dealerPAN = certificate.userRef.pan || '';
      }
      // If userRef has mainDealerRef, use that instead
      else if (certificate.userRef && certificate.userRef.mainDealerRef) {
        const mainDealer = certificate.userRef.mainDealerRef;
        dealerName = mainDealer.name || '';
        dealerAddress = mainDealer.address || '';
        // dealerContact = mainDealer.contactPerson || '';
        dealerEmail = mainDealer.email || '';
        dealerCode = mainDealer.code || '';
        dealerGST = mainDealer.gstDetails || '';
        dealerPAN = mainDealer.pan || '';
      }

      // Dealer details - left column
      doc.fontSize(10).text(`Name: ${dealerName}`, 60, 430);

      doc.text(`Email: ${dealerEmail}`, 60, 450);

      // Dealer address with word wrap
      doc.text(`Address: ${dealerAddress}`, 60, 470, {
        width: 240,
        height: 30,
      });

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

// const generateCertificatePDF1 = (certificate) => {
//   return new Promise((resolve, reject) => {
//     (async () => {
//       try {
//         // Helper functions for date formatting
//         const formatDate = (date) => {
//           if (!date) return '';
//           const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//           const d = new Date(date);
//           return `${d.getDate().toString().padStart(2, '0')}/${months[d.getMonth()]}/${d.getFullYear()}`;
//         };

//         const formatPeriodOfCoverage = (createdAt) => {
//           if (!createdAt) return 'N/A';

//           const startDate = new Date(createdAt);
//           const endDate = new Date(startDate);
//           endDate.setFullYear(startDate.getFullYear() + 1);
//           endDate.setDate(endDate.getDate() - 1);
//           endDate.setHours(23, 59, 59);

//           const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

//           const startFormatted = `${startDate.getDate().toString().padStart(2, '0')}/${
//             months[startDate.getMonth()]
//           }/${startDate.getFullYear()} (${startDate.getHours().toString().padStart(2, '0')}:${startDate
//             .getMinutes()
//             .toString()
//             .padStart(2, '0')} HRS)`;
//           const endFormatted = `${endDate.getDate().toString().padStart(2, '0')}/${
//             months[endDate.getMonth()]
//           }/${endDate.getFullYear()} Midnight`;

//           return `${startFormatted} - ${endFormatted}`;
//         };

//         const doc = new PDFDocument({ margin: 50 });
//         const certificatesDir = path.join(process.cwd(), 'uploads', 'certificates');

//         if (!fs.existsSync(certificatesDir)) {
//           fs.mkdirSync(certificatesDir, { recursive: true });
//         }

//         const fileName = `${certificate.certificateNumber}.pdf`;
//         const filePath = path.join(certificatesDir, fileName);
//         const stream = fs.createWriteStream(filePath);

//         doc.pipe(stream);

//         // Helper function to add header with logo and certificate number (for pages 2+)
//         const addHeader = () => {
//           doc.fillColor('black').fontSize(10).text(`Certificate Number: ${certificate.certificateNumber}`, 50, 30);
//           doc.image(path.join(process.cwd(), 'uploads', 'logo.png'), 450, 18, { width: 50 });
//           doc.fillColor('#127cb6').fontSize(15).text('NYOM', 500, 32);
//         };

//         // Helper function to add separator line - thin black line
//         const addSeparator = (y) => {
//           doc.strokeColor('black').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
//           return y + 10;
//         };

//         // First Page - Certificate Top
//         doc.fillColor('black').fontSize(20).text('Certificate of Assistance', 50, 50);
//         doc.image(path.join(process.cwd(), 'uploads', 'logo.png'), 400, 50, { width: 50 });
//         doc.fillColor('#127cb6').fontSize(22).font('Helvetica-Bold').text('NYOM', 460, 65);

//         doc
//           .fillColor('black')
//           .fontSize(11)
//           .font('Helvetica')
//           .text('Certificate Issuing & Servicing Office: NYOM LLP', 50, 80)
//           .text('Address: B-1/605, Vasant Kunj New Delhi-110070', 50, 95)
//           .text('Ph: +91-8800773206, CIN: U65910DL2018PTC338796', 50, 110);

//         // Separator line before Certificate Number
//         let yPos = addSeparator(130);

//         // Certificate Details Section
//         doc.fillColor('black').fontSize(13).font('Helvetica-Bold').text('Certificate Number:', 50, yPos);
//         doc.font('Helvetica').text(certificate.certificateNumber, 180, yPos);
//         yPos += 20;
//         doc.font('Helvetica-Bold').text('Period of Coverage:', 50, yPos);
//         doc.font('Helvetica').text(formatPeriodOfCoverage(certificate.createdAt), 180, yPos);
//         yPos += 30;

//         // Separator line after Period of Coverage
//         yPos = addSeparator(yPos);

//         // Customer Details
//         doc.fillColor('black').fontSize(11);
//         doc.font('Helvetica-Bold').text('Name of Certificate Holder:', 50, yPos);
//         doc.font('Helvetica').text(`${certificate.firstName} ${certificate.lastName || ''}`, 200, yPos);
//         doc.font('Helvetica-Bold').text('Address:', 300, yPos);
//         doc.font('Helvetica').text(`${[certificate.houseNo, certificate.apartment].filter(Boolean).join(', ')}`, 350, yPos);
//         yPos += 20;

//         doc.font('Helvetica-Bold').text('Mobile:', 50, yPos);
//         doc.font('Helvetica').text(certificate.mobileNumber, 100, yPos);
//         doc.font('Helvetica-Bold').text('City/District:', 300, yPos);
//         doc
//           .font('Helvetica')
//           .text(
//             `${certificate.cityRef ? certificate.cityRef.name : ''} / ${
//               certificate.districtRef ? certificate.districtRef.name : ''
//             }`,
//             360,
//             yPos
//           );
//         yPos += 20;

//         doc.font('Helvetica-Bold').text('DOB:', 50, yPos);
//         doc.font('Helvetica').text(formatDate(certificate.dateOfBirth), 85, yPos);
//         doc.font('Helvetica-Bold').text('State:', 300, yPos);
//         doc.font('Helvetica').text(`${certificate.stateRef ? certificate.stateRef.name : ''}`, 340, yPos);
//         yPos += 20;

//         doc.font('Helvetica-Bold').text('Email ID:', 50, yPos);
//         doc.font('Helvetica').text(`${certificate.emailAddress || ''}`, 100, yPos);
//         doc.font('Helvetica-Bold').text('Pincode:', 300, yPos);
//         doc.font('Helvetica').text(`${certificate.pincode || ''}`, 350, yPos);
//         yPos += 30;

//         // Vehicle Details
//         doc.fillColor('black').fontSize(14).font('Helvetica-Bold').text('Vehicle Details', 50, yPos);
//         yPos += 20;

//         // Separator line after Vehicle Details
//         yPos = addSeparator(yPos);

//         const vehicleMake = certificate.vehicleBrandRef ? certificate.vehicleBrandRef.name : '';
//         const vehicleModel = certificate.vehicleModelRef ? certificate.vehicleModelRef.name : '';

//         doc.fillColor('black').fontSize(11);
//         doc.font('Helvetica-Bold').text('Vehicle Manufacturer:', 50, yPos);
//         doc.font('Helvetica').text(vehicleMake, 170, yPos);
//         doc.font('Helvetica-Bold').text('Vehicle Registration Number:', 300, yPos);
//         doc.font('Helvetica').text(`${certificate.registrationNo || ''}`, 460, yPos);
//         yPos += 20;

//         doc.font('Helvetica-Bold').text('Model/Variant:', 50, yPos);
//         doc.font('Helvetica').text(vehicleModel, 140, yPos);
//         doc.font('Helvetica-Bold').text('Manufacturing Year:', 300, yPos);
//         doc.font('Helvetica').text(`${certificate.manufacturingYear || ''}`, 410, yPos);
//         yPos += 20;

//         doc.font('Helvetica-Bold').text('Engine Number:', 50, yPos);
//         doc.font('Helvetica').text(`${certificate.engineNo || ''}`, 140, yPos);
//         doc.font('Helvetica-Bold').text('Chassis Number:', 300, yPos);
//         doc.font('Helvetica').text(certificate.chassisNumber, 400, yPos);
//         yPos += 30;

//         // Plan Details section update
//         doc.fillColor('black').fontSize(14).font('Helvetica-Bold').text('Plan Details', 50, yPos);
//         yPos += 20;

//         // Separator line after Plan Details
//         yPos = addSeparator(yPos);

//         // Get dealer details with fallback logic
//         let dealerName = '';
//         if (certificate.userRef && certificate.userRef.mainDealerRef) {
//           dealerName = certificate.userRef.mainDealerRef.name;
//         } else if (certificate.userRef) {
//           dealerName = certificate.userRef.name;
//         }

//         let dealerCode = '';
//         if (certificate.userRef && certificate.userRef.mainDealerRef) {
//           dealerCode = certificate.userRef.mainDealerRef.code;
//         } else if (certificate.userRef) {
//           dealerCode = certificate.userRef.code;
//         }

//         // Plan and Coverage in single line
//         doc.fillColor('black').fontSize(11);
//         doc.font('Helvetica-Bold').text('Plan:', 50, yPos);
//         doc.font('Helvetica').text(`${certificate.planRef ? certificate.planRef.code : ''}`, 85, yPos);
//         doc.font('Helvetica-Bold').text('Coverage:', 300, yPos);
//         doc.font('Helvetica').text(`${certificate.planRef ? certificate.planRef.name : ''}`, 380, yPos);
//         yPos += 20;

//         // Dealer Name and Code in second line
//         doc.font('Helvetica-Bold').text('Dealer Name:', 50, yPos);
//         doc.font('Helvetica').text(dealerName, 140, yPos);
//         doc.font('Helvetica-Bold').text('Dealer Code:', 300, yPos);
//         doc.font('Helvetica').text(dealerCode, 380, yPos);
//         yPos += 30;

//         // Plan Features section update
//         doc.fillColor('black').fontSize(14).font('Helvetica-Bold').text('Plan Features', 50, yPos);
//         yPos += 20;

//         // Separator line after Plan Details
//         yPos = addSeparator(yPos);

//         // Plan Features - Dynamic rendering (only feature.desc, no feature.title)
//         if (certificate.planRef && certificate.planRef.planFeatures && certificate.planRef.planFeatures.length > 0) {
//           certificate.planRef.planFeatures.forEach((feature) => {
//             // Feature description - decode HTML entities and render
//             if (feature.desc) {
//               // Check if we need a new page
//               if (yPos > 700) {
//                 doc.addPage();
//                 addHeader();
//                 yPos = 80;
//               }

//               doc.fillColor('black').fontSize(10).font('Helvetica');

//               // Multiple level HTML entity decoding
//               let decodedDesc = feature.desc
//                 .replace(/&amp;lt;/g, '<')
//                 .replace(/&amp;gt;/g, '>')
//                 .replace(/&amp;amp;/g, '&')
//                 .replace(/&amp;quot;/g, '"')
//                 .replace(/&amp;#39;/g, "'")
//                 .replace(/&lt;/g, '<')
//                 .replace(/&gt;/g, '>')
//                 .replace(/&amp;/g, '&')
//                 .replace(/&quot;/g, '"')
//                 .replace(/&#39;/g, "'");

//               // Check if it's table format or paragraph format
//               if (decodedDesc.includes('<table')) {
//                 // Extract table header first
//                 const headerMatch = decodedDesc.match(/<tr[^>]*style="[^"]*background[^"]*"[^>]*>([\s\S]*?)<\/tr>/);
//                 if (headerMatch) {
//                   const headerCells = headerMatch[1].match(/<td[^>]*>([\s\S]*?)<\/td>/g);
//                   if (headerCells && headerCells.length >= 1) {
//                     const headerText = headerCells[0].replace(/<[^>]*>/g, '').trim();
//                     if (headerText) {
//                       // Add feature title with background
//                       doc.rect(50, yPos, 500, 20).fillAndStroke('#127cb6', '#127cb6');
//                       doc
//                         .fillColor('white')
//                         .fontSize(12)
//                         .font('Helvetica-Bold')
//                         .text(headerText, 60, yPos + 5);
//                       yPos += 30;
//                     }
//                   }
//                 }

//                 // Extract data rows (skip header rows)
//                 const dataRows = decodedDesc.match(/<tr[^>]*>([\s\S]*?)<\/tr>/g);
//                 if (dataRows) {
//                   dataRows.forEach((row, index) => {
//                     // Skip header rows (those with background styling or first row)
//                     if (row.includes('background') || index === 0 || index === 1) {
//                       return;
//                     }

//                     const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g);
//                     if (cells && cells.length >= 2) {
//                       const serialNum = cells[0].replace(/<[^>]*>/g, '').trim();
//                       const description = cells[1].replace(/<[^>]*>/g, '').trim();

//                       if (description && !description.match(/^(S\.No\.|Feature Benefits)$/)) {
//                         // Check if we need a new page
//                         if (yPos > 720) {
//                           doc.addPage();
//                           addHeader();
//                           yPos = 80;
//                         }

//                         // Format as table row with serial number
//                         doc.fillColor('black').fontSize(9).font('Helvetica');
//                         doc.text(serialNum, 60, yPos, { width: 30 });
//                         doc.text(description, 90, yPos, { width: 450 });
//                         yPos += 18;
//                       }
//                     }
//                   });
//                 }
//               } else {
//                 // Handle paragraph format
//                 const paragraphs = decodedDesc.split(/<\/p>|<p>|<br\s*\/?>/);
//                 paragraphs.forEach((paragraph) => {
//                   const cleanParagraph = paragraph.replace(/<[^>]*>/g, '').trim();
//                   if (cleanParagraph) {
//                     // Check if we need a new page
//                     if (yPos > 720) {
//                       doc.addPage();
//                       addHeader();
//                       yPos = 80;
//                     }
//                     doc.fillColor('black').text(cleanParagraph, 60, yPos, { width: 480 });
//                     yPos += 22;
//                   }
//                 });
//               }
//             }
//             // Add spacing between features
//             yPos += 20;
//           });
//         }

//         // Footer on last page
//         if (yPos > 650) {
//           doc.addPage();
//           addHeader();
//           yPos = 80;
//         }

//         doc
//           .fillColor('black')
//           .fontSize(9)
//           .font('Helvetica')
//           .text('This is a computer generated certificate.', 50, yPos + 50)
//           .text('For any queries, please contact customer support.', 50, yPos + 65);

//         doc.end();

//         stream.on('finish', () => {
//           resolve(filePath);
//         });

//         stream.on('error', (error) => {
//           reject(error);
//         });
//       } catch (error) {
//         reject(error);
//       }
//     })();
//   });
// };

module.exports = { generateInvoicePDF };
