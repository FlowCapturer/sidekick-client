import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { createIndexedArray } from "@/lib/utils";
import React, { useMemo } from "react";

interface PaginationWrapperProps {
  totalCount: number;
  activePage: number;
  pageSize: number;
  onPageChange: (pageNo: number) => void;
}

const PaginationWrapper = ({
  totalCount,
  activePage,
  pageSize,
  onPageChange,
}: PaginationWrapperProps) => {
  const totalPages = useMemo(
    () => Math.ceil(totalCount / pageSize),
    [totalCount, pageSize]
  );

  const handleOnPageChange = (newPageNo: number) => {
    if (newPageNo < 0 || newPageNo >= totalPages) return;
    onPageChange(newPageNo);
  };

  const disabledCls = "opacity-50 cursor-not-allowed";

  const paginationArr = createIndexedArray(totalPages).filter(
    (pageNo) =>
      (pageNo < activePage + 3 && pageNo > activePage - 3) ||
      pageNo === 0 ||
      pageNo === totalPages - 1
  );

  return (
    <Pagination className="text-secondary-foreground">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            className={activePage === 0 ? disabledCls : ""}
            onClick={() => handleOnPageChange(activePage - 1)}
          />
        </PaginationItem>

        {paginationArr.map((pageNo, index) => {
          //checking if all consecutive numbers are there, if not then adding ellipse.

          let ellipse = null;
          if (index > 0 && pageNo - paginationArr[index - 1] !== 1) {
            ellipse = (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }
          return (
            <React.Fragment key={pageNo}>
              {ellipse}
              <PaginationItem
                className={
                  activePage === pageNo
                    ? "bg-primary text-primary-foreground rounded-2xl hover:bg-primary"
                    : ""
                }
              >
                <PaginationLink onClick={() => handleOnPageChange(pageNo)}>
                  {pageNo + 1}
                </PaginationLink>
              </PaginationItem>
            </React.Fragment>
          );
        })}

        <PaginationItem>
          <PaginationNext
            className={activePage === totalPages - 1 ? disabledCls : ""}
            onClick={() => handleOnPageChange(activePage + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationWrapper;
