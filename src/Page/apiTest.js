import React, { useEffect, useState } from 'react';
import Axios from 'axios'

//https://opendata.kwater.or.kr:443/openapi-data/service/pubd/dam/sluicePresentCondition/hour/list?_type=json&damcode=2022510&stdt=2014-10-01&eddt=2014-10-03&numOfRows=10&pageNo=1&serviceKey=서비스키


// 일반 인증키  (Encoding)
// ZxrZfsn3W1SzrPkT25l4PDqkccKegvzS6SJxvHgc3yHTFm0ctdzwIZIkMgZNPwCyDoiNzAWJ4Uz%2BihCp%2BMqmHQ%3D%3D

// 일반 인증키 (Decoding)
// ZxrZfsn3W1SzrPkT25l4PDqkccKegvzS6SJxvHgc3yHTFm0ctdzwIZIkMgZNPwCyDoiNzAWJ4Uz+ihCp+MqmHQ==
// const serviceKey = "ZxrZfsn3W1SzrPkT25l4PDqkccKegvzS6SJxvHgc3yHTFm0ctdzwIZIkMgZNPwCyDoiNzAWJ4Uz%2BihCp%2BMqmHQ%3D%3D"
// const url = 'http://opendata.kwater.or.kr/openapi-data/service/pubd/dam/sluicePresentCondition/mnt/list?damcode=2403201&stdt=2021-09-02&eddt=2021-09-02&numOfRows=10&pageNo=undefined&serviceKey=ejdrD89pyah0JlAaICprH0xOAEp0tAxvExhm2p0DT5Ulq2MskjlekFH7kFIAEt6d16gjJ2scGwRSLG4Rr1HUiA=='
const url = 'http://booster-app.account7172.workers.dev/openapi-data/service/pubd/dam/sluicePresentCondition/mnt/list?damcode=2403201&stdt=2021-09-02&eddt=2021-09-02&numOfRows=10&pageNo=undefined&serviceKey=ejdrD89pyah0JlAaICprH0xOAEp0tAxvExhm2p0DT5Ulq2MskjlekFH7kFIAEt6d16gjJ2scGwRSLG4Rr1HUiA=='
export default function Main() {
    const [data, setData] = useState([])

    useEffect(() => {
        Axios.get(url).then((res) => {
            console.log(res);
            setData(res.data.response.body.items.item)
        })

        // Axios.get(`http://localhost:8000`).then((res) => {
        //     console.log(res);
        //     console.log(res.data.response.body.items.item)
        //     // setData(res.data.response.body.items.item)
        //     setData(res.data.response.body.items.item)
        // })
    }, [])


    return (
        <div>
            <h1>API TEST</h1>
            <div>
                <ul>

                    {data.map((v, i) => {
                        return <li key={i}>
                            <ul>

                                <li>"inflowqy" : {v.inflowqy}</li>
                                <li>"lowlevel" : {v.lowlevel}</li>
                                <li>"obsrdtmnt" : {v.obsrdtmnt}</li>
                                <li>"rf" : {v.rf}</li>
                                <li>"rsvwtqy" : {v.rsvwtqy}</li>
                                <li>"rsvwtrt" : {v.rsvwtrt}</li>
                                <li>"totdcwtrqy" : {v.totdcwtrqy}</li>
                            </ul>
                        </li>
                    })}
                </ul>
            </div>
        </div>
    )
}

//https://opendata.kwater.or.kr:443/openapi-data/service/pubd/dam/sluicePresentCondition/hour/list?_type=json&damcode=2022510&stdt=2014-10-01&eddt=2014-10-03&numOfRows=10&pageNo=1&serviceKey=서비스키



