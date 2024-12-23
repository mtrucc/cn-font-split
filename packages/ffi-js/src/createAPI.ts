import { api_interface } from './gen/index';
import { FontSplitProps } from './interface';
import fs from 'fs-extra';
import path from 'path';
export const createAPI = <
    OriginCB extends (buffer: any, length: number) => void,
>(
    font_split: (buffer: Uint8Array, length: number, cb: OriginCB) => void,
    createCallback: (cb: (data: Uint8Array) => void) => OriginCB,
    finallyFn?: () => void,
) => {
    return async function fontSplit(config: FontSplitProps) {
        if (typeof config.input === 'string') {
            config.input = await fs.readFile(config.input);
        }
        const input = api_interface.InputTemplate.fromObject(config as any);
        if (!input.outDir) throw new Error('cn-font-split need outDir');
        return new Promise<void>((res) => {
            const buf = input.serialize();
            const appCallback = (data: Uint8Array): void => {
                let e = api_interface.EventMessage.deserialize(data);
                switch (e.event) {
                    case api_interface.EventName.END:
                        res();
                        break;
                    case api_interface.EventName.OUTPUT_DATA:
                        console.log(e.message);
                        (config.outputFile || fs.outputFile)(
                            path.join(input.outDir, e.message),
                            e.data,
                        );
                        break;
                    default:
                        console.log(e.event);
                }
            };
            font_split(buf as any, buf.length, createCallback(appCallback));
        }).finally(() => {
            console.log('构建完成');
            finallyFn?.();
        });
    };
};
