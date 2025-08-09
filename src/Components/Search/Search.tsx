import React, { useCallback, useEffect, useState } from 'react';

import type { Country, NodeData, NodeType } from '../../types';
import { NODE_TYPE_COUNTRY } from '../../constants';
import styles from './Search.module.css';
import { getCountriesEndpoint } from '../../endpoints';
import { useDnDContext } from '../../hooks/useDnDContext'

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [filtered, setFiltered] = useState<Country[]>([]);
  const { setNodeType } = useDnDContext();

  const fetchCountries = async (): Promise<Country[]> => {
    const endpoint = getCountriesEndpoint(['name', 'flags']);
    const response = await fetch(endpoint);
    const data: Country[] = await response.json();

    return data;
  };

  useEffect(() => {
    fetchCountries().then(setCountries);
  }, []);

  useEffect(() => {
    if (!query) {
      setFiltered([]);
      return;
    }

    setFiltered(
      countries.filter((c) =>
        c.name.common.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [query, countries]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value), []);

  const handleDragStart = useCallback((
    e: React.DragEvent<HTMLDivElement>,
    nodeType: NodeType,
    data: NodeData,
  ) => {
    setNodeType(nodeType);
    e.dataTransfer.setData(nodeType, JSON.stringify(data));
    e.dataTransfer.effectAllowed = 'copy';
  }, [setNodeType]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setFiltered([]);
  }, []);

  return (
    <div className={styles.wrapper}>
      <input
        type="text"
        placeholder="Search countries…"
        value={query}
        onChange={handleChange}
        className={styles.searchInput}
      />
      <div>
        {filtered.slice(0, 10).map((country, idx) => (
          <div
            key={`${country.name.common}__${idx}`}
            draggable
            onDragStart={(e) => handleDragStart(e, NODE_TYPE_COUNTRY, country)}
            onDragEnd={clearSearch}
            className={styles.option}
          >
            {country.flags?.svg && (
              <img
                src={country.flags.svg}
                alt={country.flags.alt}
                className={styles.flag}
              />
            )}
            <span className={styles.countryName}>{country.name.common}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;