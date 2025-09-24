"use client";

import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";


interface PaginationProps {
  meta?: { page: number; pageCount: number; pageSize: number };
  page: number;
  setPage: (page: number) => void;
}

export function Pagination({ meta, page, setPage }: any) {
  if (!meta) return null;

  const prevPage = () => setPage(Math.max(page - 1, 1));
  const nextPage = () => setPage(Math.min(page + 1, meta.pageCount));

  const goToPage = (p: number) => {
    if (p >= 1 && p <= meta.pageCount) setPage(p);
  };

  const renderPages = () => {
    const totalPages = meta.pageCount;
    const pages: (number | string)[] = [];

    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    for (let i = start; i <= end; i++) pages.push(i);

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages.map((p, idx) =>
      typeof p === "number" ? (
        <Button
          key={idx}
          variant={p === page ? "default" : "outline"}
          onClick={() => goToPage(p)}
        >
          {p}
        </Button>
      ) : (
        <span key={idx} className="px-2 text-muted-foreground">{p}</span>
      )
    );
  };

  return (
    <div className="flex items-center justify-center w-full gap-2 mt-6">
      <Button variant="outline" onClick={prevPage} disabled={page <= 1}>
        Previous
      </Button>
      {renderPages()}
      <Button variant="outline" onClick={nextPage} disabled={page >= meta.pageCount}>
        Next
      </Button>
    </div>
  );
}
