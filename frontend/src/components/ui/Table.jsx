import React from 'react';

export const Table = ({ children, className = '', ...props }) => {
  return (
    <div className="overflow-x-auto">
      <table
        className={`min-w-full ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children, className = '', ...props }) => {
  return (
    <thead
      className={`bg-gray-50 border-b border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
};

export const TableBody = ({ children, className = '', ...props }) => {
  return (
    <tbody
      className={`bg-white divide-y divide-gray-200 ${className}`}
      {...props}
    >
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, className = '', ...props }) => {
  return (
    <tr
      className={`hover:bg-gray-50 transition-colors ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHead = ({ children, className = '', sortable, onSort, ...props }) => {
  return (
    <th
      className={`px-6 py-3 text-left text-sm font-medium text-gray-900 ${
        sortable ? 'cursor-pointer hover:bg-gray-100' : ''
      } ${className}`}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      {children}
    </th>
  );
};

export const TableCell = ({ children, className = '', ...props }) => {
  return (
    <td
      className={`px-6 py-4 text-sm text-gray-900 ${className}`}
      {...props}
    >
      {children}
    </td>
  );
};

export default Table;
