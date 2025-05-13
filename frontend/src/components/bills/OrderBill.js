import React, { useRef, useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Grid, Divider
} from '@mui/material';
import { Print as PrintIcon, Download as DownloadIcon } from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const OrderBill = ({ order }) => {
  const componentRef = useRef();
  const [isReadyToPrint, setIsReadyToPrint] = useState(false);

  // Print function
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Invoice-${order?._id?.substring(order._id.length - 8)}`,
  });

  // Make sure ref is attached before enabling print
  useEffect(() => {
    const timer = setTimeout(() => {
      if (componentRef.current) {
        setIsReadyToPrint(true);
      }
    }, 100); // wait until DOM is painted
    return () => clearTimeout(timer);
  }, []);

  const formatDate = (date) => new Date(date).toLocaleDateString();
  const formatCurrency = (amount) => `₹${amount?.toFixed(2)}`;

  // Download as PDF
  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('INVOICE', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Order Management System', 105, 30, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Invoice #: ${order._id.substring(order._id.length - 8)}`, 14, 45);
    doc.text(`Date: ${formatDate(order.orderDate)}`, 14, 50);
    doc.text(`Status: ${order.status.toUpperCase()}`, 14, 55);

    doc.text('Bill To:', 14, 65);
    doc.text(`${order.store.name}`, 14, 70);
    doc.text(`${order.store.address || 'N/A'}`, 14, 75);
    doc.text(`Contact: ${order.store.contactName || 'N/A'}`, 14, 80);
    doc.text(`Phone: ${order.store.contactPhone || 'N/A'}`, 14, 85);

    const tableColumn = ["Product", "Unit Price", "Quantity", "Total"];
    const tableRows = [];

    order.items.forEach(item => {
      tableRows.push([
        item.product.name,
        formatCurrency(item.unitPrice),
        item.quantity,
        formatCurrency(item.total)
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 95,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 66, 66] }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: ${formatCurrency(order.totalAmount)}`, 140, finalY);

    if (order.status === 'delivered') {
      doc.text(`Amount Paid: ${formatCurrency(order.amountPaid)}`, 140, finalY + 5);
      doc.text(`Amount Due: ${formatCurrency(order.amountDue)}`, 140, finalY + 10);
    }

    if (order.notes) {
      doc.text('Notes:', 14, finalY + 20);
      doc.text(order.notes, 14, finalY + 25);
    }

    doc.text('Thank you for your business!', 105, finalY + 35, { align: 'center' });
    doc.save(`Invoice-${order._id.substring(order._id.length - 8)}.pdf`);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          disabled={!isReadyToPrint}
          sx={{ mr: 1 }}
        >
          Print
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
        >
          Download PDF
        </Button>
      </Box>

      {/* Ref wrapped around a real DOM element */}
      <div ref={componentRef}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h4">INVOICE</Typography>
            <Typography variant="subtitle1">Order Management System</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Invoice #:</strong> {order._id.substring(order._id.length - 8)}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Date:</strong> {formatDate(order.orderDate)}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Status:</strong> {order.status.toUpperCase()}
              </Typography>
              {order.deliveryDate && (
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Delivery Date:</strong> {formatDate(order.deliveryDate)}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Bill To:</strong>
              </Typography>
              <Typography>{order.store.name}</Typography>
              <Typography>{order.store.address || 'N/A'}</Typography>
              <Typography>Contact: {order.store.contactName || 'N/A'}</Typography>
              <Typography>Phone: {order.store.contactPhone || 'N/A'}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>Order Items</Typography>
          <TableContainer sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.product.name}</TableCell>
                    <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} align="right">
                    <Typography fontWeight="bold">Subtotal:</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold">
                      {formatCurrency(order.totalAmount)}
                    </Typography>
                  </TableCell>
                </TableRow>
                {order.status === 'delivered' && (
                  <>
                    <TableRow>
                      <TableCell colSpan={3} align="right">Amount Paid:</TableCell>
                      <TableCell align="right">{formatCurrency(order.amountPaid)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} align="right">Amount Due:</TableCell>
                      <TableCell align="right">{formatCurrency(order.amountDue)}</TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {order.notes && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Notes:</Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography>{order.notes}</Typography>
              </Paper>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography>Thank you for your business!</Typography>
          </Box>
        </Paper>
      </div>
    </Box>
  );
};

export default OrderBill;
