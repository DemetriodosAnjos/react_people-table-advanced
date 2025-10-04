import React, { useEffect, useState } from 'react';
import { Loader } from './Loader/Loader';
import { PeopleTable } from './PeopleTable';
import { PeopleFilters } from './PeopleFilters';
import { Person } from '../types/Person';
import { readSearchParamsFromHash } from '../utils/hash';

type Props = {
  people: Person[] | null;
  loading: boolean;
  error: string | null;
};

export const PeoplePage: React.FC<Props> = ({ people, loading, error }) => {
  const [sexFilter, setSexFilter] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [centuryFilters, setCenturyFilters] = useState<string[]>([]);

  useEffect(() => {
    const applyParams = () => {
      const params = readSearchParamsFromHash();

      setQuery(params.get('query') ?? '');
      setSexFilter(params.get('sex'));
      setCenturyFilters(params.getAll('centuries'));
    };

    window.addEventListener('hashchange', applyParams);
    applyParams();

    return () => window.removeEventListener('hashchange', applyParams);
  }, []);

  const shouldShowNoPeopleMessage = people && people.length === 0;

  return (
    <>
      <div className="box mb-5">
        <h1 className="title is-3">People Page</h1>
      </div>

      {shouldShowNoPeopleMessage && (
        <div className="box" data-cy="noPeopleMessage">
          <div className="notification is-warning has-text-centered">
            There are no people to show.
          </div>
        </div>
      )}

      <div className="columns is-multiline">
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
                <PeopleTable
                  people={people}
                  loading={loading}
                  error={error}
                  sexFilter={sexFilter}
                  query={query}
                  centuryFilters={centuryFilters}
                />
              )
            )}
          </div>
        </div>

        {people && (
          <div className="column is-12-mobile is-12-tablet is-4-desktop">
            <PeopleFilters />
          </div>
        )}
      </div>
    </>
  );
};
