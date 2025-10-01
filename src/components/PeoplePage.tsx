import React from 'react';
import { Loader } from './Loader';
import { PeopleTable } from './PeopleTable';
import { PeopleFilters } from './PeopleFilters';
import { Person } from '../types/Person';

type Props = {
  people: Person[] | null;
  loading: boolean;
  error: string | null;
};

export const PeoplePage: React.FC<Props> = ({ people, loading, error }) => {
  return (
    <>
      <h1 className="title">People Page</h1>

      <div className="columns">
        {/* Coluna principal com a tabela */}
        <div className="column is-three-quarters">
          <div className="box table-container">
            {loading && <Loader />}

            {error ? (
              <div data-cy="peopleLoadingError" style={{ textAlign: 'center' }}>
                Something went wrong
              </div>
            ) : (
              !loading &&
              people && (
                <PeopleTable people={people} loading={loading} error={error} />
              )
            )}
          </div>
        </div>

        {/* Coluna lateral com os filtros (só aparece se people estiver carregado) */}
        {people && (
          <div className="column">
            <PeopleFilters />
          </div>
        )}
      </div>
    </>
  );
};
