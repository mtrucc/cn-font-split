export const matchPlatform = (
    platform: string,
    arch: string,
    isMusl: () => boolean,
): string => {
    const platformArchMap: { [key: string]: { [key: string]: string | null } } =
        {
            android: {
                arm64: null,
                arm: null,
            },
            win32: {
                x64: 'x86_64-pc-windows-msvc',
                arm64: 'aarch64-pc-windows-msvc',
            },
            darwin: {
                x64: 'x86_64-apple-darwin',
                arm64: 'aarch64-apple-darwin',
            },
            freebsd: {
                x64: 'x86_64-unknown-freebsd',
            },
            linux: {
                x64: isMusl() ? null : 'x86_64-unknown-linux-gnu',
                arm64: isMusl() ? null : 'aarch64-unknown-linux-gnu',
                arm: null,
                riscv64: isMusl() ? null : 'riscv64gc-unknown-linux-gnu',
                s390x: 's390x-unknown-linux-gnu',
            },
        };
    return platformArchMap?.[platform]?.[arch] ?? 'wasm32-wasip1';
};

export const getBinaryFile = async (
    platform: string,
    version: string,
    proxy = 'https://github.com',
) => {
    const fileName = getBinName(platform);
    console.log(`using gh proxy ${proxy}`);
    const binary = await fetch(
        proxy +
            `/KonghaYao/cn-font-split/releases/download/${version}/${fileName}`,
    ).then((res) => {
        if (res.ok) return res.arrayBuffer();
        throw new Error('download error');
    });
    return binary;
};

interface Release {
    id: number;
    tag: string;
    author: string;
    name: string;
    draft: boolean;
    prerelease: boolean;
    createdAt: string;
    publishedAt: string;
    markdown: string;
    html: string;
}

/** 直接拿最后一个版本的信息 */
export const getLatestVersion = async () => {
    const data: {
        release: Release;
    } = await fetch(
        `https://ungh.cc/repos/KonghaYao/cn-font-split/releases/latest`,
    ).then((res) => res.json());
    return data.release;
};
export const getVersionBinary = async (
    v = 'latest',
): Promise<Release | undefined> => {
    if (v === 'latest') return getLatestVersion();
    const versions = await getAllVersions();
    return versions.find((i: any) => i.tag === v);
};
export const getAllVersions = async (): Promise<Release[]> => {
    const { releases } = await fetch(
        'https://ungh.cc/repos/KonghaYao/cn-font-split/releases',
    ).then((res) => res.json());
    return releases;
};

export function getBinName(platform: string) {
    const ext = platform.includes('windows')
        ? 'dll'
        : platform.includes('darwin')
        ? 'dylib'
        : platform.includes('wasm')
        ? 'wasm'
        : 'so';
    const fileName = `libffi-${platform}.${ext}`;
    return fileName;
}
