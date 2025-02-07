import {UserRewardStatus} from "./rewardModel";
import {getCurrentTimestamp} from "./timeUtils";

export class UserDb {
    async ensureTableExists(context: any): Promise<void> {
        await context.env.DB.exec(`CREATE TABLE IF NOT EXISTS users (id VARCHAR(255) PRIMARY KEY UNIQUE NOT NULL, progress INT NOT NULL, lastClaimTime INT NOT NULL);`);
    }

    async userExists(context: any, walletAddress: string): Promise<boolean> {
        const prepareUserExists = context.env.DB.prepare(`SELECT EXISTS (SELECT 1 FROM users WHERE id = '${walletAddress}') AS userExists;`);
        const userExistsResponse = await context.env.DB.batch([prepareUserExists]);
        return userExistsResponse[0].results[0].userExists > 0;
    }

    async getUserStatus(context: any, walletAddress: string, timeDelay: number): Promise<UserRewardStatus> {
        const exists = await this.userExists(context, walletAddress);
        if (!exists) {
            const newUserStatus = {
                id: walletAddress,
                progress: 0,
                lastClaimTime: 0
            };

            await this.setUserStatus(context, newUserStatus);
            return newUserStatus;
        }

        const prepareUserStatus = context.env.DB.prepare(`SELECT * FROM users WHERE id = '${walletAddress}'`);
        const userStatusResponse = await context.env.DB.batch([prepareUserStatus]);
        const userStatus = userStatusResponse[0].results[0];

        if (getCurrentTimestamp() - userStatus.lastClaimTime >= timeDelay * 2) {
            const newUserStatus = {
                id: walletAddress,
                progress: 0,
                lastClaimTime: userStatus.lastClaimTime
            };

            await this.setUserStatus(context, newUserStatus);
            return newUserStatus;
        }

        return {
            id: walletAddress,
            progress: userStatus.progress,
            lastClaimTime: userStatus.lastClaimTime
        };
    }

    async setUserStatus(context: any, status: UserRewardStatus): Promise<void> {
        await context.env.DB.exec(`INSERT OR REPLACE INTO users (id, progress, lastClaimTime) VALUES ('${status.id}', ${status.progress}, ${status.lastClaimTime})`);
    }
}