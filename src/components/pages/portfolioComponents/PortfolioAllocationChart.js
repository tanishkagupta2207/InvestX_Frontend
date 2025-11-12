// PortfolioAllocationChart.jsx

import React from 'react';
import { Pie } from 'react-chartjs-2';

const PortfolioAllocationChart = ({ chartData, availableColors }) => {
    
    // --- Responsive Container Styles ---
    const containerStyle = {
        height: '400px', 
        // ❌ REMOVED: width: '600px' 
        padding: '20px'
    };

    if (!chartData || chartData.data.length === 0) {
        return (
            <div className="card bg-dark border-secondary h-100" style={{ ...containerStyle, width: '100%' }}>
                <div className="d-flex justify-content-center align-items-center h-100">
                    <p className="text-muted">No assets to display for allocation chart.</p>
                </div>
            </div>
        );
    }

    const backgroundColors = chartData.labels.map(
        (_, index) => availableColors[index % availableColors.length]
    );

    const finalChartData = {
        labels: chartData.labels,
        datasets: [
            {
                data: chartData.data,
                backgroundColor: backgroundColors,
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false, // Ensures the chart fills the container's height/width defined by CSS/grid
        plugins: {
            legend: {
                position: 'right', 
                labels: {
                    color: '#f8f9fa',
                },
            },
            tooltip: {
                // Add a simple tooltip callback for better data visualization on hover
                callbacks: {
                    label: function(context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(context.parsed);
                        }
                        return label;
                    }
                }
            },
            title: {
                display: true,
                text: 'Asset Allocation',
                color: '#f8f9fa',
                font: {
                    size: 16,
                },
            },
        },
    };

    return (
        <div className="card bg-dark border-secondary h-100 w-100" style={containerStyle}>
            <Pie data={finalChartData} options={chartOptions} />
        </div>
    );
};

export default PortfolioAllocationChart;