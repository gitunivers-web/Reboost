import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminPagination {
  pageSize: number;
  pageIndex: number;
  pageCount: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

interface AdminDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  error?: string;
  toolbar?: React.ReactNode;
  filterBar?: React.ReactNode;
  pagination?: AdminPagination;
  initialSorting?: SortingState;
  columnVisibility?: VisibilityState;
  onSortingChange?: (sorting: SortingState) => void;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  emptyState?: React.ReactNode;
  mobileCard?: (row: TData) => React.ReactNode;
}

export default function AdminDataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  error,
  toolbar,
  filterBar,
  pagination,
  initialSorting,
  columnVisibility,
  onSortingChange,
  onColumnFiltersChange,
  emptyState,
  mobileCard,
}: AdminDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting || []);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const handleSortingChange = (updater: any) => {
    const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
    setSorting(newSorting);
    onSortingChange?.(newSorting);
  };

  const handleColumnFiltersChange = (updater: any) => {
    const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
    setColumnFilters(newFilters);
    onColumnFiltersChange?.(newFilters);
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
    },
    manualPagination: true,
    pageCount: pagination?.pageCount ?? -1,
  });

  const renderSkeletonRows = () => {
    return Array.from({ length: pagination?.pageSize || 5 }).map((_, index) => (
      <TableRow key={index}>
        {columns.map((_, colIndex) => (
          <TableCell key={colIndex}>
            <Skeleton className="h-6 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  const renderEmptyState = () => {
    if (emptyState) return emptyState;
    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          <p className="text-muted-foreground">Aucune donnée disponible</p>
        </TableCell>
      </TableRow>
    );
  };

  const renderMobileCards = () => {
    if (!mobileCard) return null;
    
    return (
      <div className="md:hidden space-y-4">
        {data.map((row, index) => (
          <div key={index} data-testid={`card-datatable-row-${index}`}>
            {mobileCard(row)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card data-testid="datatable-admin">
      {(toolbar || filterBar) && (
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {filterBar}
            {toolbar}
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        {error ? (
          <div className="p-6 text-center">
            <p className="text-destructive">{error}</p>
          </div>
        ) : (
          <>
            {mobileCard && renderMobileCards()}
            
            <ScrollArea className="hidden md:block -mx-6">
              <div className="px-6">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      renderSkeletonRows()
                    ) : table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && 'selected'}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      renderEmptyState()
                    )}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>
      {pagination && (
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Page {pagination.pageIndex + 1} sur {pagination.pageCount}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.pageIndex - 1)}
              disabled={pagination.pageIndex === 0}
              data-testid="button-datatable-prev"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.pageIndex + 1)}
              disabled={pagination.pageIndex >= pagination.pageCount - 1}
              data-testid="button-datatable-next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
