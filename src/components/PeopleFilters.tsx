// 📦 Imports principais
import React, { useEffect, useMemo, useState } from 'react';

// 🔗 Constante base do hash
const HASH_BASE = '#/people';

// 🧩 Bloco utilitário: leitura dos parâmetros da URL
function readSearchParamsFromHash(): URLSearchParams {
  try {
    const hash = window.location.hash || HASH_BASE;
    const idx = hash.indexOf('?');

    return new URLSearchParams(idx === -1 ? '' : hash.slice(idx));
  } catch {
    return new URLSearchParams();
  }
}

// 🧩 Bloco utilitário: construção do hash atualizado
function buildHash(params: URLSearchParams) {
  const qs = params.toString();

  return qs ? `${HASH_BASE}?${qs}` : HASH_BASE;
}

// 🎛️ Componente principal: PeopleFilters
export const PeopleFilters: React.FC = () => {
  // 🔧 Estados locais
  const [query, setQuery] = useState<string>(
    () => readSearchParamsFromHash().get('query') ?? '',
  );
  const [sex, setSex] = useState<string | null>(() =>
    readSearchParamsFromHash().get('sex'),
  );
  const [centuries, setCenturies] = useState<string[]>(() =>
    readSearchParamsFromHash().getAll('centuries'),
  );

  // 🔄 Bloco efeito: sincroniza estados quando o hash muda
  useEffect(() => {
    const onHashChange = () => {
      const params = readSearchParamsFromHash();

      setQuery(params.get('query') ?? '');
      setSex(params.get('sex'));
      setCenturies(params.getAll('centuries'));
    };

    window.addEventListener('hashchange', onHashChange);
    onHashChange(); // inicializa

    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // 🔄 Bloco efeito: atualiza o hash quando estados mudam
  useEffect(() => {
    const params = readSearchParamsFromHash();

    if (query.trim() === '') {
      params.delete('query');
    } else {
      params.set('query', query.trim());
    }

    if (sex == null) {
      params.delete('sex');
    } else {
      params.set('sex', sex);
    }

    params.delete('centuries');
    centuries.forEach(c => params.append('centuries', c));

    const newHash = buildHash(params);

    if (newHash !== window.location.hash) {
      history.replaceState(null, '', newHash);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
  }, [query, sex, centuries]);

  // 🧩 Bloco helper: alternar século
  const toggleCentury = (c: string) => {
    setCenturies(prev => {
      const exists = prev.includes(c);

      return exists ? prev.filter(p => p !== c) : [...prev, c];
    });
  };

  // 🧩 Bloco helper: resetar filtros
  const resetAll = () => {
    setQuery('');
    setSex(null);
    setCenturies([]);
  };

  // 🧩 Bloco helper: set de séculos selecionados
  const centurySet = useMemo(() => new Set(centuries), [centuries]);

  // 🧩 Bloco helper: gera href preservando parâmetros
  const hrefWith = (changes: (p: URLSearchParams) => void) => {
    const p = readSearchParamsFromHash();

    changes(p);

    return buildHash(p);
  };

  // 🎨 Bloco render: JSX do painel de filtros
  return (
    <nav className="panel">
      {/* Cabeçalho */}
      <p className="panel-heading">Filters</p>

      {/* Filtro por sexo */}
      <p className="panel-tabs" data-cy="SexFilter">
        <a
          className={!sex ? 'is-active' : ''}
          href={hrefWith(p => p.delete('sex'))}
          onClick={e => {
            e.preventDefault();
            setSex(null);
          }}
        >
          All
        </a>
        <a
          className={sex === 'm' ? 'is-active' : ''}
          href={hrefWith(p => p.set('sex', 'm'))}
          onClick={e => {
            e.preventDefault();
            setSex('m');
          }}
        >
          Male
        </a>
        <a
          className={sex === 'f' ? 'is-active' : ''}
          href={hrefWith(p => p.set('sex', 'f'))}
          onClick={e => {
            e.preventDefault();
            setSex('f');
          }}
        >
          Female
        </a>
      </p>

      {/* Campo de busca */}
      <div className="panel-block">
        <p className="control has-icons-left">
          <input
            data-cy="NameFilter"
            type="search"
            className="input"
            placeholder="Search"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <span className="icon is-left">
            <i className="fas fa-search" aria-hidden="true" />
          </span>
        </p>
      </div>

      {/* Filtro por séculos */}
      <div className="panel-block">
        <div className="level is-flex-grow-1 is-mobile" data-cy="CenturyFilter">
          <div className="level-left">
            {['16', '17', '18', '19', '20'].map(c => (
              <a
                key={c}
                data-cy="century"
                className={`button mr-1 ${centurySet.has(c) ? 'is-info' : ''}`}
                href={hrefWith(p => {
                  const current = p.getAll('centuries');
                  const willSelect = !current.includes(c);

                  p.delete('centuries');
                  if (willSelect) {
                    p.append('centuries', c);
                    current
                      .filter(x => x !== c)
                      .forEach(x => p.append('centuries', x));
                  } else {
                    current
                      .filter(x => x !== c)
                      .forEach(x => p.append('centuries', x));
                  }
                })}
                onClick={e => {
                  e.preventDefault();
                  toggleCentury(c);
                }}
              >
                {c}
              </a>
            ))}
          </div>

          {/* Botão All */}
          <div className="level-right ml-1">
            <a
              data-cy="centuryALL"
              className="button is-success no-hover"
              href={hrefWith(p => p.delete('centuries'))}
              onClick={e => {
                e.preventDefault();
                setCenturies([]);
              }}
            >
              All
            </a>
          </div>
        </div>
      </div>

      {/* Reset geral */}
      <div className="panel-block">
        <a
          className="button is-link is-outlined is-fullwidth"
          href={HASH_BASE}
          onClick={e => {
            e.preventDefault();
            resetAll();
          }}
        >
          Reset all filters
        </a>
      </div>
    </nav>
  );
};
