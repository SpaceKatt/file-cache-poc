import { CacheType } from './interfaces';
import { GitHubService } from './services';

async function main() {
    const ghService = new GitHubService({ cacheType: CacheType.FILE });

    const orgInfo = await ghService.getOrgInfo('google');
    console.log(orgInfo);
}

main();
