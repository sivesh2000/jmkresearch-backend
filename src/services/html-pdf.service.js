const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const generateCertificateHTMLToPDF = async (certificate) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
    ],
  });
  const page = await browser.newPage();

  // Helper functions
  const formatDate = (date) => {
    if (!date) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${months[d.getMonth()]}/${d.getFullYear()}`;
  };

  const formatPeriodOfCoverage = (createdAt) => {
    if (!createdAt) return 'N/A';
    const startDate = new Date(createdAt);
    const endDate = new Date(startDate);
    endDate.setFullYear(startDate.getFullYear() + 1);
    endDate.setDate(endDate.getDate() - 1);
    endDate.setHours(23, 59, 59);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const startFormatted = `${startDate.getDate().toString().padStart(2, '0')}/${
      months[startDate.getMonth()]
    }/${startDate.getFullYear()} (${startDate.getHours().toString().padStart(2, '0')}:${startDate
      .getMinutes()
      .toString()
      .padStart(2, '0')} HRS)`;
    const endFormatted = `${endDate.getDate().toString().padStart(2, '0')}/${
      months[endDate.getMonth()]
    }/${endDate.getFullYear()} Midnight`;
    return `${startFormatted} - ${endFormatted}`;
  };

  // Get dealer details
  let dealerName = '';
  let dealerCode = '';
  if (certificate.userRef && certificate.userRef.mainDealerRef) {
    dealerName = certificate.userRef.mainDealerRef.name;
    dealerCode = certificate.userRef.mainDealerRef.code;
  } else if (certificate.userRef) {
    dealerName = certificate.userRef.name;
    dealerCode = certificate.userRef.code;
  }

  // Convert logo to base64 for embedding
  let logoBase64 = '';
  try {
    const logoPath = path.join(process.cwd(), 'uploads', 'logo.png');
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    }
  } catch (error) {
    // console.log('Logo not found, using CSS fallback');
  }

  // Generate Plan Features HTML
  let planFeaturesHTML = '';
  if (certificate.planRef && certificate.planRef.planFeatures && certificate.planRef.planFeatures.length > 0) {
    // Sort features: Terms & Conditions related features go to the end
    const sortedFeatures = certificate.planRef.planFeatures.sort((a, b) => {
      const aIsTerms = /terms\s*&?\s*conditions?|terms|conditions/i.test(a.title || '');
      const bIsTerms = /terms\s*&?\s*conditions?|terms|conditions/i.test(b.title || '');

      if (aIsTerms && !bIsTerms) return 1;
      if (!aIsTerms && bIsTerms) return -1;

      // Both are terms or both are not terms - maintain original order
      if (aIsTerms && bIsTerms) {
        // Sort terms features: "Terms & Conditions" before "Terms & Conditions 1", etc.
        const aTitle = (a.title || '').toLowerCase();
        const bTitle = (b.title || '').toLowerCase();

        if (aTitle === 'terms & conditions' && bTitle !== 'terms & conditions') return -1;
        if (bTitle === 'terms & conditions' && aTitle !== 'terms & conditions') return 1;

        return aTitle.localeCompare(bTitle);
      }

      return 0;
    });

    sortedFeatures.forEach((feature) => {
      if (feature.desc) {
        // Multiple level HTML entity decoding for complex nested encoding
        const decodedDesc = feature.desc
          .replace(/&amp;amp;lt;/g, '<')
          .replace(/&amp;amp;gt;/g, '>')
          .replace(/&amp;amp;amp;/g, '&')
          .replace(/&amp;amp;quot;/g, '"')
          .replace(/&amp;amp;#39;/g, "'")
          .replace(/&amp;lt;/g, '<')
          .replace(/&amp;gt;/g, '>')
          .replace(/&amp;amp;/g, '&')
          .replace(/&amp;quot;/g, '"')
          .replace(/&amp;#39;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");

        planFeaturesHTML += decodedDesc;
      }
    });
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; font-size: 9pt; }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #ccc;
          margin-bottom: 20px;
          font-size: 10px;
        }
        .page-header-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .page-header-logo-box {
          width: 25px;
          height: 25px;
          background: #127cb6;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 8px;
        }
        .first-page-header { 
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          margin-top: 45px;
        }
        .first-page-left {
          flex: 1;
        }
        .first-page-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logo-placeholder {
          width: 50px;
          height: 50px;
          background: #127cb6;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
        }
        .first-page-logo {
          width: 50px;
          height: 50px;
        }
        .logo { font-size: 22pt; font-weight: bold; color: #127cb6; }
        .title { font-size: 18pt; margin-bottom: 10px; }
        .separator { border-bottom: 1px solid black; margin: 10px 0; }
        .section { margin: 15px 0; }
        .section-title { font-size: 12pt; font-weight: bold; margin-bottom: 10px; }
        .field { margin: 5px 0; }
        .field-label { font-weight: bold; }
        .row { display: flex; justify-content: space-between; margin: 5px 0; }
        .col { flex: 1; }
        
        /* Terms and Conditions styling */
        .terms-content h2 {
          font-size: 12pt;
          font-weight: bold;
          margin: 15px 0 10px 0;
          padding: 8px 12px;
          background-color: #f0f0f0;
          border-left: 4px solid #127cb6;
          color: #333;
        }
        .terms-content {
          font-size: 8pt;
          line-height: 1.4;
          text-align: justify;
        }
        
        /* Enhanced table styling to match database format */
        table.MsoNormalTable { 
          width: 100% !important; 
          border-collapse: collapse !important; 
          margin: 10px 0 !important;
          border: 1pt solid rgb(209, 209, 209) !important;
        }
        
        table.MsoNormalTable td {
          border: 1pt solid rgb(209, 209, 209) !important;
          padding: 0.75pt !important;
          font-family: 'Open Sans', sans-serif !important;
          font-size: 6.5pt !important;
          line-height: 9.966667px !important;
          color: rgb(35, 31, 32) !important;
        }
        
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        td { border: 1px solid #d1d1d1; padding: 6px; font-size: 9pt; }
        .footer { margin-top: 30px; font-size: 9pt; }
      </style>
    </head>
    <body>

      
      <div class="first-page-header">
        <div class="first-page-left">
          <div class="title">Certificate of Assistance</div>
          <div style="font-size: 9pt; margin-top: 10px;">
            Certificate Issuing & Servicing Office: NYOM LLP<br>
            Ph: 9910810061 LLPIN ACR-2171, PAN AAYFN7775K
          </div>
        </div>
        <div class="first-page-right">
          ${
            logoBase64
              ? `<img src="${logoBase64}" class="first-page-logo" alt="Logo">`
              : '<div class="logo-placeholder">N</div>'
          }
          <span class="logo">NYOM</span>
        </div>
      </div>

      <div class="separator"></div>

      <div class="field">
        <span class="field-label">Certificate Number:</span> ${certificate.certificateNumber}
      </div>
      <div class="field">
        <span class="field-label">Date of Creation:</span> ${formatDate(certificate.createdAt)}
      </div>
      <div class="field">
        <span class="field-label">Period of Coverage:</span> ${formatPeriodOfCoverage(certificate.serviceStartDate)}
      </div>

      <div class="separator"></div>

      <div class="row">
        <div class="col">
          <div class="field"><span class="field-label">Name of Certificate Holder:</span> ${certificate.firstName} ${
    certificate.lastName || ''
  }</div>
          <div class="field"><span class="field-label">Mobile:</span> ${certificate.mobileNumber}</div>
          <div class="field"><span class="field-label">DOB:</span> ${formatDate(certificate.dateOfBirth)}</div>
          <div class="field"><span class="field-label">Email ID:</span> ${certificate.emailAddress || ''}</div>
           <div class="field"><span class="field-label">Nominee Name:</span> ${certificate.nomineeFullName || ''}</div>
          <div class="field"><span class="field-label">Nominee Relationship:</span> ${
            certificate.nomineeRelation || ''
          }</div>
        </div>
        <div class="col">
          <div class="field"><span class="field-label">Address:</span> ${[certificate.houseNo, certificate.apartment]
            .filter(Boolean)
            .join(', ')}</div>
          <div class="field"><span class="field-label">City/District:</span> ${
            certificate.cityRef ? certificate.cityRef.name : ''
          } / ${certificate.districtRef ? certificate.districtRef.name : ''}</div>
          <div class="field"><span class="field-label">State:</span> ${
            certificate.stateRef ? certificate.stateRef.name : ''
          }</div>
          <div class="field"><span class="field-label">Pincode:</span> ${certificate.pincode || ''}</div>
          <div class="field"><span class="field-label">Nominee Age:</span> ${certificate.nomineeAge || ''}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Vehicle Details</div>
        <div class="separator"></div>
        <div class="row">
          <div class="col">
            <div class="field"><span class="field-label">Vehicle Manufacturer:</span> ${
              certificate.vehicleBrandRef ? certificate.vehicleBrandRef.name : ''
            }</div>
            <div class="field"><span class="field-label">Model/Variant:</span> ${
              certificate.vehicleModelRef ? certificate.vehicleModelRef.name : ''
            }</div>
            <div class="field"><span class="field-label">Engine Number:</span> ${certificate.engineNo || ''}</div>
          </div>
          <div class="col">
            <div class="field"><span class="field-label">Vehicle Registration Number:</span> ${
              certificate.registrationNo || ''
            }</div>
            <div class="field"><span class="field-label">Manufacturing Year:</span> ${
              certificate.manufacturingYear || ''
            }</div>
            <div class="field"><span class="field-label">Chassis Number:</span> ${certificate.chassisNumber}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Plan Details</div>
        <div class="separator"></div>
        <div class="row">
           <div class="col">
            <div class="field"><span class="field-label">Plan:</span> ${
              certificate.planRef ? certificate.planRef.code : ''
            }</div>
            <div class="field"><span class="field-label">Dealer Name:</span> ${dealerName}</div>
          </div>
           <div class="col">
            <div class="field"><span class="field-label">Coverage:</span> ${
              certificate.planRef ? certificate.planRef.name : ''
            }</div>
            <div class="field"><span class="field-label">Dealer Code:</span> ${dealerCode}</div>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="section-title">Plan Features</div>
        <div class="separator"></div>
          ${planFeaturesHTML}
      </div>
      
      <div class="footer">
        This is a computer generated certificate.<br>
        For any queries, please contact customer support.
      </div>
    </body>
    </html>
  `;

  await page.setContent(html);

  const certificatesDir = path.join(process.cwd(), 'uploads', 'certificates');
  if (!fs.existsSync(certificatesDir)) {
    fs.mkdirSync(certificatesDir, { recursive: true });
  }

  const fileName = `${certificate.certificateNumber}.pdf`;
  const filePath = path.join(certificatesDir, fileName);

  await page.pdf({
    path: filePath,
    format: 'A4',
    printBackground: true,
    margin: { top: '80px', bottom: '60px', left: '20px', right: '20px' },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size: 10px; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; border-bottom: 1px solid #ccc; background: white; -webkit-print-color-adjust: exact;">
        <span class="pageNumber" style="font-weight: bold;"></span>
        <span style="font-weight: bold;">Certificate Number: ${certificate.certificateNumber}</span>
        <div style="display: flex; align-items: center; gap: 8px;">
          ${
            logoBase64
              ? `<img src="${logoBase64}" style="width: 25px; height: 25px; border-radius: 3px;" alt="Logo">`
              : '<div style="width: 25px; height: 25px; background: #127cb6; border-radius: 3px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 8px;">N</div>'
          }
          <span style="font-size: 12px; font-weight: bold; color: #127cb6;">NYOM</span>
        </div>
      </div>
      <style>
        .pageNumber:before { content: counter(page); }
        .pageNumber { display: none; }
        body { counter-reset: page; }
        @page:first .pageNumber ~ * { display: none !important; }
      </style>
    `,
    footerTemplate: `
      <div style="font-size: 8px; width: 100%; display: flex; justify-content: flex-end; align-items: center; padding: 10px 20px; border-top: 1px solid #ccc; background: white; -webkit-print-color-adjust: exact;">
        <div style="text-align: right; line-height: 1.2;">
          Certificate Issuing & Servicing Office: NYOM LLP<br>
          9910810061 LLPIN ACR-2171, PAN AAYFN7775K
        </div>
      </div>
    `,
  });

  await browser.close();
  return filePath;
};

module.exports = { generateCertificateHTMLToPDF };
