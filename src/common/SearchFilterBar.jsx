import React from "react";
import { Row, Col, Form, InputGroup } from "react-bootstrap";

/**
 * Reusable search + filter bar using Bootstrap
 * Props:
 * - query: current search text
 * - onQueryChange: fn(text)
 * - placeholder: optional placeholder
 * - rarity: current rarity value (string)
 * - onRarityChange: fn(value)
 * - rarityOptions: array of { value, label } (defaults provided)
 * - sort: current sort value
 * - onSortChange: fn(value)
 * - sortOptions: array of { value, label } (defaults provided)
 * - showRarity: boolean (default true)
 * - showSort: boolean (default true)
 * - className: additional class for Row wrapper
 */
const DEFAULT_RARITIES = [
  { value: "All", label: "Tất cả độ hiếm" },
  { value: "Common", label: "Common" },
  { value: "Uncommon", label: "Uncommon" },
  { value: "Rare", label: "Rare" },
  { value: "Epic", label: "Epic" },
  { value: "Legendary", label: "Legendary" },
];

const DEFAULT_SORTS = [
  { value: "price-asc", label: "Giá tăng dần" },
  { value: "price-desc", label: "Giá giảm dần" },
  { value: "name-asc", label: "Tên A → Z" },
  { value: "name-desc", label: "Tên Z → A" },
];

const SearchFilterBar = ({
  query,
  onQueryChange,
  placeholder = "Tìm kiếm: tên, loại, ...",
  rarity,
  onRarityChange,
  rarityOptions = DEFAULT_RARITIES,
  sort,
  onSortChange,
  sortOptions = DEFAULT_SORTS,
  showRarity = true,
  showSort = true,
  className = "",
}) => {
  return (
    <Row className={`gy-3 gx-3 align-items-center ${className}`}>
      <Col xs={12} md={6} lg={6}>
        <InputGroup>
          <Form.Control
            placeholder={placeholder}
            value={query || ""}
            onChange={(e) => onQueryChange && onQueryChange(e.target.value)}
          />
        </InputGroup>
      </Col>
      {showRarity && (
        <Col xs={6} md={3} lg={3}>
          <Form.Select value={rarity} onChange={(e) => onRarityChange && onRarityChange(e.target.value)}>
            {rarityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Form.Select>
        </Col>
      )}
      {showSort && (
        <Col xs={6} md={3} lg={3}>
          <Form.Select value={sort} onChange={(e) => onSortChange && onSortChange(e.target.value)}>
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Form.Select>
        </Col>
      )}
    </Row>
  );
};

export default SearchFilterBar;
