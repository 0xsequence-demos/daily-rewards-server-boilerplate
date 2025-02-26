import {AuthHandler} from "../src/authHandler";
import {MintHandler} from "../src/mintHandler";
import {getCurrentTimestamp} from "../src/timeUtils";
import {UserDb} from "../src/userDb";
import {RewardData} from "../src/rewardModel";
import {getResponse} from "../src/networkUtils";

const rewardsConfig: RewardData[] = [
    {type: 'ERC1155', contractAddress: '0xd2926e2ee243e8df781ab907b48f77ec5d7a8be1', tokenId: 3, amount: 1},
    {type: 'ERC1155', contractAddress: '0xd2926e2ee243e8df781ab907b48f77ec5d7a8be1', tokenId: 3, amount: 5},
    {type: 'ERC1155', contractAddress: '0xd2926e2ee243e8df781ab907b48f77ec5d7a8be1', tokenId: 1, amount: 1},
    {type: 'ERC1155', contractAddress: '0xd2926e2ee243e8df781ab907b48f77ec5d7a8be1', tokenId: 4, amount: 1},
    {type: 'ERC1155', contractAddress: '0xd2926e2ee243e8df781ab907b48f77ec5d7a8be1', tokenId: 2, amount: 1},
]

const timeSpan = 15;

export const onRequest: PagesFunction<Env> = async (context) => {
    try {
        let curTime = getCurrentTimestamp();
        const userDb = new UserDb();

        switch (context.request.method) {
            case "OPTIONS":
                return getResponse(JSON.stringify({
                    msg: 'Pass-through for CORS requests'
                }));
            case "GET":
                const getWalletAddress = await AuthHandler.verifyRequest(context);
                const getUserStatus = await userDb.getUserStatus(context, getWalletAddress, timeSpan);

                return getResponse(JSON.stringify({
                    timeSpan: timeSpan,
                    userStatus: getUserStatus,
                    rewards: rewardsConfig
                }));
            case "POST":
                const postWalletAddress = await AuthHandler.verifyRequest(context);
                const postUserStatus = await userDb.getUserStatus(context, postWalletAddress, timeSpan);
                const timePassed = curTime - postUserStatus.lastClaimTime;
                if (timePassed < timeSpan) {
                    throw new Error('Cannot claim reward yet.');
                }

                const reward = rewardsConfig[postUserStatus.progress];
                const minter = new MintHandler(context.env);
                await minter.mintToUser(postWalletAddress, [reward]);

                let newProgress = postUserStatus.progress + 1;
                if (newProgress >= rewardsConfig.length) {
                    newProgress = 0;
                }

                curTime = getCurrentTimestamp();
                const newUserStatus = {
                    id: postWalletAddress,
                    progress: newProgress,
                    lastClaimTime: curTime
                };

                await userDb.setUserStatus(context, newUserStatus);

                return getResponse(JSON.stringify({
                    timeSpan: timeSpan,
                    userStatus: newUserStatus,
                    rewards: rewardsConfig
                }));
            default:
                throw new Error("Unsupported request method.");
        }
    } catch (e: Error) {
        return getResponse(`${e.message} (${e.stack})`, 500);
    }
};
