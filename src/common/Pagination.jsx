import React from "react";
import { Pagination, Form, Row, Col } from "react-bootstrap";

/**
 * Reusable Bootstrap pagination bar
 * Props:
 *  - total: total item count
 *  - page: current page (1-based)
 *  - pageSize: items per page
 *  - onChange: fn(newPage)
 *  - onPageSizeChange: optional fn(newSize)
 *  - pageSizes: optional array of sizes (default [8, 12, 16, 24])
 *  - siblingCount: pages to show on each side of current (default 1)
 *  - boundaryCount: pages to show at start/end (default 1)
 *  - className: optional wrapper class
 */
const PaginationBar = ({
  total = 0,
  page = 1,
  pageSize = 12,
  onChange,
  onPageSizeChange,
  pageSizes = [8, 12, 16, 24],
  siblingCount = 1,
  boundaryCount = 1,
  className = "",
  compact = false, // render only the pager, centered
  align = "end", // start | center | end
}) => {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 1)));
  const current = Math.min(Math.max(1, page), totalPages);

  const clamp = (n) => Math.min(Math.max(1, n), totalPages);

  function range(start, end) {
    const out = [];
    for (let i = start; i <= end; i++) out.push(i);
    return out;
  }

  const createPageList = (totalPages, page, siblingCount, boundaryCount) => {
    const pages = [];
    const startPages = range(1, Math.min(boundaryCount, totalPages));
    const endPages = range(
      Math.max(totalPages - boundaryCount + 1, boundaryCount + 1),
      totalPages
    );

    const leftSibling = Math.max(page - siblingCount, boundaryCount + 1);
    const rightSibling = Math.min(page + siblingCount, totalPages - boundaryCount);

    const showLeftDots = leftSibling > boundaryCount + 2;
    const showRightDots = rightSibling < totalPages - boundaryCount - 1;

    pages.push(...startPages);

    if (showLeftDots) pages.push("dots-left");
    pages.push(...range(leftSibling, rightSibling));
    if (showRightDots) pages.push("dots-right");

    pages.push(...endPages);

    const uniq = [];
    const set = new Set();
    for (const p of pages) {
      if (typeof p === "string") {
        uniq.push(p);
      } else if (!set.has(p)) {
        set.add(p);
        uniq.push(p);
      }
    }
    return uniq;
  };

  const pageList = createPageList(totalPages, current, siblingCount, boundaryCount);
  const go = (p) => onChange && onChange(clamp(p));
  const alignClass = `justify-content-${align}`;

  if (compact) {
    return (
      <Row className={className}>
        <Col className={`d-flex ${alignClass}`}>
          <Pagination className="mb-0">
            <Pagination.First disabled={current === 1} onClick={() => go(1)} />
            <Pagination.Prev disabled={current === 1} onClick={() => go(current - 1)} />

            {pageList.map((p, idx) => {
              if (typeof p === "string") {
                return <Pagination.Ellipsis key={`${p}-${idx}`} disabled />;
              }
              return (
                <Pagination.Item key={p} active={p === current} onClick={() => go(p)}>
                  {p}
                </Pagination.Item>
              );
            })}

            <Pagination.Next disabled={current === totalPages} onClick={() => go(current + 1)} />
            <Pagination.Last disabled={current === totalPages} onClick={() => go(totalPages)} />
          </Pagination>
        </Col>
      </Row>
    );
  }

  return (
    <Row className={className}>
      <Col xs="auto" className="d-flex align-items-center mb-2 mb-md-0">
        {onPageSizeChange && (
          <Form.Select
            size="sm"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Items per page"
            className="me-2"
          >
            {pageSizes.map((s) => (
              <option key={s} value={s}>{s} / page</option>
            ))}
          </Form.Select>
        )}
        <span className="text-muted small">
          Showing {(Math.min(total, (current - 1) * pageSize + pageSize)) || 0} of {total}
        </span>
      </Col>
      <Col className={`d-flex ${alignClass}`}>
        <Pagination className="mb-0">
          <Pagination.First disabled={current === 1} onClick={() => go(1)} />
          <Pagination.Prev disabled={current === 1} onClick={() => go(current - 1)} />

          {pageList.map((p, idx) => {
            if (typeof p === "string") {
              return <Pagination.Ellipsis key={`${p}-${idx}`} disabled />;
            }
            return (
              <Pagination.Item key={p} active={p === current} onClick={() => go(p)}>
                {p}
              </Pagination.Item>
            );
          })}

          <Pagination.Next disabled={current === totalPages} onClick={() => go(current + 1)} />
          <Pagination.Last disabled={current === totalPages} onClick={() => go(totalPages)} />
        </Pagination>
      </Col>
    </Row>
  );
};

export default PaginationBar;
