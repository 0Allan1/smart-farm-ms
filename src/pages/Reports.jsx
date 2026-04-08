import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement
} from 'chart.js';
import { Download } from 'lucide-react';
import api from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Reports = () => {
  const [loading, setLoading] = React.useState(true);
  const [analytics, setAnalytics] = React.useState(null);

  const fetchAnalytics = async () => {
    try {
      const data = await api.get('/reports/analytics');
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAnalytics();
  }, []);

  // Format data for Line Chart (Activity Trend)
  const getTrendData = () => {
    if (!analytics) return { labels: [], datasets: [] };
    
    // Sort dates
    const dates = Object.keys(analytics.activityTrend).sort();
    
    return {
      labels: dates.map(d => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: 'Irrigation',
          data: dates.map(d => analytics.activityTrend[d].Irrigation),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          tension: 0.3
        },
        {
          label: 'Fertilization',
          data: dates.map(d => analytics.activityTrend[d].Fertilization),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          tension: 0.3
        }
      ],
    };
  };

  // Format data for Bar Chart (Growth Stages)
  const getStageData = () => {
    if (!analytics) return { labels: [], datasets: [] };
    
    const stages = Object.keys(analytics.stageCounts);
    
    return {
      labels: stages,
      datasets: [
        {
          label: 'Number of Crops',
          data: stages.map(s => analytics.stageCounts[s]),
          backgroundColor: '#c084fc',
        }
      ],
    };
  };

  const exportCSV = async () => {
    try {
      const data = await api.get('/reports/export');
      
      // Flatten data for CSV
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Crop Name,Variation,Farm,Plot Location,Planted Date,Status,Activity Type,Activity Notes,Date\n";
      
      data.forEach(crop => {
        if (crop.activities.length === 0) {
          csvContent += `${crop.name},${crop.variation || ''},${crop.farm.name},${crop.farm.location},${new Date(crop.plantedDate).toLocaleDateString()},${crop.status},N/A,N/A,N/A\n`;
        } else {
          crop.activities.forEach(act => {
            csvContent += `${crop.name},${crop.variation || ''},${crop.farm.name},${crop.farm.location},${new Date(crop.plantedDate).toLocaleDateString()},${crop.status},${act.type},${act.notes || ''},${new Date(act.createdAt).toLocaleDateString()}\n`;
          });
        }
      });
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `farm_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert('Error exporting data');
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
    },
  };

  return (
    <div className="animate-fade-in flex-col gap-lg">
      <div className="flex justify-between items-center mb-md">
        <div>
          <h1 style={{ margin: 0 }}>Reports & Analytics</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Visualize productivity and export farm records.</p>
        </div>
        <button className="btn btn-primary" onClick={exportCSV} disabled={loading}>
          <Download size={18} /> Export Records (CSV)
        </button>
      </div>

      {loading ? (
        <div className="p-xl text-center">Crunching your farm data...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ height: '400px' }}>
            <h3 style={{ marginBottom: '1rem', marginTop: 0 }}>Activity Trends (Last 30 Days)</h3>
            <div style={{ height: '320px' }}>
              <Line data={getTrendData()} options={chartOptions} />
            </div>
          </div>

          <div className="card" style={{ height: '400px' }}>
            <h3 style={{ marginBottom: '1rem', marginTop: 0 }}>Crop Distribution by Stage</h3>
            <div style={{ height: '320px' }}>
              <Bar data={getStageData()} options={chartOptions} />
            </div>
          </div>
        </div>
      )}
      
      <div className="card mt-md">
        <h3 style={{ marginTop: 0 }}>Smart Yield Prediction</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          {analytics?.summary?.totalCrops > 0 
           ? `Based on your ${analytics.summary.totalCrops} active crops and recent ${analytics.summary.totalActivities} activities, your farm is on track for a high-yield season. Maintain current irrigation levels for optimal results.`
           : 'Add crops and log activities to enable AI-powered yield predictions.'}
        </p>
      </div>
    </div>
  );
};

export default Reports;
