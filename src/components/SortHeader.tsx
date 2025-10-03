import React from 'react';

type Props = {
  field: string;
  label: string;
  sortField: string | null;
  sortOrder: 'asc' | 'desc' | null;
  applySortExplicit: (field: string) => void;
};

export const SortHeader: React.FC<Props> = ({
  field,
  label,
  sortField,
  sortOrder,
  applySortExplicit,
}) => {
  const isSorted = sortField === field;
  const isAsc = isSorted && sortOrder === 'asc';
  const isDesc = isSorted && sortOrder === 'desc';

  // sempre mostrar ícones; marque ativo com classes has-sort-up/has-sort-down
  const headerClass = `is-clickable has-sort${isAsc ? ' has-sort-up' : ''}${
    isDesc ? ' has-sort-down' : ''
  }`;

  const handleKey = (e: React.KeyboardEvent, fn: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };

  return (
    <th
      className={headerClass}
      role="button"
      aria-sort={isSorted ? (isAsc ? 'ascending' : 'descending') : 'none'}
    >
      <span
        className="is-flex is-align-items-center nowrap"
        style={{ whiteSpace: 'nowrap' }}
      >
        <span style={{ margin: 0 }}>{label}</span>

        <span
          className="icon has-text-link ml-1 sort-icons-match-born"
          aria-hidden="false"
        >
          <span
            role="button"
            tabIndex={0}
            onClick={() => applySortExplicit(field)}
            onKeyDown={e => handleKey(e, () => applySortExplicit(field))}
            aria-label={`sort-${field}-asc`}
            className="sort-icon-item"
            title="Sort ascending"
          >
            <i className="fas fa-sort-up" style={{ marginLeft: -10 }} />
          </span>

          <span
            role="button"
            tabIndex={0}
            onClick={() => applySortExplicit(field)}
            onKeyDown={e => handleKey(e, () => applySortExplicit(field))}
            aria-label={`sort-${field}-desc`}
            className="sort-icon-item"
            title="Sort descending"
          >
            <i className="fas fa-sort-down" style={{ marginLeft: -10 }} />
          </span>
        </span>
      </span>
    </th>
  );
};

export default SortHeader;
