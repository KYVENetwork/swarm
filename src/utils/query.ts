import axios from "axios";
import { Knex } from "knex";
import fetch from "node-fetch";

const QUORUM = 0.5;
const NUMBER_OF_NODES_TO_SELECT = 2;
const ACCEPTANCE_THRESHOLD = 5;

const count = (array: string[]): { [item: string]: number } => {
  const counter: { [item: string]: number } = {};
  array.forEach((item) => (counter[item] = (counter[item] || 0) + 1));
  return counter;
};

export const query = async (
  connection: Knex,
  contract: string,
  height: number,
  hash: string
) => {
  console.log(`Our hash: ${hash}`);

  const internalCounts: { [item: string]: number } = {};
  let lastHash = hash;
  let counter = 0;

  // const peers = (await connection.queryBuilder().select("*").from("peers")) as {
  //   ip: string;
  // }[];
  const peers = [
    // { ip: "http://localhost:3000" },
    { ip: "http://localhost:3001" },
    { ip: "http://localhost:3002" },
    { ip: "http://localhost:3003" },
    { ip: "http://localhost:3004" },
    { ip: "http://localhost:3005" },
    { ip: "http://localhost:3006" },
    { ip: "http://localhost:3007" },
    { ip: "http://localhost:3008" },
    { ip: "http://localhost:3009" },
  ];

  let accepted = false;
  const hashes: { ip: string, hash: string }[] = [];
  while (!accepted) {
    const randomPeers = peers
      .sort(() => 0.5 - Math.random())
      .slice(0, NUMBER_OF_NODES_TO_SELECT);

    for (const peer of randomPeers) {
      console.log(`\nQuerying ${peer.ip}`);
      const { data: peerHash } = await axios.post(`${peer.ip}/gossip`, {
        type: "query",
        contract,
        height,
      });

      hashes.push({ ip: peer.ip, hash: peerHash });
      console.log(`Hash returned: ${peerHash}`);
    }

    const counts = count(hashes.map((item) => item.hash));
    for (const [peerHash, amount] of Object.entries(counts)) {
      if (amount >= QUORUM * NUMBER_OF_NODES_TO_SELECT) {
        internalCounts[peerHash] = (internalCounts[peerHash] || 0) + 1;

        if (internalCounts[peerHash] >= internalCounts[hash]) {
          hash = peerHash;

          if (hash !== lastHash) {
            lastHash = peerHash;
            counter = 0;
          } else {
            counter += 1;
            if (counter > ACCEPTANCE_THRESHOLD) accepted = true;
          }
        }
      }
    }
  }

  console.log(`\nAccepted hash: ${hash}`);
  const ip = hashes.find((item) => item.hash === hash)?.ip;
  // TODO: Query for state + validity.
};
