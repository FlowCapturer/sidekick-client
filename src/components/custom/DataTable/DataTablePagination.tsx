import type { Table } from '@tanstack/react-table';
import PaginationWrapper from '../PaginationWrapper';

interface DataTablePaginationProp<TData> {
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  totalCount: number;
  table: Table<TData>;
}

const DataTablePagination = <TData,>({
  pagination,
  totalCount,
  table,
}: DataTablePaginationProp<TData>) => {
  return (
    <div className="flex items-center justify-end space-x-2 pt-4">
      <PaginationWrapper
        totalCount={totalCount}
        activePage={pagination.pageIndex}
        onPageChange={(pageNo: number) => {
          table.setPageIndex(pageNo);
        }}
        pageSize={pagination.pageSize}
      />
    </div>
  );
};

export default DataTablePagination;
