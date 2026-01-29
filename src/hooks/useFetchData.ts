import { getAxiosInstance } from '@/lib/axios-utils';
import { useEffect, useState } from 'react';

const useFetchData = <T>(url: string) => {
  const [response, setResponse] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const lResponse = await getAxiosInstance().get(url);
        setResponse(lResponse as unknown as T);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { loading, response };
};

export default useFetchData;
