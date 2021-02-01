import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export function useSearchParams(): URLSearchParams {

    const location = useLocation();

    const [searchParams, setSearchParams] = useState<URLSearchParams>(new URLSearchParams());

    useEffect(() => {

        setSearchParams(new URLSearchParams(location.search));
    }, [location.search]);

    return searchParams;
}
