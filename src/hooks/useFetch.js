import { useEffect, useState } from "react";
import ApiService from "../services/Api_services";
const useFetch = (url, depens = []) => {
    const [apiData, setApiData] = useState({
        data: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        ApiService.fetchData({
                url: url,
                method: "get",
            })
            .then((res) => {
                setApiData({...apiData, data: res.data.data, loading: false });
            })
            .catch((err) => {
                setApiData({...apiData, error: err, loading: false });
            });
    }, [...depens]);

    return apiData;
};

export default useFetch;