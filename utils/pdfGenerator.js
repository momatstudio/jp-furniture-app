import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";

export const generatePDF = async (orders, filterType, selectedDate) => {
  try {
    const htmlContent = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Helvetica'; padding: 20px; }
            .header { 
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #2A4D69;
              padding-bottom: 20px;
            }
            .report-title {
              color: #2A4D69;
              font-size: 24px;
              margin: 0;
            }
            .filter-info {
              background-color: #f5f5f5;
              padding: 10px;
              border-radius: 5px;
              margin-bottom: 20px;
              text-align: center;
            }
            .order-card {
              background-color: white;
              border: 1px solid #e0e0e0;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 15px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .order-title {
              color: #2A4D69;
              font-size: 18px;
              margin: 0 0 10px 0;
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
            }
            .order-detail {
              margin: 5px 0;
              color: #555;
            }
            .order-price {
              color: #2A4D69;
              font-weight: bold;
              font-size: 16px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="report-title">Orders Report</h1>
              <p style="color: #666; margin: 5px 0;">Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            <img src="https://i.ibb.co/zZCzYv8/icon.png" height="60" alt="Logo" />
          </div>

          <div class="filter-info">
            <p style="margin: 5px;"><strong>Filter:</strong> ${filterType}</p>
            <p style="margin: 5px;"><strong>Date:</strong> ${
              selectedDate || "All Dates"
            }</p>
            <p style="margin: 5px;"><strong>Total Orders:</strong> ${
              orders.length
            }</p>
          </div>
          
          <div>
            ${orders
              .map((order, index) => {
                const primaryContact = order.client?.primaryPhone || "";
                const secondaryContact = order.client?.secondaryPhone;
                const contactDisplay = secondaryContact
                  ? `${primaryContact} / ${secondaryContact}`
                  : primaryContact;

                return `
                <div class="order-card">
                  <h3 class="order-title">#${index + 1} - ${
                  order.client.firstName
                } ${order.client.lastName}</h3>
                  <div class="order-detail"><strong>Item:</strong> ${
                    order.items[0].title
                  }</div>
                  <div class="order-detail order-price"><strong>Price:</strong> R${
                    order.items[0].price
                  }</div>
                  <div class="order-detail"><strong>Payment Date:</strong> ${
                    order.client.preferredPaymentDate
                  }</div>
                  <div class="order-detail"><strong>Contact:</strong> ${
                    contactDisplay || "N/A"
                  }</div>
                  <div class="order-detail"><strong>Address:</strong> ${
                    order.client.address || "N/A"
                  }</div>
                  ${
                    order.orderInfo.orderDate
                      ? `<div class="order-detail"><strong>Order Date:</strong> ${order.orderInfo.orderDate}</div>`
                      : ""
                  }
                  ${
                    order.orderInfo.orderNumber
                      ? `<div class="order-detail"><strong>Order Number:</strong> ${order.orderInfo.orderNumber}</div>`
                      : ""
                  }
                </div>
              `;
              })
              .join("")}
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} J.P Furniture. All rights reserved.</p>
            <p>Contact: 076 252 4329</p>
          </div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    await shareAsync(uri, {
      UTI: ".pdf",
      mimeType: "application/pdf",
    });

    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
};
