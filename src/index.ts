import { CacheType } from './interfaces';
import { GitHubService } from './services';
import { writeCompressedFile } from './utils/helpers';

async function main() {
    const ghService = new GitHubService({ cacheType: CacheType.FILE });

    const orgInfo = await ghService.getOrgInfo('google');
    console.log(orgInfo);

    const orgRepos = await ghService.getOrgRepos('google');

    await writeCompressedFile(orgRepos, 'node_modules/.cache/test.json.gz');
}

main();
