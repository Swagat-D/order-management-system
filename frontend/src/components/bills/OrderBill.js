import React, { useRef } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Grid, Divider
} from '@mui/material';
import { 
  Print as PrintIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const OrderBill = ({ order, onClose }) => {
  const billRef = useRef();
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  // Handle printing bill
  const handlePrint = useReactToPrint({
    content: () => billRef.current,
    documentTitle: `Invoice-${order._id}`,
  });

  // Handle downloading bill as PDF
  const handleDownload = () => {
    const doc = new jsPDF();
    
    // Add company header
    doc.setFontSize(20);
    doc.text('INVOICE', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Order Management System', 105, 30, { align: 'center' });
    
    // Add bill info
    doc.setFontSize(10);
    doc.text(`Invoice #: ${order._id.substring(order._id.length - 8)}`, 14, 45);
    doc.text(`Date: ${formatDate(order.orderDate)}`, 14, 50);
    doc.text(`Status: ${order.status.toUpperCase()}`, 14, 55);
    
    // Add store details
    doc.text('Bill To:', 14, 65);
    doc.text(`${order.store.name}`, 14, 70);
    doc.text(`${order.store.address}`, 14, 75);
    doc.text(`Contact: ${order.store.contactName || 'N/A'}`, 14, 80);
    doc.text(`Phone: ${order.store.contactPhone || 'N/A'}`, 14, 85);
    
    // Add items table
    const tableColumn = ["Product", "Unit Price", "Quantity", "Total"];
    const tableRows = [];
    
    order.items.forEach(item => {
      const productData = [
        item.product.name,
        formatCurrency(item.unitPrice),
        item.quantity,
        formatCurrency(item.total)
      ];
      tableRows.push(productData);
    });
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 95,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 66, 66] }
    });
    
    // Add summary
    const finalY = doc.lastAutoTable.finalY + 10;
    
    doc.text(`Subtotal: ${formatCurrency(order.totalAmount)}`, 140, finalY);
    
    if (order.status === 'delivered') {
      doc.text(`Amount Paid: ${formatCurrency(order.amountPaid)}`, 140, finalY + 5);
      doc.text(`Amount Due: ${formatCurrency(order.amountDue)}`, 140, finalY + 10);
    }
    
    // Add notes if present
    if (order.notes) {
      doc.text('Notes:', 14, finalY + 20);
      doc.text(order.notes, 14, finalY + 25);
    }
    
    // Add footer
    doc.text('Thank you for your business!', 105, finalY + 35, { align: 'center' });
    
    // Save PDF
    doc.save(`Invoice-${order._id.substring(order._id.length - 8)}.pdf`);
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<PrintIcon />}
          onClick={handlePrint}
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
      
      <Paper sx={{ p: 3 }} ref={billRef}>
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
            <Typography variant="body1" gutterBottom>
              {order.store.name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {order.store.address}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Contact: {order.store.contactName || 'N/A'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Phone: {order.store.contactPhone || 'N/A'}
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Order Items
        </Typography>
        
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
                  <Typography variant="subtitle1" fontWeight="bold">
                    Subtotal:
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1" fontWeight="bold">
                    {formatCurrency(order.totalAmount)}
                  </Typography>
                </TableCell>
              </TableRow>
              {order.status === 'delivered' && (
                <>
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <Typography variant="subtitle1">
                        Amount Paid:
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle1">
                        {formatCurrency(order.amountPaid)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <Typography variant="subtitle1" sx={{ 
                        color: order.amountDue > 0 ? 'error.main' : 'inherit',
                        fontWeight: order.amountDue > 0 ? 'bold' : 'normal'
                      }}>
                        Amount Due:
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle1" sx={{ 
                        color: order.amountDue > 0 ? 'error.main' : 'inherit',
                        fontWeight: order.amountDue > 0 ? 'bold' : 'normal'
                      }}>
                        {formatCurrency(order.amountDue)}
                      </Typography>
                    </TableCell>
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
          <Typography variant="body1">Thank you for your business!</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default OrderBill;