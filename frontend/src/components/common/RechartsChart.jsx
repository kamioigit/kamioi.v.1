import React from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { useTheme } from '../../context/ThemeContext'

const RechartsChart = ({
  type = 'line',
  data = [],
  width = '100%',
  height = 300,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  xAxisKey = 'name',
  yAxisKey = 'value',
  lineKey = 'value',
  areaKey = 'value',
  barKey = 'value'
}) => {
  const { isLightMode } = useTheme()

  // Theme-based colors
  const textColor = isLightMode ? '#374151' : '#d1d5db'
  const gridColor = isLightMode ? '#e5e7eb' : '#374151'
  const tooltipBg = isLightMode ? '#ffffff' : '#1f2937'
  const tooltipBorder = isLightMode ? '#e5e7eb' : '#374151'

  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : []

  // Common axis props
  const axisProps = {
    tick: { fill: textColor, fontSize: 12 },
    axisLine: { stroke: gridColor },
    tickLine: { stroke: gridColor }
  }

  // Y-axis props with comma formatting
  const yAxisProps = {
    ...axisProps,
    tickFormatter: (value) => value.toLocaleString()
  }

  // Common tooltip props
  const tooltipProps = showTooltip ? {
    contentStyle: {
      backgroundColor: tooltipBg,
      border: `1px solid ${tooltipBorder}`,
      borderRadius: '8px',
      color: textColor,
      fontSize: '14px',
      fontWeight: '600'
    },
    itemStyle: {
      color: textColor,
      fontSize: '13px'
    },
    formatter: (value, name) => [`$${value.toLocaleString()}`, name]
  } : false

  // Common legend props
  const legendProps = showLegend ? {
    wrapperStyle: { color: textColor, paddingLeft: '20px' },
    layout: "vertical",
    verticalAlign: "middle",
    align: "right"
  } : false

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={safeData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
            <XAxis dataKey={xAxisKey} {...axisProps} />
            <YAxis {...yAxisProps} />
            {showTooltip && <Tooltip {...tooltipProps} />}
            {showLegend && <Legend {...legendProps} />}
            <Line
              type="monotone"
              dataKey={lineKey}
              stroke={colors[0]}
              strokeWidth={2}
              dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2 }}
            />
          </LineChart>
        )

      case 'area':
        return (
          <AreaChart data={safeData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
            <XAxis dataKey={xAxisKey} {...axisProps} />
            <YAxis {...yAxisProps} />
            {showTooltip && <Tooltip {...tooltipProps} />}
            {showLegend && <Legend {...legendProps} />}
            <Area
              type="monotone"
              dataKey={areaKey}
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.3}
            />
          </AreaChart>
        )

      case 'bar':
        return (
          <BarChart data={safeData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
            <XAxis dataKey={xAxisKey} {...axisProps} />
            <YAxis {...yAxisProps} />
            {showTooltip && <Tooltip {...tooltipProps} />}
            {showLegend && <Legend {...legendProps} />}
            <Bar dataKey={barKey} fill={colors[0]} />
            {safeData.length > 0 && safeData[0].currentValue !== undefined && (
              <Bar dataKey="currentValue" fill={colors[1] || colors[0]} />
            )}
          </BarChart>
        )

      case 'pie':
      case 'donut': {
        // Limit to top 5 segments for better readability, combine others into "Others"
        const sortedData = safeData.length > 0 ? safeData.sort((a, b) => b.value - a.value) : []

        const topData = sortedData.slice(0, 5)
        const othersData = sortedData.slice(5)
        const othersValue = othersData.reduce((sum, item) => sum + item.value, 0)
        
        const pieData = othersValue > 0 ? [...topData, { name: 'Others', value: othersValue }] : topData

        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: '8px',
                color: textColor,
                fontSize: '14px',
                fontWeight: '600'
              }}
              itemStyle={{
                color: textColor,
                fontSize: '13px'
              }}
              formatter={(value, name) => [`$${value.toLocaleString()}`, name]}
            />
            {showLegend && <Legend 
              wrapperStyle={{ color: textColor, paddingLeft: '20px' }} 
              layout="vertical"
              verticalAlign="middle"
              align="right"
            />}
          </PieChart>
        )
      }

      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Unsupported chart type: {type}</p>
          </div>
        )
    }
  }

  return (
    <ResponsiveContainer width={width} height={height}>
      {renderChart()}
    </ResponsiveContainer>
  )
}

export default RechartsChart
