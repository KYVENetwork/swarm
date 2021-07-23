import ArDB from "ardb";
import { GQLEdgeTransactionInterface } from "ardb/lib/faces/gql";
import { Knex } from "knex";
import hash from "object-hash";
import { loadContract } from "smartweave";
import { ContractInteraction, execute } from "smartweave/lib/contract-step";
import { arweave } from "./extensions";

export async function readContract(
  connection: Knex,
  contract: string,
  height?: number,
  currentTx?: { txID: string; contract: string }[]
): Promise<{ height: number; hash: string; state: any; validity: any }> {
  if (!height) height = (await arweave.network.getInfo()).height;
  let minHeight = 0;

  // Fetch latest cached state.
  const cache = await connection
    .queryBuilder()
    .select("*")
    .from("contracts")
    .where("id", "=", contract)
    .where("height", "<=", height)
    .orderBy("height", "desc")
    .limit(1);
  if (cache.length) {
    // Cache found.
    if (height === cache[0].height) {
      return {
        height,
        hash: hash({
          state: JSON.parse(cache[0].state),
          validity: JSON.parse(cache[0].validity),
        }),
        state: JSON.parse(cache[0].state),
        validity: JSON.parse(cache[0].validity),
      };
    }

    minHeight = cache[0].height + 1;
  }
  // Fetch all contract interactions after last cached state.
  const gql = new ArDB(arweave);
  const res = (await gql
    .search()
    .min(minHeight)
    .max(height)
    .appName("SmartWeaveAction")
    .tag("Contract", contract)
    .sort("HEIGHT_ASC")
    .findAll()) as GQLEdgeTransactionInterface[];
  for (const entry of currentTx || []) {
    if (entry.contract === contract) {
      const index = res.findIndex((tx) => tx.node.id === entry.txID);
      if (index !== -1) {
        res.splice(index, 1);
      }
    }
  }
  // Load the contract.
  const contractInfo = await loadContract(arweave, contract);
  const { handler, swGlobal } = contractInfo;
  let state: any = cache.length
    ? JSON.parse(cache[0].state)
    : JSON.parse(
        (
          await arweave.transactions.getData(contract, {
            decode: true,
            string: true,
          })
        ).toString()
      );
  let validity: Record<string, boolean> = cache.length
    ? JSON.parse(cache[0].validity)
    : {};
  // Apply interactions to state.
  if (res.length) console.log();
  for (let i = 0; i < res.length; i++) {
    console.log(
      `Parsing interaction ${i + 1}/${res.length}\n  contract = ${contract}`
    );
    const txInfo = res[i];

    const contractIndex = txInfo.node.tags.findIndex(
      (tag) => tag.name === "Contract" && tag.value === contract
    );
    const inputTag = txInfo.node.tags[contractIndex + 1];

    const input = JSON.parse(inputTag.value);

    const interaction: ContractInteraction = {
      input,
      caller: txInfo.node.owner.address,
    };

    // @ts-ignore
    swGlobal._activeTx = txInfo.node;
    swGlobal.contracts.readContractState = async (
      contractId: string,
      height?: number,
      returnValidity?: boolean
    ) => {
      const res = await readContract(
        connection,
        contractId,
        height || swGlobal.block.height,
        [...(currentTx || []), { contract, txID: swGlobal.transaction.id }]
      );

      return returnValidity
        ? { state: res.state, validity: res.validity }
        : res.state;
    };

    const result = await execute(handler, interaction, state);

    validity[txInfo.node.id] = result.type === "ok";
    state = result.state;

    // Save state to cache.
    await connection
      .insert({
        id: contract,
        height: txInfo.node.block.height,
        hash: hash({ state, validity }),
        state: JSON.stringify(state),
        validity: JSON.stringify(validity),
      })
      .into("contracts");
  }
  if (res.length) console.log();
  await connection
    .insert({
      id: contract,
      height,
      hash: hash({ state, validity }),
      state: JSON.stringify(state),
      validity: JSON.stringify(validity),
    })
    .into("contracts");
  // Return state.
  return { height, hash: hash({ state, validity }), state, validity };
}
