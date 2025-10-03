import React, { useMemo, useEffect, useState } from 'react';
import { Person } from '../types/Person';
import './PeopleTable.scss';
import { SortHeader } from './SortHeader';
import {
  readSearchParamsFromHash,
  buildPeopleHashFromParams,
} from '../utils/hash';

type Props = {
  people: Person[] | null;
  loading: boolean;
  error: string | null;
  sexFilter: string | null;
  query: string;
  centuryFilters: string[];
};

function currentSelectedSlugFromHash(): string | null {
  const hash = typeof window !== 'undefined' ? window.location.hash : '';
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

function applySortExplicit(field: string) {
  const params = readSearchParamsFromHash();
  const currentField = params.get('sort');
  const currentOrder = params.get('order');

  if (currentField !== field) {
    // trocar de campo: set sort=<field> e remover order (interpreted as asc)
    params.set('sort', field);
    params.delete('order');
  } else {
    // mesmo campo
    if (!currentOrder) {
      // sem order -> definir order=desc
      params.set('order', 'desc');
    } else if (currentOrder === 'desc') {
      // order=desc -> limpar sort e order
      params.delete('sort');
      params.delete('order');
    } else {
      // caso improvável order='asc' explícito -> ir para desc
      params.set('order', 'desc');
    }
  }

  // remover resquícios de sortCycle se existirem
  params.delete('sortCycle');

  const newHash = buildPeopleHashFromParams(params);

  if (newHash !== (typeof window !== 'undefined' ? window.location.hash : '')) {
    history.replaceState(null, '', newHash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }
}

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
      const fromHash = currentSelectedSlugFromHash();

      /*console.log(
        '[HASH_CHANGE]',
        'window.location.hash=',
        typeof window !== 'undefined' ? window.location.hash : '',
        'slugFromHash=',
        fromHash,
      );*/
      setSelectedSlug(fromHash);
    };

    window.addEventListener('hashchange', onHashChange);

    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // garantia de sincronização inicial em todos os ambientes (mantém a lógica original)
  useEffect(() => {
    const slug = currentSelectedSlugFromHash();

    /*console.log(
      '[MOUNT]',
      'window.location.hash=',
      typeof window !== 'undefined' ? window.location.hash : '',
      'initialSlug=',
      slug,
    );*/
    setSelectedSlug(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // quando os dados chegam, garantir que selectedSlug reflita a URL atual (resolve timing)
  useEffect(() => {
    if (people && people.length) {
      const slugFromHash = currentSelectedSlugFromHash();

      /* console.log(
        '[PEOPLE ARRIVED]',
        'selectedSlug(before)=',
        selectedSlug,
        'slugFromHash=',
        slugFromHash,
        'peopleSlugs=',
        people.map(p => p.slug).slice(0, 20),
      );*/
      if (slugFromHash) {
        setSelectedSlug(slugFromHash);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [people]);

  // leitura de params / definição de sortField e sortOrder
  const params = readSearchParamsFromHash();
  const sortField = params.get('sort');
  const orderParam = params.get('order');
  const sortOrder: 'asc' | 'desc' | null =
    sortField && !orderParam
      ? 'asc'
      : orderParam === 'desc'
        ? 'desc'
        : orderParam === 'asc'
          ? 'asc'
          : null;

  const normalize = (s: unknown) =>
    s === null || s === undefined ? null : String(s).trim();

  /*console.log(
    '[RENDER]',
    'selectedSlug=',
    selectedSlug,
    'hash=',
    typeof window !== 'undefined' ? window.location.hash : '',
    'peopleCount=',
    people?.length ?? 0,
  );*/

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
        return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
      }

      return sortOrder === 'desc'
        ? String(bVal).localeCompare(String(aVal))
        : String(aVal).localeCompare(String(bVal));
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
          <SortHeader
            field="sex"
            label="Sex"
            sortField={sortField}
            sortOrder={sortOrder}
            applySortExplicit={applySortExplicit}
          />
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

          // comparação normalizada (não altera parsing/URL)
          const isSelected =
            normalize(selectedSlug) !== null &&
            normalize(selectedSlug) === normalize(person.slug);

          const sexRaw = (person.sex ?? '').toString().trim().toLowerCase();
          const isFemale = sexRaw.startsWith('f');
          const isMale = sexRaw.startsWith('m');

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

                    history.replaceState(null, '', newHash);
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
