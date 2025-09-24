"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export interface PaginationQuery {
  page: number;
  pageSize: number;
}

export function usePagination(
  defaults: PaginationQuery = { page: 1, pageSize: 25 }
) {
  const router = useRouter();
  const pathname = usePathname();

  const [page, setPage] = useState(defaults.page);
  const [pageSize, setPageSize] = useState(defaults.pageSize);

  // initialize from URL on first render
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);

    const newPage = Number(sp.get("page")) || defaults.page;
    const newPageSize = Number(sp.get("pageSize")) || defaults.pageSize;

    setPage(newPage);
    setPageSize(newPageSize);
  }, [defaults.page, defaults.pageSize]);

  const updateURL = (newPage: number, newPageSize: number) => {
    const params = new URLSearchParams(window.location.search);
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
