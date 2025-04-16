import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Paper, Typography, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Divider, Button, Tooltip, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import { 
  TrendingUp as SalesIcon,
  CreditCard as CreditIcon,
  LocalAtm as CashIcon,
  ListAlt as OrderIcon,
  Pending as PendingIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { getDashboardSummary, getSalesChartData, getProductChartData } from '../../utils/api';
import { useLocation, useNavigate } from 'react-router-dom';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend);

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [salesChartData, setSalesChartData] = useState(null);
  const [productChartData, setProductChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const [openCreditDialog, setOpenCreditDialog] = useState(false);
  const [openCashDialog, setOpenCashDialog] = useState(false);
  const [cashTransactions, setCashTransactions] = useState([]);
  const [ loadingTransactions, setLoadingTransactions] = useState(false);

  const [openSalesDialog, setOpenSalesDialog] = useState(false);
const [salesData, setSalesData] = useState([]);
const [loadingSales, setLoadingSales] = useState(false);

  // Track last refresh time
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // This useEffect will run when the component mounts and when returning from other pages
  useEffect(() => {
    fetchDashboardData();
  }, [location.key, lastRefreshed]); // location.key changes whenever navigation occurs

  const handleOrdersClick = () => {
    navigate('/orders');
  };



  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch summary data
      const summaryData = await getDashboardSummary();
      setSummary(summaryData);
      
      // Fetch chart data
      const salesData = await getSalesChartData();
      setSalesChartData(salesData);
      
      const productData = await getProductChartData();
      setProductChartData(productData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesData = async () => {
    setLoadingSales(true);
    try {
      // Use your existing sales chart data if available or fetch from API
      const data = await getSalesChartData();
      setSalesData(data);
    } catch (err) {
      console.error('Error fetching sales data:', err);
    } finally {
      setLoadingSales(false);
    }
  };

  // Manual refresh function
  const handleRefresh = () => {
    setLastRefreshed(new Date());
  };

  const fetchCashTransactions = async () => {
    setLoadingTransactions(true);
    try {
      // Adjust the API endpoint to match your backend
      const response = await axios.get('/api/payments?type=cash,upi,bank_transfer', {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setCashTransactions(response.data.payments || []);
    } catch (err) {
      console.error('Error fetching cash transactions:', err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleCashClick = () => {
    fetchCashTransactions();
    setOpenCashDialog(true);
  }

  const handleSalesClick = () => {
    fetchSalesData();
    setOpenSalesDialog(true);
  };

  // Prepare sales chart data
  const prepareSalesChartData = () => {
    if (!salesChartData) return null;
    
    return {
      labels: salesChartData.map(item => item._id),
      datasets: [
        {
          label: 'Total Sales',
          data: salesChartData.map(item => item.sales),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        {
          label: 'Cash Received',
          data: salesChartData.map(item => item.cash),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
        {
          label: 'Credit',
          data: salesChartData.map(item => item.credit),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        }
      ]
    };
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          Dashboard
        </Typography>
        <Tooltip title="Refresh Data">
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={handleRefresh}
            size="small"
          >
            Refresh
          </Button>
        </Tooltip>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {summary && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140, cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={handleSalesClick}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SalesIcon color="primary" sx={{ mr: 1 }} />
                  <Typography component="h2" variant="subtitle1" color="primary">
                    Total Sales
                  </Typography>
                </Box>
                <Typography component="p" variant="h4">
                  {formatCurrency(summary.totalSales)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Month
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140, cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => handleCashClick()}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CashIcon sx={{ color: 'success.main', mr: 1 }} />
                  <Typography component="h2" variant="subtitle1" color="success.main">
                    Cash Received
                  </Typography>
                </Box>
                <Typography component="p" variant="h4">
                  {formatCurrency(summary.totalCash)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Month
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140, cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => setOpenCreditDialog(true)}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CreditIcon sx={{ color: 'error.main', mr: 1 }} />
                  <Typography component="h2" variant="subtitle1" color="error.main">
                    Total Credit
                  </Typography>
                </Box>
                <Typography component="p" variant="h4">
                  {formatCurrency(summary.totalCredit)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Month
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140, cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={handleOrdersClick}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <OrderIcon color="primary" sx={{ mr: 1 }} />
                  <Typography component="h2" variant="subtitle1" color="primary">
                    Orders
                  </Typography>
                </Box>
                <Typography component="p" variant="h4">
                  {summary.totalOrders}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PendingIcon sx={{ color: 'warning.main', fontSize: 16, mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {summary.pendingOrders} Pending
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Charts and Tables */}
          <Grid container spacing={3}>
            {/* Sales Chart */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Sales Trends (Last 30 Days)
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {salesChartData && salesChartData.length > 0 ? (
                  <Box sx={{ height: 300 }}>
                    <Line 
                      options={{ 
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                        },
                      }} 
                      data={prepareSalesChartData()} 
                    />
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', my: 4 }}>
                    No sales data available for the period
                  </Typography>
                )}
              </Paper>
            </Grid>
            
            {/* Top Selling Products */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Top Selling Products
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {summary.topProducts && summary.topProducts.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell align="right">Qty</TableCell>
                          <TableCell align="right">Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {summary.topProducts.map((product) => (
                          <TableRow key={product._id}>
                            <TableCell>{product.name}</TableCell>
                            <TableCell align="right">{product.totalQuantity}</TableCell>
                            <TableCell align="right">{formatCurrency(product.totalValue)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', my: 4 }}>
                    No product data available
                  </Typography>
                )}
              </Paper>
            </Grid>
            
            {/* Outstanding Balances */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Stores with Outstanding Balance
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {summary.topDebtStores && summary.topDebtStores.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Store Name</TableCell>
                          <TableCell align="right">Outstanding Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {summary.topDebtStores.map((store) => (
                          <TableRow key={store._id}>
                            <TableCell>{store.name}</TableCell>
                            <TableCell align="right">{formatCurrency(Math.abs(store.balance))}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Total Outstanding</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(summary.totalOutstanding)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', my: 4 }}>
                    No outstanding balances
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          <Dialog 
  open={openSalesDialog} 
  onClose={() => setOpenSalesDialog(false)}
  maxWidth="md"
  fullWidth
>
  <DialogTitle>Sales Details</DialogTitle>
  <DialogContent>
    {loadingSales ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    ) : salesData.length === 0 ? (
      <Typography sx={{ p: 2, textAlign: 'center' }}>No sales data found</Typography>
    ) : (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell align="right">Sales Amount</TableCell>
              <TableCell align="right">Cash Received</TableCell>
              <TableCell align="right">Credit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {salesData.map((day) => (
              <TableRow key={day._id}>
                <TableCell>{day._id}</TableCell>
                <TableCell align="right">{formatCurrency(day.sales)}</TableCell>
                <TableCell align="right">{formatCurrency(day.cash)}</TableCell>
                <TableCell align="right">{formatCurrency(day.credit)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenSalesDialog(false)}>Close</Button>
  </DialogActions>
</Dialog>

          <Dialog 
            open={openCashDialog} 
            onClose={() => setOpenCashDialog(false)}
            maxWidth="md"
            fullWidth
            >
            <DialogTitle>Cash Received Transactions</DialogTitle>
            <DialogContent>
              {loadingTransactions ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : cashTransactions.length === 0 ? (
                <Typography sx={{ p: 2, textAlign: 'center' }}>No cash transactions found</Typography>
              ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Store</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cashTransactions.map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell>{new Date(transaction.paymentDate).toLocaleDateString()}</TableCell>
                        <TableCell>{transaction.store.name}</TableCell>
                        <TableCell>{transaction.paymentType.replace('_', ' ').toUpperCase()}</TableCell>
                        <TableCell align="right">{formatCurrency(transaction.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenCashDialog(false)}>Close</Button>
  </DialogActions>
</Dialog>
  
        
{/* Credit Dialog */}
<Dialog 
  open={openCreditDialog} 
  onClose={() => setOpenCreditDialog(false)}
  maxWidth="md"
  fullWidth
>
  <DialogTitle>Store Credit Summary</DialogTitle>
  <DialogContent>
    {/* Display store credits */}
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Store</TableCell>
            <TableCell align="right">Outstanding Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {summary.topDebtStores && summary.topDebtStores.map((store) => (
            <TableRow key={store._id}>
              <TableCell>{store.name}</TableCell>
              <TableCell align="right">{formatCurrency(Math.abs(store.balance))}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenCreditDialog(false)}>Close</Button>
  </DialogActions>
</Dialog>
        </>
      )}
    </Box>
  );
};

export default Dashboard;