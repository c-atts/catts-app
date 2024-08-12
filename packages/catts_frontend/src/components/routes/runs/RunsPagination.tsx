import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function RunsPagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  // Helper function to generate pagination items
  const generatePaginationItems = () => {
    const pages = [];
    const pageLinksToShow = 5; // Number of page links to show around the current page
    const halfPageLinks = Math.floor(pageLinksToShow / 2);

    // Determine start and end pages
    let startPage = Math.max(currentPage - halfPageLinks, 1);
    let endPage = Math.min(currentPage + halfPageLinks, totalPages);

    // Adjust startPage and endPage if they are out of bounds
    if (currentPage - halfPageLinks <= 0) {
      endPage = Math.min(pageLinksToShow, totalPages);
    }

    if (currentPage + halfPageLinks > totalPages) {
      startPage = Math.max(totalPages - pageLinksToShow + 1, 1);
    }

    // Show the first page and ellipsis if necessary
    if (startPage > 1) {
      pages.push(
        <PaginationItem key={1}>
          <PaginationLink search={{ page: 1 }} to={`/runs`}>
            1
          </PaginationLink>
        </PaginationItem>,
      );

      if (startPage > 2) {
        pages.push(
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }
    }

    // Generate page links
    for (let page = startPage; page <= endPage; page++) {
      pages.push(
        <PaginationItem key={page}>
          <PaginationLink search={{ page }} to={`/runs`}>
            {page}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    // Show ellipsis and the last page if necessary
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }

      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink search={{ page: totalPages }} to={`/runs`}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return pages;
  };

  return (
    <div className="w-full">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              search={{ page: Math.max(currentPage - 1, 1) }}
              to="/runs"
            />
          </PaginationItem>
          {generatePaginationItems()}
          <PaginationItem>
            <PaginationNext
              search={{ page: Math.min(currentPage + 1, totalPages) }}
              to="/runs"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
