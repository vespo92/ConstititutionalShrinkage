import React from 'react';

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

export interface AccessibleTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  caption: string;
  captionVisible?: boolean;
  rowKey: keyof T | ((row: T, index: number) => string);
  sortColumn?: string;
  sortDirection?: 'ascending' | 'descending' | 'none';
  onSort?: (columnKey: string) => void;
  className?: string;
  emptyMessage?: string;
}

/**
 * Accessible table component with proper semantics
 * Includes caption, scope attributes, and sortable columns
 */
export function AccessibleTable<T extends Record<string, unknown>>({
  data,
  columns,
  caption,
  captionVisible = true,
  rowKey,
  sortColumn,
  sortDirection = 'none',
  onSort,
  className = '',
  emptyMessage = 'No data available',
}: AccessibleTableProps<T>) {
  const getRowKey = (row: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(row, index);
    }
    return String(row[rowKey]);
  };

  const getCellValue = (row: T, column: TableColumn<T>): React.ReactNode => {
    if (column.render) {
      return column.render(row, data.indexOf(row));
    }
    const key = column.key as keyof T;
    return row[key] as React.ReactNode;
  };

  return (
    <table className={`accessible-table ${className}`.trim()} role="table">
      <caption
        style={
          captionVisible
            ? undefined
            : {
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: 0,
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                border: 0,
              }
        }
      >
        {caption}
      </caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={String(column.key)}
              scope="col"
              aria-sort={
                sortColumn === column.key
                  ? sortDirection
                  : column.sortable
                  ? 'none'
                  : undefined
              }
            >
              {column.sortable && onSort ? (
                <button
                  type="button"
                  onClick={() => onSort(String(column.key))}
                  aria-label={`Sort by ${column.header}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    font: 'inherit',
                    padding: 0,
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  {column.header}
                  {sortColumn === column.key && (
                    <span aria-hidden="true">
                      {sortDirection === 'ascending' ? ' ▲' : sortDirection === 'descending' ? ' ▼' : ''}
                    </span>
                  )}
                </button>
              ) : (
                column.header
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} style={{ textAlign: 'center' }}>
              {emptyMessage}
            </td>
          </tr>
        ) : (
          data.map((row, rowIndex) => (
            <tr key={getRowKey(row, rowIndex)}>
              {columns.map((column) => (
                <td key={String(column.key)}>{getCellValue(row, column)}</td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export default AccessibleTable;
