import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ChevronDown, RefreshCcw } from 'lucide-react';
import type { Table } from '@tanstack/react-table';
import type { columnProp } from './DataTable';
import FlexColsLayout from '../Layouts/FlexColsLayout';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Toolbar } from '../Toolbar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ButtonGroup } from '@/components/ui/button-group';
import { useEffect, useState } from 'react';

export interface DataTableToolbarProp {
  canShowSearchField: boolean;
  searchFieldConfig?: {
    placeholder?: string;
    searchField?: string;
  };
  canShowColumnsBtn: boolean;
  additionalJSX: React.ReactNode[];
  refreshBtn?: {
    canShow: boolean;
    onClick: () => void;
  };
  allowSearchOnAllFields?: boolean;
}

interface DataTableToolbarInternalProps<TData> {
  table: Table<TData>;
  rawColumns: columnProp[];
}

function DataTableToolbar<TData>({
  table,
  canShowSearchField = true,
  searchFieldConfig = {},
  canShowColumnsBtn = false,
  additionalJSX,
  rawColumns,
  refreshBtn = {
    canShow: false,
    onClick: () => {},
  },
  allowSearchOnAllFields = false,
}: DataTableToolbarProp & DataTableToolbarInternalProps<TData>) {
  const getColumnById = (id: string) => rawColumns.find((col) => col.id === id);
  const isMobile = useIsMobile();
  const [selectedSearchField, setSelectedSearchField] = useState<string>(searchFieldConfig?.searchField || '');

  useEffect(() => {
    if (searchFieldConfig?.searchField) {
      setSelectedSearchField(searchFieldConfig.searchField);
    }
  }, [searchFieldConfig?.searchField]);

  const handleColumnChange = (columnId: string) => {
    const previousColumn = table.getColumn(selectedSearchField);
    const currentValue = previousColumn?.getFilterValue() as string;
    previousColumn?.setFilterValue(undefined);

    setSelectedSearchField(columnId);

    if (currentValue) {
      table.getColumn(columnId)?.setFilterValue(currentValue);
    }
  };

  return (
    <FlexColsLayout className="px-1 py-2 gap-2" layout={isMobile ? 'vertical' : 'horizontal'} doNotAppendFlex1={true}>
      <Toolbar
        leftItems={[
          canShowSearchField && searchFieldConfig.searchField ? (
            allowSearchOnAllFields ? (
              <ButtonGroup key="searchGroup">
                <Select value={selectedSearchField} onValueChange={handleColumnChange}>
                  <SelectTrigger className="min-w-[100px] focus-visible:ring-0">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {rawColumns
                      .filter((col) => col.type === 'string')
                      .map((col) => (
                        <SelectItem key={col.id} value={col.id}>
                          {col.headerText}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Input
                  key="searchField"
                  placeholder={searchFieldConfig.placeholder}
                  value={(table.getColumn(selectedSearchField)?.getFilterValue() as string) ?? ''}
                  onChange={(event) => {
                    const column = table.getColumn(selectedSearchField);
                    column?.setFilterValue(event.target.value);
                  }}
                  style={{ width: '300px' }}
                />
              </ButtonGroup>
            ) : (
              <Input
                key="searchField"
                placeholder={searchFieldConfig.placeholder}
                value={(table.getColumn(searchFieldConfig.searchField)?.getFilterValue() as string) ?? ''}
                onChange={(event) => {
                  const column = table.getColumn(searchFieldConfig.searchField as string);
                  column?.setFilterValue(event.target.value);
                }}
                className="max-w-sm"
              />
            )
          ) : (
            <></>
          ),

          refreshBtn.canShow && (
            <Button variant={'ghost'} key="refreshBtn" onClick={refreshBtn.onClick}>
              <RefreshCcw /> Refresh
            </Button>
          ),
        ]}
        rightItems={[
          canShowColumnsBtn && (
            <DropdownMenu key="columnsBtnDropDown">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" key="columnsBtn">
                  Columns <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide() && getColumnById(column.id)?.enableHiding)
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {getColumnById(column.id)?.headerText || ''}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          ),
          ...additionalJSX,
        ]}
      />
    </FlexColsLayout>
  );
}

export default DataTableToolbar;
