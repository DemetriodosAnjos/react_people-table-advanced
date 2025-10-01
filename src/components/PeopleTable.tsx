import React, { useEffect, useMemo, useState } from 'react';
import { Person } from '../types/Person';
import './PeopleTable.scss'; // estilos: cabeçalhos pretos e links azuis com hover preto

/*
==========================================================
🔹 BLOCO FUNCTION
Objetivo: Funções auxiliares para manipular o hash da URL.
Conexões: usadas no BLOCO CONST (filtros, seleção) e no BLOCO RENDER (links e ordenação).
==========================================================
*/
function readSearchParamsFromHash(): URLSearchParams {
  try {
    const hash = window.location.hash || '#/people';
    const idx = hash.indexOf('?');
    return new URLSearchParams(idx === -1 ? '' : hash.slice(idx));
  } catch {
    return new URLSearchParams();
  }
}

function currentQueryString(): string {
  try {
    const hash = window.location.hash || '#/people';
    const idx = hash.indexOf('?');
    return idx === -1 ? '' : hash.slice(idx);
  } catch {
    return '';
  }
}

function currentSelectedSlugFromHash(): string | null {
  try {
    const hash = window.location.hash || '#/people';
    const path = hash.split('?')[0];
    const parts = path.split('/').filter(Boolean);
    const peopleIndex = parts.indexOf('people');
    if (peopleIndex !== -1 && parts.length > peopleIndex + 1) {
      return parts[peopleIndex + 1];
    }
    return null;
  } catch {
    return null;
  }
}

/*
==========================================================
🔹 BLOCO CONST
Objetivo: Estados e variáveis derivadas (filtros, ordenação, seleção).
Conexões: alimenta o BLOCO CONDIÇÕES (o que mostrar) e o BLOCO TR/TD (linhas renderizadas).
==========================================================
*/
type Props = {
  people: Person[] | null;
  loading: boolean;
  error: string | null;
};

export const PeopleTable: React.FC<Props> = ({ people, loading, error }) => {
  // re-render quando o hash muda (sincroniza com URL)
  const [, setHashState] = useState<string>(() => window.location.hash);

  useEffect(() => {
    const onHash = () => setHashState(window.location.hash);
    window.addEventListener('hashchange', onHash);
    window.addEventListener('popstate', onHash);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('popstate', onHash);
    };
  }, []);

  const params = readSearchParamsFromHash();
  const queryRaw = params.get('query') || '';
  const query = queryRaw.trim().toLowerCase();
  const sexFilter = params.get('sex');
  const centuryFilters = params.getAll('centuries');
  const selectedSlug = currentSelectedSlugFromHash();

  const filteredPeople = useMemo(() => {
    if (!people) return [];

    const includes = (s?: string | null) =>
      (s ?? '').toString().toLowerCase().includes(query);

    const filtered = people.filter(p => {
      const matchesQuery =
        !query ||
        includes(p.name) ||
        includes(p.motherName) ||
        includes(p.fatherName);

      const matchesSex = !sexFilter || String(p.sex) === sexFilter;

      const bornCentury = Math.floor((p.born ?? 0) / 100) + 1;
      const matchesCentury =
        centuryFilters.length === 0 ||
        centuryFilters.includes(String(bornCentury));

      return matchesQuery && matchesSex && matchesCentury;
    });

    const sortField = params.get('sort');
    const sortOrder = params.get('order') === 'desc' ? 'desc' : 'asc';

    if (!sortField) return filtered;

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
  }, [people, query, sexFilter, centuryFilters, params]);

  /*
==========================================================
🔹 BLOCO CONDIÇÕES
Objetivo: Renderizar mensagens de carregamento, erro ou ausência de dados.
Conexões: evita que o BLOCO RENDER tente desenhar a tabela sem dados.
==========================================================
*/
  if (loading) {
    return (
      <div data-cy="peopleLoading" style={{ textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div data-cy="peopleLoadingError" style={{ textAlign: 'center' }}>
        Something went wrong
      </div>
    );
  }

  if (!people) {
    return null;
  }

  /*
==========================================================
🔹 BLOCO RENDER
Objetivo: Estrutura da tabela (<table>, <thead>, <tbody>).
Conexões: usa o BLOCO CONST para filtros/ordenadores e o BLOCO TR/TD para linhas.
==========================================================
*/
  const renderHeader = (label: string, field: string) => (
    <th>
      <button
        className="is-flex is-flex-wrap-nowrap button is-white p-0"
        onClick={() => {
          const currentSort = params.get('sort');
          const currentOrder = params.get('order');
          const newParams = readSearchParamsFromHash();

          // 1º clique: sort asc; 2º clique: desc; 3º clique: remove sort/order
          if (currentSort !== field) {
            newParams.set('sort', field);
            newParams.delete('order');
          } else if (!currentOrder) {
            newParams.set('sort', field);
            newParams.set('order', 'desc');
          } else {
            newParams.delete('sort');
            newParams.delete('order');
          }

          const newHash = `#/people?${newParams.toString()}`;
          history.replaceState(null, '', newHash);
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}
        aria-label={`Sort by ${label}`}
        data-cy={`sort-${field}`}
      >
        {/* Cabeçalho: preto fixo (sem hover) */}
        <span className="mr-2 has-text-weight-bold">{label}</span>

        {/* Ícone de ordenação: pode ficar azul para contraste */}
        <span className="icon has-text-link">
          {params.get('sort') === field ? (
            params.get('order') === 'desc' ? (
              <i className="fas fa-sort-down" />
            ) : (
              <i className="fas fa-sort-up" />
            )
          ) : (
            <i className="fas fa-sort" />
          )}
        </span>
      </button>
    </th>
  );

  return (
    <table
      data-cy="peopleTable"
      className="table is-striped is-hoverable is-narrow is-fullwidth"
    >
      <thead>
        <tr>
          {renderHeader('Name', 'name')}
          {renderHeader('Sex', 'sex')}
          {renderHeader('Born', 'born')}
          {renderHeader('Died', 'died')}
          {renderHeader('Mother', 'mother')}
          {renderHeader('Father', 'father')}
        </tr>
      </thead>

      <tbody data-cy="peopleTableBody" role="rowgroup">
        {filteredPeople.length === 0 ? (
          <tr data-cy="noPeopleMessage">
            <td colSpan={6} className="has-text-centered">
              No people found
            </td>
          </tr>
        ) : (
          filteredPeople.map(p => {
            const sexValue = String(p.sex ?? '')
              .trim()
              .toLowerCase();
            const isFemale = sexValue === 'female' || sexValue === 'f';
            const isMale = sexValue === 'male' || sexValue === 'm';
            const isSelected = selectedSlug === p.slug;

            /*
            ==========================================================
            🔹 BLOCO TR/TD
            Objetivo: Renderizar cada linha com dados da pessoa.
            Conexões: usa BLOCO CONST (filtros, seleção) e BLOCO FUNCTION (query string).
            ==========================================================
            */
            return (
              <tr
                key={p.slug}
                data-cy="person"
                data-cy-row={`person-row-${p.slug}`}
                role="row"
                className={isSelected ? 'has-background-warning' : undefined}
              >
                <td>
                  <a
                    href={`#/people/${p.slug}${currentQueryString()}`}
                    className={`is-clickable ${isFemale ? 'has-text-danger' : isMale ? 'has-text-link' : ''}`}
                  >
                    {p.name ?? '-'}
                  </a>
                </td>
                <td>{p.sex ?? '-'}</td>
                <td>{p.born ?? '-'}</td>
                <td>{p.died ?? '-'}</td>
                {/* Mother */}
                <td>
                  {p.mother ? (
                    <a
                      href={`#/people/${p.mother.slug}${currentQueryString()}`}
                      className="is-clickable has-text-danger"
                    >
                      {p.mother.name}
                    </a>
                  ) : (
                    <span className="has-text-danger">
                      {p.motherName ?? '-'}
                    </span>
                  )}
                </td>

                {/* Father */}
                <td>
                  {p.father ? (
                    <a
                      href={`#/people/${p.father.slug}${currentQueryString()}`}
                      className="is-clickable has-text-link"
                    >
                      {p.father.name}
                    </a>
                  ) : (
                    <span className="has-text-link">{p.fatherName ?? '-'}</span>
                  )}
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
};
