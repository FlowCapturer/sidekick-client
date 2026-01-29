import * as React from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import { ArrowUpDown, Check, MoreHorizontal, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DataTableToolbar, { type DataTableToolbarProp } from './DataTableToolbar';
import DataTablePagination from './DataTablePagination';
import { formatISODateWithTime24H, isFunction } from '@/lib/utils';
import LoadingMask from '../LoadingMask';
import FlexColsLayout from '../Layouts/FlexColsLayout';

export interface columnProp {
  id: string;
  headerText: string;
  enableSorting: boolean;
  enableHiding: boolean;
  type?: 'boolean' | 'date' | 'string';
  editable?: boolean;
  renderer?: (record: unknown, cellValue: unknown) => unknown;
}

interface ActionProp<TData> {
  id: string;
  headerText: string;
  onClick?: (record: TData) => void;
}

interface DataTableProps<TData> {
  data: TData[];
  columns: columnProp[];
  actions?: ActionProp<TData>[];
  toolbarConfig?: DataTableToolbarProp;
  loading?: boolean;
  canShowToolbar?: boolean;
  canShowPagination?: boolean;
}

function DataTable<TData extends object>({
  data,
  columns,
  actions,
  toolbarConfig,
  loading = false,
  canShowToolbar = true,
  canShowPagination = true,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const tableColumns: ColumnDef<TData>[] = columns.map((columnRec) => {
    return {
      accessorKey: columnRec.id,
      header: ({ column }) => {
        if (!columnRec.enableSorting) {
          return <span>{columnRec.headerText}</span>;
        }

        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            {columnRec.headerText}
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => {
        const cellValue = row.getValue(columnRec.id);

        if (isFunction(columnRec.renderer)) {
          return columnRec.renderer(row, cellValue);
        }

        let result;

        if (columnRec.type === 'boolean') {
          result = cellValue ? <Check size={20} /> : <X size={18} />;
        } else if (columnRec.type === 'date') {
          result = formatISODateWithTime24H(cellValue as string);
        } else {
          result = String(cellValue);
        }

        return <div>{result}</div>;
      },
    };
  });

  if (actions && actions.length > 0) {
    tableColumns.unshift({
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const record = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="h-5 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>

              {actions.map((menuAction) =>
                menuAction.headerText === 'SEPARATOR' ? (
                  <DropdownMenuSeparator key={menuAction.id} />
                ) : (
                  <DropdownMenuItem key={menuAction.id} onClick={() => menuAction.onClick && menuAction.onClick(record)}>
                    {menuAction.headerText}
                  </DropdownMenuItem>
                ),
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });
  }

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 100,
  });

  const table = useReactTable({
    data,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    ...(canShowPagination && {
      getPaginationRowModel: getPaginationRowModel(),
      onPaginationChange: setPagination,
    }),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  const loadingCls = loading ? 'pointer-events-none opacity-50' : '';
  return (
    <FlexColsLayout className="w-full">
      {canShowToolbar && (
        <DataTableToolbar
          table={table}
          rawColumns={columns}
          canShowSearchField={true}
          canShowColumnsBtn={true}
          {...toolbarConfig}
          additionalJSX={toolbarConfig?.additionalJSX || []}
        />
      )}
      {loading && <LoadingMask />}
      <FlexColsLayout className={`rounded-md border overflow-auto ${loadingCls}`}>
        <Table>
          <TableHeader className="sticky top-0 bg-sidebar">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="flex-1">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={actions && actions.length > 0 ? columns.length + 1 : columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </FlexColsLayout>
      {canShowPagination && <DataTablePagination pagination={pagination} totalCount={data.length} table={table} />}
    </FlexColsLayout>
  );
}

export default React.memo(DataTable);
