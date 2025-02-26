import { ethers } from 'ethers'
import { Session } from '@0xsequence/auth'
import { findSupportedNetwork, NetworkConfig } from '@0xsequence/network'
import {AccountSigner} from "@0xsequence/account/src/signer";
import {Transaction} from "@0xsequence/core/src/commons/transaction";
import {RewardData} from "./rewardModel";

export class MintHandler {
    env: any;

    constructor(env: any) {
        this.env = env;
    }

    // Use Sequence's Transaction Batching to give players multiple rewards at once
    async mintToUser(walletAddress: string, rewards: RewardData[]): Promise<void> {
        try {
            if (rewards.length === 0) {
                throw new Error('Nothing to mint, rewards length is 0');
            }

            const signer = await this.getSigner();
            const collectibleInterface = new ethers.Interface([
                'function mint(address to, uint256 tokenId, uint256 amount, bytes data)'
            ]);

            const transactions: Transaction[] = [];
            for (const reward of rewards) {
                transactions.push({
                    to: reward.contractAddress,
                    data: collectibleInterface.encodeFunctionData(
                        'mint', [`${walletAddress}`, String(reward.tokenId), String(reward.amount), String("0x00")]
                    )
                });
            }

            await signer.sendTransaction(transactions);
        } catch (e) {
            throw new Error(`${JSON.stringify(e)}`);
        }
    }

    async getSigner(): Promise<AccountSigner> {
        try {
            const chain: string = this.env.chain!;
            const privateKey: string = this.env.evm_private_key!;
            const projectKey: string = this.env.project_access_key!;

            const chainConfig: NetworkConfig = findSupportedNetwork(chain);
            const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);
            const walletEOA = new ethers.Wallet(privateKey, provider);

            const session = await Session.singleSigner({
                signer: walletEOA,
                projectAccessKey: projectKey
            });

            return session.account.getSigner(chainConfig.chainId);
        } catch (e) {
            throw new Error(e.message);
        }
    }
}
