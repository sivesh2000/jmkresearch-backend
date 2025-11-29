/**
 * Generate ticket creation email template
 */
const getTicketCreatedTemplate = (ticket, user) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #000; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; color: #000; padding: 20px; text-align: center; border: 1px solid #dee2e6; }
        .content { background: #fff; padding: 20px; border: 1px solid #dee2e6; }
        .ticket-info { background: #f8f9fa; padding: 15px; margin: 10px 0; border: 1px solid #dee2e6; }
        .ticket-title { text-align: center; margin-bottom: 20px; }
        .details-row { display: flex; justify-content: space-between; }
        .left-column, .right-column { flex: 1; padding: 0 10px; }
        .left-column p, .right-column p { margin: 8px 0; }
        .description-section { margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6; }
        .description-text { word-wrap: break-word; white-space: pre-wrap; }
        .footer { text-align: center; padding: 20px; color: #000; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Support Ticket Created</h2>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>A new support ticket has been created and requires attention.</p>
          
          <div class="ticket-info">
            <div class="ticket-title">
              <h3>Ticket Details #${ticket.ticketNumber}</h3>
            </div>
              <div class="details-row">
              <div class="left-column">
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>User:</strong> ${user.name}</p>
              <p><strong>Category:</strong> ${ticket.issueType}</p>
              <p><strong>Status:</strong> ${ticket.status}</p>
           </div>
           <div class="right-column">
            <p>&nbsp;</p>
            <p><strong>Contact:</strong> ${ticket.contactNumber || 'N/A'}</p>
            ${ticket.subCategory ? `<p><strong>Sub Category:</strong> ${ticket.subCategory}</p>` : ''}
            <p><strong>Priority:</strong> ${ticket.priority}</p>
          </div>
         </div>
            <div class="description-section">
              <p><strong>Description:</strong> ${ticket.description}</p>
            </div>
          </div>
          
          <p>Please review and take appropriate action on this ticket.</p>
        </div>
        <div class="footer">
          <p>This is an automated message from Nyom Support System.</p>
          <p>Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate ticket response email template
 */
const getTicketResponseTemplate = (ticket, user, message, ticketUpdated) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #000; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; color: #000; padding: 20px; text-align: center; border: 1px solid #dee2e6; }
        .content { background: #fff; padding: 20px; border: 1px solid #dee2e6; }
        .response-info { background: #f8f9fa; padding: 15px; margin: 10px 0; border: 1px solid #dee2e6; }
        .ticket-title { text-align: center; margin-bottom: 20px; }
        .details-row { display: flex; justify-content: space-between; }
        .left-column, .right-column { flex: 1; padding: 0 10px; }
        .left-column p, .right-column p { margin: 8px 0; }
        .message-box { background: #f8f9fa; padding: 15px; border-left: 4px solid #000; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #000; font-size: 12px; }
        .update-notice { background: #f8f9fa; padding: 10px; border: 1px solid #dee2e6; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Response Added to Your Ticket</h2>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>A new response has been added to your support ticket.</p>
          
          <div class="response-info">
            <div class="ticket-title">
              <h3>Ticket Details #${ticket.ticketNumber}</h3>
            </div>
            <div class="details-row">
              <div class="left-column">
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Category:</strong> ${ticket.issueType}</p>
                <p><strong>Current Status:</strong> ${ticket.status}</p>
              </div>
              <div class="right-column">
              <p><strong>Response From:</strong> ${user.name}</p>
                ${ticket.subCategory ? `<p><strong>Sub Category:</strong> ${ticket.subCategory}</p>` : '<p>&nbsp;</p>'}
                <p><strong>Priority:</strong> ${ticket.priority}</p>
              </div>
            </div>
          </div>
          
          <div class="message-box">
            <h4>Response Message:</h4>
            <p>${message}</p>
            <small><em>Responded at: ${new Date().toLocaleString()}</em></small>
          </div>
          
          ${
            ticketUpdated
              ? `
            <div class="update-notice">
              <strong>Ticket Updated:</strong> The ticket status has been updated by the support team.
            </div>
          `
              : ''
          }
          
          <p>You can continue the conversation by replying to this ticket through our support system.</p>
        </div>
        <div class="footer">
          <p>This is an automated message from JMK Research Support System.</p>
          <p>Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  getTicketCreatedTemplate,
  getTicketResponseTemplate,
};
