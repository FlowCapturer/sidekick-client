import { getAxiosInstance } from '@/lib/axios-utils';
import type { ICountries, ICountry } from '@/lib/types';
import { getLocalStorage, setLocalStorage } from '@/lib/utils';
import { useEffect, useState } from 'react';

const useCountries = (): ICountry[] => {
  const [countries, setCountries] = useState<ICountry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const saved = getLocalStorage('countries');
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as unknown;
          if (Array.isArray(parsed)) {
            setCountries(parsed as ICountry[]);
            return;
          }
        } catch {
          // ignore parse error and fall back to network request
        }
      }

      const response = (await getAxiosInstance().get('get-countries')) as ICountries;
      const lCountries = response.countries ?? [];
      if (lCountries.length > 0) {
        setLocalStorage('countries', JSON.stringify(lCountries));
      }

      setCountries(lCountries);
    };

    fetchData();
  }, []);

  return countries;
};

export default useCountries;
