"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export interface PaginationQuery {
  page: number;
  pageSize: number;
}

export function usePagination(defaults: PaginationQuery = { page: 1, pageSize: 25 }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [page, setPage] = useState(defaults.page);
  const [pageSize, setPageSize] = useState(defaults.pageSize);

  // sync with URL params
  useEffect(() => {
    const sp = new URLSearchParams(searchParams.toString());
    const newPage = Number(sp.get("page")) || defaults.page;
    const newPageSize = Number(sp.get("pageSize")) || defaults.pageSize;

    setPage(newPage);
    setPageSize(newPageSize);
  }, [searchParams.toString(), defaults.page, defaults.pageSize]);

  const updateURL = (newPage: number, newPageSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    params.set("pageSize", String(newPageSize));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const changePage = (newPage: number) => {
    setPage(newPage);
    updateURL(newPage, pageSize);
  };

  const changePageSize = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // reset to first page
    updateURL(1, newPageSize);
  };

  return {
    page,
    pageSize,
    setPage: changePage,
    setPageSize: changePageSize,
  };
}
