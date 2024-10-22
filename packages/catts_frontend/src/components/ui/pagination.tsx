/* eslint-disable react/prop-types */
import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";
import { createLink, LinkComponent } from '@tanstack/react-router'

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    role="navigation"
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    className={cn("flex flex-row items-center gap-1", className)}
    ref={ref}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li className={cn("", className)} ref={ref} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  className?: string;
  isActive?: boolean;
  children: React.ReactNode;
} & Pick<ButtonProps, "size">;


const _PaginationLinkTemplate = React.forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  ({ isActive, className, size = "icon", ...props }: PaginationLinkProps, ref) => {
    return (
      <a aria-current={isActive ? "page" : undefined}
        className={cn(
          buttonVariants({
            variant: isActive ? "outline" : "ghost",
            size,
          }),
          className,
        )}
        ref={ref}
        {...props} />
    )
  },
)
_PaginationLinkTemplate.displayName = "PaginationLink";

const PaginationLinkTemplate = createLink(_PaginationLinkTemplate)

const PaginationLink: LinkComponent<typeof _PaginationLinkTemplate> = (props) => {
  return <PaginationLinkTemplate aria-label="Go to previous page"
    preload={'intent'}
    size="default"
    {...props}>
    {props.children}
  </PaginationLinkTemplate>
}

const PaginationPrevious: LinkComponent<typeof _PaginationLinkTemplate> = (props) => {
  return <PaginationLinkTemplate aria-label="Go to previous page"
    className={cn("gap-1 pl-2.5", props.className)}
    preload={'intent'}
    size="default"
    {...props}>
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLinkTemplate>
}

const PaginationNext: LinkComponent<typeof _PaginationLinkTemplate> = (props) => {
  return <PaginationLinkTemplate aria-label="Go to next page"
    className={cn("gap-1 pr-2.5", props.className)}
    preload={'intent'}
    size="default"
    {...props}>
    <ChevronRight className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLinkTemplate>
}

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
