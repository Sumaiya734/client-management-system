import React from 'react';

export const Table = ({ children, className = '', ...props }) => {
  return (
    <div className="overflow-x-auto rounded-2xl">
      <table
        className={`min-w-full backdrop-blur-xl bg-white/40 border border-white/30 ${className}`}
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
      className={`bg-white/40 backdrop-blur-md border-b border-white/30 ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
};

export const TableBody = ({ children, className = '', ...props }) => {
  return (
    <tbody
      className={`bg-white/30 backdrop-blur-md divide-y divide-white/20 ${className}`}
      {...props}
    >
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, className = '', ...props }) => {
  return (
    <tr
      className={`
        transition-all duration-300
        hover:bg-white/40
        hover:shadow-[inset_0_0_0_9999px_rgba(255,255,255,0.15)]
        ${className}
      `}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHead = ({ children, className = '', sortable, onSort, ...props }) => {
  return (
    <th
      className={`
        px-6 py-4
        text-left text-sm font-semibold
        text-gray-700
        ${sortable ? 'cursor-pointer hover:text-purple-600' : ''}
        ${className}
      `}
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
      className={`px-6 py-4 text-sm text-gray-800 ${className}`}
      {...props}
    >
      {children}
    </td>
  );
};

export default Table;
