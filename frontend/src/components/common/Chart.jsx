import React from 'react'
import ReactApexChart from 'react-apexcharts'

const Chart = ({ type = 'line', height = 300, series = [], options = {} }) => {
  // Ensure series data is valid
  const safeSeries = Array.isArray(series) ? series.filter(s => s && s.data && Array.isArray(s.data)) : []
  const defaultOptions = {
    chart: {
      type: type,
      height: height,
      toolbar: {
        show: false
      },
      background: 'transparent',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    colors: ['#0066FF', '#00CC66', '#CC00FF', '#FF6600', '#FF0000', '#00CCFF', '#66CC00', '#FF9900'], // Bold, original colors
    grid: {
      borderColor: 'rgba(255,255,255,0.1)',
      strokeDashArray: 4,
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    },
    xaxis: {
      labels: {
        style: {
          colors: 'rgba(255,255,255,0.7)',
          fontSize: '12px'
        }
      },
      axisBorder: {
        color: 'rgba(255,255,255,0.1)'
      },
      axisTicks: {
        color: 'rgba(255,255,255,0.1)'
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: 'rgba(255,255,255,0.7)',
          fontSize: '12px'
        },
        formatter: function(value) {
          if (value === null || value === undefined || isNaN(value)) {
            return '0'
          }
          return value.toLocaleString('en-US', { 
            minimumFractionDigits: 0,
            maximumFractionDigits: 0 
          })
        }
      }
    },
    legend: {
      labels: {
        colors: 'rgba(255,255,255,0.7)'
      }
    },
    tooltip: {
      theme: 'dark',
      x: {
        format: 'dd MMM yyyy'
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        gradientToColors: ['#3b82f6', '#10b981'],
        shadeIntensity: 1,
        type: 'vertical',
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 100]
      }
    },
    ...options
  }

  const defaultSeries = [{
    name: 'Portfolio Value',
    data: [28000, 29500, 31200, 29800, 31200, 32500, 34000, 35430]
  }]

  return (
    <ReactApexChart 
      options={defaultOptions} 
      series={safeSeries.length ? safeSeries : defaultSeries} 
      type={type} 
      height={height} 
    />
  )
}

export default Chart
