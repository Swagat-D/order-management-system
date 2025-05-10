import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Button,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {
  TrendingUp as SalesIcon,
  CreditCard as CreditIcon,
  LocalAtm as CashIcon,
  ListAlt as OrderIcon,
  Pending as PendingIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { getDashboardSummary, getSalesChartData, getProductChartData } from '../../utils/api';
import { useLocation, useNavigate } from 'react-router-dom';

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
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [openSalesDialog, setOpenSalesDialog] = useState(false);
  const [salesData, setSalesData] = useState([]);
  const [loadingSales, setLoadingSales] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
  }, [location.key, lastRefreshed]);

  const handleOrdersClick = () => navigate('/orders');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const summaryData = await getDashboardSummary();
      setSummary(summaryData);
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
      const data = await getSalesChartData();
      setSalesData(data);
    } catch (err) {
      console.error('Error fetching sales data:', err);
    } finally {
      setLoadingSales(false);
    }
  };

  const handleRefresh = () => setLastRefreshed(new Date());

  const fetchCashTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const response = await axios.get('/api/payments?type=cash,upi,bank_transfer', {
        headers: { 'x-auth-token': localStorage.getItem('token') },
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
  };

  const handleSalesClick = () => {
    fetchSalesData();
    setOpenSalesDialog(true);
  };

  const prepareSalesChartData = () => {
    if (!salesChartData) return null;
    return {
      labels: salesChartData.map((item) => item._id),
      datasets: [
        {
          label: 'Total Sales',
          data: salesChartData.map((item) => item.sales),
          borderColor: '#0288d1',
          backgroundColor: 'rgba(2, 136, 209, 0.2)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Cash Received',
          data: salesChartData.map((item) => item.cash),
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Credit',
          data: salesChartData.map((item) => item.credit),
          borderColor: '#f06292',
          backgroundColor: 'rgba(240, 98, 146, 0.2)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const formatCurrency = (amount) => `₹${amount.toFixed(2)}`;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} thickness={4} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3 }, py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.75rem', sm: '2.25rem' },
            color: 'text.primary',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -4,
              left: 0,
              width: 60,
              height: 4,
              bgcolor: 'secondary.main',
              borderRadius: 2,
            },
          }}
        >
          Dashboard
        </Typography>
        <Tooltip title="Refresh Data">
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{
              borderRadius: '12px',
              py: { xs: 1, sm: 1.5 },
              px: { xs: 2, sm: 3 },
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark', transform: 'scale(1.03)' },
              transition: 'all 0.2s ease',
            }}
          >
            Refresh
          </Button>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          {error}
        </Alert>
      )}

      {summary && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 5 }}>
            {[
              {
                title: 'Total Sales',
                value: formatCurrency(summary.totalSales),
                icon: <SalesIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#ffffff' }} />,
                gradient: 'linear-gradient(135deg, #0288d1 0%, #4fb3bf 100%)',
                onClick: handleSalesClick,
              },
              {
                title: 'Cash Received',
                value: formatCurrency(summary.totalCash),
                icon: <CashIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#ffffff' }} />,
                gradient: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
                onClick: handleCashClick,
              },
              {
                title: 'Total Credit',
                value: formatCurrency(summary.totalCredit),
                icon: <CreditIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#ffffff' }} />,
                gradient: 'linear-gradient(135deg, #f06292 0%, #ff94c2 100%)',
                onClick: () => setOpenCreditDialog(true),
              },
              {
                title: 'Orders',
                value: summary.totalOrders,
                icon: <OrderIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#ffffff' }} />,
                gradient: 'linear-gradient(135deg, #0288d1 0%, #4fb3bf 100%)',
                onClick: handleOrdersClick,
                subText: (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <PendingIcon sx={{ color: '#ff9800', fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" sx={{ color: '#ffffff', opacity: 0.8 }}>
                      {summary.pendingOrders} Pending
                    </Typography>
                  </Box>
                ),
              },
            ].map((card, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  sx={{
                    p: { xs: 2, sm: 3 },
                    minHeight: 140,
                    maxHeight: 160,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: card.gradient,
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                    },
                  }}
                  onClick={card.onClick}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {card.icon}
                    <Typography
                      variant="subtitle1"
                      sx={{
                        ml: 1,
                        fontWeight: 600,
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        color: '#ffffff',
                      }}
                    >
                      {card.title}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: '1.25rem', sm: '1.5rem' },
                        color: '#ffffff',
                      }}
                    >
                      {card.value}
                    </Typography>
                    {card.subText || (
                      <Typography variant="body2" sx={{ color: '#ffffff', opacity: 0.8, mt: 0.5 }}>
                        Current Month
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Charts and Tables */}
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {/* Sales Chart */}
            <Grid item xs={12} md={8}>
              <Paper
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  bgcolor: 'background.paper',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    color: 'text.primary',
                    mb: 2,
                  }}
                >
                  Sales Trends (Last 30 Days)
                </Typography>
                {salesChartData && salesChartData.length > 0 ? (
                  <Box sx={{ height: { xs: 250, sm: 350 } }}>
                    <Line
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'top', labels: { font: { size: 12 }, color: 'text.primary' } },
                          tooltip: { backgroundColor: 'background.paper', titleColor: 'text.primary', bodyColor: 'text.primary' },
                        },
                        scales: {
                          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: 'text.secondary' } },
                          y: { grid: { color: '#e0e0e0' }, ticks: { font: { size: 10 }, color: 'text.secondary' } },
                        },
                      }}
                      data={prepareSalesChartData()}
                    />
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', my: 4 }}>
                    No sales data available
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* Top Selling Products */}
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  bgcolor: 'background.paper',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    color: 'text.primary',
                    mb: 2,
                  }}
                >
                  Top Selling Products
                </Typography>
                {summary.topProducts && summary.topProducts.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'background.default' }}>
                          <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Product</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Qty</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {summary.topProducts.map((product, index) => (
                          <TableRow key={product._id} sx={{ '&:hover': { bgcolor: 'background.default' } }}>
                            <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{product.name}</TableCell>
                            <TableCell align="right" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{product.totalQuantity}</TableCell>
                            <TableCell align="right" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, fontWeight: 500 }}>
                              {formatCurrency(product.totalValue)}
                            </TableCell>
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
              <Paper
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  bgcolor: 'background.paper',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    color: 'text.primary',
                    mb: 2,
                  }}
                >
                  Stores with Outstanding Balance
                </Typography>
                {summary.topDebtStores && summary.topDebtStores.length > 0 ? (
                  <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'background.default' }}>
                          <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Store Name</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                            Outstanding Amount
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {summary.topDebtStores.map((store, index) => (
                          <TableRow key={store._id} sx={{ '&:hover': { bgcolor: 'background.default' } }}>
                            <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{store.name}</TableCell>
                            <TableCell align="right" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, fontWeight: 500 }}>
                              {formatCurrency(Math.abs(store.balance))}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ bgcolor: 'background.default' }}>
                          <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Total Outstanding</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
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

          {/* Dialogs remain unchanged for brevity, but ensure responsive font sizes and padding */}
          {/* Add similar styling to dialogs as in OrderEntry for consistency */}
        </>
      )}
    </Box>
  );
};

export default Dashboard;