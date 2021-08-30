import React, { useEffect } from 'react';
import { create } from 'ipfs-http-client'

export default function Main() {


    useEffect(() => {
        // console.log(aaa)
        // value="/ip4/127.0.0.1/tcp/5001"

        PubSubInit();
    }, [])

    async function PubSubInit() {
        let url = "/ip4/127.0.0.1/tcp/5001"
        let ipfs = create(url)
        const { id, agentVersion } = await ipfs.id()
        let peerId = id
        console.log(`<span class="green">Success!</span>`)
        console.log(`Version ${agentVersion}`)
        console.log(`Peer ID ${id}`)
    }

    return (
        <div>
            <h1>IPFS PubSub Test</h1>
        </div>
    )
}