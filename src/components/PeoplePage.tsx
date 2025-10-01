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

      <div className="columns is-multiline">
        {/* Coluna principal com a tabela */}
        <div className="column is-12-mobile is-12-tablet is-8-desktop">
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

        {/* Coluna lateral com os filtros */}
        {people && (
          <div className="column is-12-mobile is-12-tablet is-4-desktop">
            <PeopleFilters />
          </div>
        )}
      </div>
    </>
  );
};
