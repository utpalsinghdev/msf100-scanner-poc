/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@/lib/utils";
import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import {
  useTable,
  useFilters,
  useGlobalFilter,
  useSortBy,
  usePagination,
} from "react-table";
import {
  SortIcon,
  SortUpIcon,
  SortDownIcon,
} from "../../assets/icons/sorting";
import { useAsyncDebounce } from "../../hooks/use_debounce";
import { useIsMobile } from "../../hooks/useMediaQuery";
import { Button } from "./button";
import { Plus, SearchX } from "lucide-react";

export function PageButton({ children, className, disabled, ...rest }: any) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "inline-flex flex-1 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition sm:flex-none",
        "hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

function GlobalFilter({
  globalFilter,
  setGlobalFilter,
  value: controlledValue,
  onChange,
}: any) {
  const isControlled = onChange != null;
  const [value, setValue] = React.useState(
    isControlled ? controlledValue : globalFilter,
  );

  React.useEffect(() => {
    if (isControlled) setValue(controlledValue ?? "");
  }, [isControlled, controlledValue]);

  const onFilterChange = useAsyncDebounce((val: any) => {
    if (isControlled) onChange(val || "");
    else setGlobalFilter(val || undefined);
  }, 300);

  return (
    <div className="relative w-full">
      <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        className="h-10 w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value);
          onFilterChange(e.target.value);
        }}
        placeholder="Search records…"
      />
    </div>
  );
}

function getHeaderLabel(column: any): string {
  if (typeof column.Header === "string") return column.Header;
  return column.id ?? "";
}

function MobileRowCard({ row, columns }: { row: any; columns: any[] }) {
  const actionCol = columns.find(
    (c) =>
      c.accessor === "action" ||
      getHeaderLabel(c) === "Actions" ||
      getHeaderLabel(c) === "Action"
  );
  const selectCol = columns.find((c) => c.accessor === "select");
  const dataCols = columns.filter((c) => c !== actionCol && c !== selectCol);

  return (
    <article className="surface-card-interactive p-4">
      {selectCol && (
        <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3">
          {row.cells
            .find(
              (c: any) =>
                c.column === selectCol || c.column.accessor === "select",
            )
            ?.render("Cell")}
          <span className="text-xs font-medium text-slate-500">Select</span>
        </div>
      )}
      <dl className="space-y-3">
        {dataCols.map((col) => {
          const colKey = col.id ?? col.accessor;
          const cell = row.cells.find(
            (c: any) =>
              c.column.id === colKey ||
              c.column.accessor === col.accessor ||
              c.column.id === col.accessor,
          );
          if (!cell) return null;
          const label = getHeaderLabel(col);
          if (!label || label === "d") {
            return (
              <div key={col.id} className="flex items-center justify-between">
                <dt className="text-xs font-medium uppercase text-slate-400">#</dt>
                <dd className="text-sm font-medium text-slate-900">{cell.render("Cell")}</dd>
              </div>
            );
          }
          return (
            <div key={col.id} className="flex items-start justify-between gap-3">
              <dt className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-400">
                {label}
              </dt>
              <dd className="min-w-0 text-right text-sm text-slate-800">{cell.render("Cell")}</dd>
            </div>
          );
        })}
      </dl>
      {actionCol && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {row.cells
            .find((c: any) => c.column === actionCol || c.column.accessor === "action")
            ?.render("Cell")}
        </div>
      )}
    </article>
  );
}

function Table({
  columns,
  data,
  btnText,
  title,
  subtitle,
  dataName,
  btnfunc,
  headerActions,
  // Server-side mode (optional — other pages keep client pagination/search)
  serverSide,
  pageIndex = 0,
  pageSize = 10,
  pageCount = 1,
  totalCount,
  searchValue = "",
  onSearchChange,
  onPageChange,
  onPageSizeChange,
}: any) {
  const isMobile = useIsMobile();
  const {
    state,
    pageOptions,
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    gotoPage,
    nextPage,
    previousPage,
    setGlobalFilter,
    setPageSize,
  }: any = useTable(
    // react-table v7 types omit pagination fields on TableState unless plugins are fully typed.
    {
      columns,
      data,
      ...(serverSide
        ? {
            manualPagination: true,
            manualGlobalFilter: true,
            pageCount: Math.max(1, pageCount),
            initialState: { pageIndex: 0, pageSize },
            autoResetPage: false,
          }
        : {}),
    } as any,
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination,
  );

  // Keep react-table page index in sync with server page.
  React.useEffect(() => {
    if (serverSide) gotoPage(pageIndex);
  }, [serverSide, pageIndex, gotoPage]);

  React.useEffect(() => {
    if (serverSide) setPageSize(pageSize);
  }, [serverSide, pageSize, setPageSize]);

  const displayCount = serverSide ? (totalCount ?? data.length) : data.length;
  const currentPage = serverSide ? pageIndex + 1 : state.pageIndex + 1;
  const totalPages = serverSide ? Math.max(1, pageCount) : pageOptions.length;
  const showPagination = serverSide ? totalPages > 1 || displayCount > 10 : pageOptions.length > 1;

  const toolbar = (
    <>
      <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">{title}</h2>
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
              {displayCount} {dataName}
            </span>
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
          {headerActions}
          {btnText && (
            <Button onClick={btnfunc} className="w-full gap-2 sm:w-auto">
              <Plus className="h-4 w-4" />
              {btnText}
            </Button>
          )}
        </div>
      </div>
      <div className="border-b border-slate-50 px-4 py-3 sm:px-6 sm:py-4">
        <GlobalFilter
          globalFilter={state.globalFilter}
          setGlobalFilter={setGlobalFilter}
          value={serverSide ? searchValue : undefined}
          onChange={serverSide ? onSearchChange : undefined}
        />
      </div>
    </>
  );

  const pagination = showPagination ? (
      <nav className="flex flex-col gap-4 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:flex-wrap sm:items-center">
          <span>
            Page <strong className="text-slate-900">{currentPage}</strong> of{" "}
            <strong className="text-slate-900">{totalPages}</strong>
          </span>
          <label className="flex items-center gap-2">
            Go to
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const p = e.target.value ? Number(e.target.value) - 1 : 0;
                if (serverSide) onPageChange?.(Math.max(0, Math.min(totalPages - 1, p)));
                else gotoPage(p);
              }}
              className="h-9 w-14 rounded-lg border border-slate-200 px-2 text-center text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>
          <select
            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:w-auto"
            value={serverSide ? pageSize : state.pageSize}
            onChange={(e) => {
              const size = Number(e.target.value);
              if (serverSide) onPageSizeChange?.(size);
              else setPageSize(size);
            }}
          >
            {[10, 20, 30, 40, 50].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <PageButton
            onClick={() =>
              serverSide
                ? onPageChange?.(Math.max(0, pageIndex - 1))
                : previousPage()
            }
            disabled={serverSide ? pageIndex <= 0 : !canPreviousPage}
          >
            Previous
          </PageButton>
          <PageButton
            onClick={() =>
              serverSide
                ? onPageChange?.(Math.min(totalPages - 1, pageIndex + 1))
                : nextPage()
            }
            disabled={
              serverSide ? pageIndex >= totalPages - 1 : !canNextPage
            }
          >
            Next
          </PageButton>
        </div>
      </nav>
    ) : null;

  return (
    <div className="surface-card overflow-hidden shadow-soft">
      {toolbar}

      {isMobile ? (
        <div className="space-y-3 p-4">
          {page?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <SearchX className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-600">No records found</p>
              <p className="mt-1 text-xs text-slate-400">Try adjusting your search</p>
            </div>
          ) : (
            page.map((row: any) => {
              prepareRow(row);
              return <MobileRowCard key={row.id} row={row} columns={columns} />;
            })
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table
            {...getTableProps()}
            className="min-w-full divide-y divide-slate-100"
          >
            <thead className="bg-slate-50/80">
              {headerGroups?.map((headerGroup: any) => (
                <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers?.map((column: any) => (
                    <th
                      key={column.id}
                      scope="col"
                      className="group whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-6"
                      {...column.getHeaderProps(
                        column.disableSortBy ? {} : column.getSortByToggleProps(),
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        {column.render("Header")}
                        {!column.disableSortBy && (
                        <span className="text-slate-400">
                          {column.isSorted ? (
                            column.isSortedDesc ? (
                              <SortDownIcon className="h-4 w-4" />
                            ) : (
                              <SortUpIcon className="h-4 w-4" />
                            )
                          ) : (
                            <SortIcon className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                          )}
                        </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody
              {...getTableBodyProps()}
              className="divide-y divide-slate-100 bg-white"
            >
              {page?.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <SearchX className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">No records found</p>
                      <p className="mt-1 text-xs text-slate-400">Try adjusting your search</p>
                    </div>
                  </td>
                </tr>
              ) : (
                page?.map((row: any) => {
                  prepareRow(row);
                  return (
                    <tr
                      key={row.id}
                      {...row.getRowProps()}
                      className="transition-colors duration-150 hover:bg-indigo-50/30"
                    >
                      {row.cells?.map((cell: any) => (
                        <td
                          key={cell.column.id}
                          {...cell.getCellProps()}
                          className="whitespace-nowrap px-4 py-4 text-sm text-slate-700 sm:px-6"
                        >
                          {cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {pagination}
    </div>
  );
}

export default Table;
