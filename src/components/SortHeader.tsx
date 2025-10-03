// SortHeader.tsx
import React from 'react';

type Props = {
  field: string;
  label: string;
  sortField: string | null;
  sortOrder: 'asc' | 'desc' | null;
  applySortExplicit: (field: string, order: 'asc' | 'desc') => void;
};

export const SortHeader: React.FC<Props> = ({
  field,
  label,
  sortField,
  sortOrder,
  applySortExplicit,
}) => {
  const showUp = sortField !== field || sortOrder === 'desc';
  const showDown = sortField !== field || sortOrder === 'asc';

  return (
    <th>
      <span
        className="is-flex is-align-items-center nowrap"
        style={{ whiteSpace: 'nowrap' }}
      >
        <span style={{ margin: 0 }}>{label}</span>

        <span
          className="icon has-text-link ml-1 sort-icons-match-born"
          aria-hidden="false"
        >
          {showUp && (
            <span
              role="button"
              tabIndex={0}
              onClick={() => applySortExplicit(field, 'asc')}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  applySortExplicit(field, 'asc');
                }
              }}
              aria-label={`sort-${field}-asc`}
              className="sort-icon-item"
            >
              <i className="fas fa-sort-up" style={{ marginLeft: -10 }} />
            </span>
          )}

          {showDown && (
            <span
              role="button"
              tabIndex={0}
              onClick={() => applySortExplicit(field, 'desc')}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  applySortExplicit(field, 'desc');
                }
              }}
              aria-label={`sort-${field}-desc`}
              className="sort-icon-item"
            >
              <i className="fas fa-sort-down" style={{ marginLeft: -10 }} />
            </span>
          )}
        </span>
      </span>
    </th>
  );
};

export default SortHeader;
