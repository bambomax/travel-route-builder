import React, { useCallback, useEffect, useState } from 'react';

import type { Country } from '../../types';
import { DRAG_TYPE_COUNTRY } from '../../constants.ts';
import styles from './Search.module.css';
import { getCountriesEndpoint } from '../../endpoints.ts';

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [filtered, setFiltered] = useState<Country[]>([]);

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
    country: Country
  ) => {
    e.dataTransfer.setData(DRAG_TYPE_COUNTRY, JSON.stringify(country));
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

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
        {filtered.slice(0, 10).map((country) => (
          <div
            key={country.name.common}
            draggable
            onDragStart={(e) => handleDragStart(e, country)}
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
            <span>{country.name.common}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;