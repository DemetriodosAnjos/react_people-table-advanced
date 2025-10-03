import React, { useMemo, useEffect, useState } from 'react';
import { Person } from '../types/Person';
import './PeopleTable.scss';
import { SortHeader } from './SortHeader';

type Props = {
  people: Person[] | null;
  loading: boolean;
  error: string | null;
  sexFilter: string | null;
  query: string;
  centuryFilters: string[];
};

// 🔧 Funções utilitárias locais
function readSearchParamsFromHash(): URLSearchParams {
  try {
    const hash = window.location.hash || '';
    const idx = hash.indexOf('?');

    return new URLSearchParams(idx === -1 ? '' : hash.slice(idx));
  } catch {
    return new URLSearchParams();
  }
}

// Retorna selected do query string se presente; mantém compatibilidade com /people/:slug
function currentSelectedSlugFromHash(): string | null {
  const hash = window.location.hash || '';
  const cleanHash = hash.split('?')[0]; // remove query params
  const parts = cleanHash.split('/');

  // PRIORIZA slug em /people/<slug>
  if (parts.length > 2 && parts[1] === 'people') {
    return parts[2];
  }

  // fallback para query param selected (compatibilidade)
  const params = readSearchParamsFromHash();

  return params.get('selected');
}

function applySortExplicit(field: string, orderClicked: 'asc' | 'desc') {
  const params = readSearchParamsFromHash();
  const currentField = params.get('sort');
  const orderParam = params.get('order');
  const currentOrder =
    orderParam === 'desc' ? 'desc' : orderParam === 'asc' ? 'asc' : null;
  const currentCycle = Number(params.get('sortCycle') || '0');

  if (currentField === field && currentCycle >= 2) {
    params.delete('sort');
    params.delete('order');
    params.delete('sortCycle');
  } else if (currentField !== field) {
    params.set('sort', field);
    params.set('order', orderClicked);
    params.set('sortCycle', '1');
  } else {
    if (currentOrder === null) {
      params.set('order', orderClicked);
      params.set('sortCycle', '1');
    } else if (currentOrder !== orderClicked) {
      params.set('order', orderClicked);
      params.set('sortCycle', String(Math.min(currentCycle + 1, 2)));
    } else {
      params.set('order', orderClicked);
      params.set('sortCycle', String(Math.min(currentCycle + 1, 2)));
    }
  }

  const qs = params.toString();
  const newHash = qs ? `#/people?${qs}` : '#/people';

  if (newHash !== window.location.hash) {
    history.replaceState(null, '', newHash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }
}

// ⬇️ Componente principal
export const PeopleTable: React.FC<Props> = ({
  people,
  sexFilter,
  query,
  centuryFilters = [],
}) => {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    currentSelectedSlugFromHash(),
  );

  useEffect(() => {
    const onHashChange = () => {
      setSelectedSlug(currentSelectedSlugFromHash());
    };

    window.addEventListener('hashchange', onHashChange);

    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const params = readSearchParamsFromHash();
  const sortField = params.get('sort');
  const orderParam = params.get('order');
  const sortOrder: 'asc' | 'desc' | null =
    orderParam === 'desc' ? 'desc' : orderParam === 'asc' ? 'asc' : null;

  const filteredPeople = useMemo(() => {
    if (!people) {
      return [];
    }

    const includes = (s?: string | null) =>
      (s ?? '').toString().toLowerCase().includes(query.toLowerCase());

    const filtered = people.filter(p => {
      const matchesQuery =
        !query ||
        includes(p.name) ||
        includes(p.motherName) ||
        includes(p.fatherName);

      const sexValue = String(p.sex ?? '')
        .trim()
        .toLowerCase();
      const matchesSex =
        !sexFilter ||
        (sexFilter === 'm' && sexValue.startsWith('m')) ||
        (sexFilter === 'f' && sexValue.startsWith('f'));

      const bornCentury = Math.floor((p.born ?? 0) / 100) + 1;
      const matchesCentury =
        centuryFilters.length === 0 ||
        centuryFilters.includes(String(bornCentury));

      return matchesQuery && matchesSex && matchesCentury;
    });

    if (!sortField) {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      const getValue = (person: Person) => {
        switch (sortField) {
          case 'name':
            return person.name ?? '';
          case 'sex':
            return person.sex ?? '';
          case 'born':
            return person.born ?? 0;
          case 'died':
            return person.died ?? 0;
          case 'mother':
            return person.motherName ?? '';
          case 'father':
            return person.fatherName ?? '';
          default:
            return '';
        }
      };

      const aVal = getValue(a);
      const bVal = getValue(b);

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return sortOrder === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [people, query, sexFilter, centuryFilters, sortField, sortOrder]);

  return (
    <table
      className="table is-striped is-hoverable is-fullwidth"
      data-cy="peopleTable"
    >
      <thead>
        <tr>
          <SortHeader
            field="name"
            label="Name"
            sortField={sortField}
            sortOrder={sortOrder}
            applySortExplicit={applySortExplicit}
          />
          <th>
            <span className="is-flex is-align-items-center nowrap">Sex</span>
          </th>
          <SortHeader
            field="born"
            label="Born"
            sortField={sortField}
            sortOrder={sortOrder}
            applySortExplicit={applySortExplicit}
          />
          <SortHeader
            field="died"
            label="Died"
            sortField={sortField}
            sortOrder={sortOrder}
            applySortExplicit={applySortExplicit}
          />
          <th>
            <span className="is-flex is-align-items-center nowrap">Mother</span>
          </th>
          <th>
            <span className="is-flex is-align-items-center nowrap">Father</span>
          </th>
        </tr>
      </thead>

      <tbody>
        {filteredPeople.map((person, idx) => {
          const key = person.id ?? person.slug ?? `person-${idx}`;
          const isSelected = selectedSlug === person.slug;

          const sexRaw = (person.sex ?? '').toString().trim().toLowerCase();
          const isFemale = sexRaw.startsWith('f');
          const isMale = sexRaw.startsWith('m');

          // Nome mantém cor por sexo; quando selecionado, linha inteira recebe is-selected (fundo)
          const nameClass = isFemale
            ? 'has-text-danger'
            : isMale
              ? 'has-text-link'
              : '';

          const motherClass = isFemale ? 'has-text-danger' : '';
          const fatherClass = isMale ? 'has-text-link' : '';

          return (
            <tr
              key={key}
              data-cy="person"
              className={isSelected ? 'is-selected has-background-warning' : ''}
            >
              <td>
                <a
                  className={`is-clickable ${nameClass}`}
                  onClick={() => {
                    const hasParams = readSearchParamsFromHash();
                    const qs = hasParams.toString();
                    const newHash = qs
                      ? `#/people/${person.slug}?${qs}`
                      : `#/people/${person.slug}`;

                    // atualiza URL sem acionar o router que renderiza a outra página
                    history.replaceState(null, '', newHash);

                    // atualiza o estado local para destacar a linha imediatamente
                    setSelectedSlug(person.slug);
                  }}
                >
                  {person.name}
                </a>
              </td>
              <td>{person.sex}</td>
              <td>{person.born}</td>
              <td>{person.died}</td>
              <td className={motherClass}>{person.motherName}</td>
              <td className={fatherClass}>{person.fatherName}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default PeopleTable;
