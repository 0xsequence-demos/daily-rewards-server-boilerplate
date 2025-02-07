# Daily Rewards Server Boilerplate

## Rough Guide:
- Create the token contracts on `Sequence's Builder`
- Define your rewards inside `dailyRewards.ts`
- Duplicate `example.wrangler.toml` and name it `wrangler.toml`
- Create DB: `pnpm wrangler d1 create <NAME>`
- Put `uuid` and `name` inside `wrangler.toml` from: `pnpm wrangler d1 list`
- Deploy updates: `pnpm wrangler pages deploy`
- Put the API url inside the Daily Rewards prefab in Unity
