import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Paper, Typography, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Divider
} from '@mui/material';
import { 
  TrendingUp as SalesIcon,
  CreditCard as CreditIcon,
  LocalAtm as CashIcon,
  ListAlt as OrderIcon,
  Pending as PendingIcon
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { getDashboardSummary, getSalesChartData, getProductChartData } from '../../utils/api';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [salesChartData, setSalesChartData] = useState(null);
  const [productChartData, setProductChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
    
    fetchDashboardData();
  }, []);

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
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
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
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
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
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
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
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
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
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
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
        </>
      )}
    </Box>
  );
};

export default Dashboard;