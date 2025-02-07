export interface UserRewardStatus {
    id: string;
    progress: number;
    lastClaimTime: number;
}

export interface RewardData {
    type: 'ERC20' | 'ERC1155';
    contractAddress: string;
    tokenId: number;
    amount: number;
}