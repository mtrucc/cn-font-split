import { HB } from '../../hb';
import { convert } from '../../convert/font-convert';
import { FontType } from '../../convert/detectFormat';
import { subsetFont } from '../../RunSubset/subsetFont';

/** 计算分包时，单个包内可以容纳的最大轮廓 */
export async function calcContoursBorder(
    hb: HB.Handle,
    face: HB.Face,
    targetType: FontType,
    contoursMap: Map<number, number>,
    maxSize: number,
    totalChars: Set<number>,
    buildMode?: 'stable' | 'speed',
) {
    let space = Math.floor(totalChars.size / 100);
    space = Math.max(space, 1);
    const sampleUnicode: number[] = [];
    let index = 0;
    for (const iterator of totalChars) {
        if (index % space === 0) {
            sampleUnicode.push(iterator);
        }
        index++;
    }
    const [buffer, arr] = subsetFont(face, sampleUnicode, hb, {
        threads: false,
    });
    if (!buffer) throw new Error('尝试测试分包比率时，分包失败');
    const transferred = await convert(
        new Uint8Array(buffer.buffer),
        targetType,
        undefined,
        buildMode,
    );
    const transferredLength =
        parseInt((transferred.byteLength / 20) as unknown as string) * 20;
    const totalContours: number = arr.reduce((col, cur) => {
        return col + (contoursMap.get(cur) ?? (contoursMap.get(0) as number));
    }, 0);
    const ContoursPerByte = totalContours / transferredLength;
    return maxSize * ContoursPerByte;
}
