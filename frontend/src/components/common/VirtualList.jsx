/**
 * VirtualList - A reusable virtual scrolling component
 *
 * Uses @tanstack/react-virtual for efficient rendering of large lists.
 * Only renders visible items plus a small overscan buffer.
 *
 * Usage:
 *   <VirtualList
 *     items={transactions}
 *     height={400}
 *     estimateSize={60}
 *     renderItem={(item, index) => <TransactionRow key={item.id} data={item} />}
 *   />
 */

import React, { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

const VirtualList = ({
  items = [],
  height = 400,
  estimateSize = 50,
  overscan = 5,
  renderItem,
  className = '',
  emptyMessage = 'No items to display',
  loading = false,
  loadingMessage = 'Loading...'
}) => {
  const parentRef = useRef(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan
  })

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-gray-500">{loadingMessage}</div>
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-gray-500">{emptyMessage}</div>
      </div>
    )
  }

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * VirtualTable - Virtual scrolling for table rows
 *
 * Usage:
 *   <VirtualTable
 *     items={transactions}
 *     height={400}
 *     columns={['Date', 'Merchant', 'Amount']}
 *     renderRow={(item, index) => (
 *       <tr key={item.id}>
 *         <td>{item.date}</td>
 *         <td>{item.merchant}</td>
 *         <td>{item.amount}</td>
 *       </tr>
 *     )}
 *   />
 */
export const VirtualTable = ({
  items = [],
  height = 400,
  estimateSize = 48,
  overscan = 5,
  columns = [],
  renderRow,
  renderHeader,
  className = '',
  tableClassName = '',
  emptyMessage = 'No data to display',
  loading = false
}) => {
  const parentRef = useRef(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan
  })

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Fixed header */}
      {renderHeader ? (
        <table className={`w-full ${tableClassName}`}>
          <thead>{renderHeader()}</thead>
        </table>
      ) : columns.length > 0 ? (
        <table className={`w-full ${tableClassName}`}>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="text-left p-2 border-b font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      ) : null}

      {/* Scrollable body */}
      <div ref={parentRef} className="overflow-auto" style={{ height }}>
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          <table className={`w-full ${tableClassName}`}>
            <tbody>
              <tr style={{ height: `${virtualizer.getTotalSize()}px` }}>
                <td style={{ padding: 0, position: 'relative' }}>
                  {virtualizer.getVirtualItems().map((virtualItem) => (
                    <div
                      key={virtualItem.key}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualItem.start}px)`
                      }}
                    >
                      <table className={`w-full ${tableClassName}`}>
                        <tbody>
                          {renderRow(items[virtualItem.index], virtualItem.index)}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default VirtualList
