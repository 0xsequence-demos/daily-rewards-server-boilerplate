import {ethers} from "ethers";
import {Transaction} from "@0xsequence/core/src/commons/transaction";

type RequestItem = {
    isListing: boolean;
    isERC1155: boolean;
    tokenContract: string;
    tokenId: number;
    quantity: number;
    expiry: number;
    currency: string;
    pricePerToken: bigint; // Using bigint for Ether.js units
};

const createRequestBatch = async (requests: RequestItem[]) => {
    const sequenceMarketInterface = new ethers.Interface([
        "function createRequestBatch(tuple(bool isListing, bool isERC1155, address tokenContract, uint256 tokenId, uint256 quantity, uint96 expiry, address currency, uint256 pricePerToken)[]) returns (uint256 requestId)",
    ]);

    const chunkSize = 20;
    const requestChunks: Transaction[][] = [];
    requestChunks.push([]);

    let chunkIndex = 0;
    for (let i = 0; i < requests.length; i += chunkSize) {
        if (requestChunks[chunkIndex].length >= chunkSize) {
            requestChunks.push([]);
            chunkIndex++;
        }

        requestChunks[chunkIndex].push({
            to: "<marketplaceContractAddress>",
            data: sequenceMarketInterface.encodeFunctionData("createRequestBatch", [requests[i]]),
        })
    }

    for (const chunk of requestChunks) {
        try {
            const txResponse = await sequence.sendTransaction(chunk);
            console.log("Batch transaction sent:", txResponse);
        } catch (err) {
            console.error("Error in batch transaction:", err);
            throw err;
        }
    }
};