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
import { Button } from "./button";
import { Plus } from "lucide-react";

export function PageButton({ children, className, disabled, ...rest }: any) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition",
        "hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-700",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

function GlobalFilter({ globalFilter, setGlobalFilter }: any) {
  const [value, setValue] = React.useState(globalFilter);
  const onFilterChange = useAsyncDebounce((val: any) => {
    setGlobalFilter(val || undefined);
  }, 200);

  return (
    <div className="relative w-full max-w-md">
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

function Table({
  columns,
  data,
  btnText,
  title,
  subtitle,
  dataName,
  btnfunc,
}: any) {
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
    { columns, data },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
              {data.length} {dataName}
            </span>
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
        {btnText && (
          <Button onClick={btnfunc} className="shrink-0 gap-2">
            <Plus className="h-4 w-4" />
            {btnText}
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="border-b border-slate-50 px-6 py-4">
        <GlobalFilter
          globalFilter={state.globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
      </div>

      {/* Table */}
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
                    className="group px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {column.render("Header")}
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
                <td
                  colSpan={columns.length}
                  className="px-6 py-16 text-center text-sm text-slate-500"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              page?.map((row: any) => {
                prepareRow(row);
                return (
                  <tr
                    key={row.id}
                    {...row.getRowProps()}
                    className="transition-colors hover:bg-slate-50/60"
                  >
                    {row.cells?.map((cell: any) => (
                      <td
                        key={cell.column.id}
                        {...cell.getCellProps()}
                        className="whitespace-nowrap px-6 py-4 text-sm text-slate-700"
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

      {/* Pagination */}
      {pageOptions.length > 1 && (
        <nav className="flex flex-col gap-4 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span>
              Page <strong className="text-slate-900">{state.pageIndex + 1}</strong> of{" "}
              <strong className="text-slate-900">{pageOptions.length}</strong>
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <label className="flex items-center gap-2">
              Go to
              <input
                type="number"
                min={1}
                max={pageOptions.length}
                defaultValue={state.pageIndex + 1}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  gotoPage(page);
                }}
                className="h-9 w-14 rounded-lg border border-slate-200 px-2 text-center text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </label>
            <select
              className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={state.pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <PageButton onClick={() => previousPage()} disabled={!canPreviousPage}>
              Previous
            </PageButton>
            <PageButton onClick={() => nextPage()} disabled={!canNextPage}>
              Next
            </PageButton>
          </div>
        </nav>
      )}
    </div>
  );
}

export default Table;
