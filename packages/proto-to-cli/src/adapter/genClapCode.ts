import protobuf from 'protobufjs';
import fs from 'fs';
import { Adapter } from '../cli.js';

/**
 * @zh 生成 clap 参数定义
 * @en Generate clap parameter definitions
 */
export const genClapCode: Adapter = (filePath: string, messageName: string) => {
    const buf = fs.readFileSync(filePath, 'utf-8');
    const proto = protobuf.parse(buf, {
        alternateCommentMode: true,
    });
    const template = proto.root.lookup(messageName)!;
    // @ts-ignore
    const { fields, nested } = template.toJSON({ keepComments: true });
    // console.log(fields);
    const importHeader = `/* automatically generated by proto-to-cli */
use clap::Parser;
#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
#[clap(name = "${messageName}")]
pub struct ${messageName} {
`;

    const shortCode = new Set();
    const params = createFlatDefine(fields).join('\n');

    function createFlatDefine(fields: any, parentKey = ''): string[] {
        return Object.entries<any>(fields).flatMap(([key, value]): string[] => {
            let isOption = value.options?.proto3_optional ?? false;
            if (parentKey) isOption = true;
            const comment = value.comment ?? '';
            const defaultValue = null;
            if (nested && Object.keys(nested).includes(value.type)) {
                // console.log(value.type);
                return createFlatDefine(
                    nested[value.type].fields,
                    key + '.',
                ) as string[];
            }

            const typeMap: any = {
                // proto 类型: Rust 类型
                bytes: 'Vec<u8>',
                string: 'String',
                int32: 'i32',
                int64: 'i64',
                uint32: 'u32',
                uint64: 'u64',
                sint32: 'i32',
                sint64: 'i64',
                fixed32: 'u32',
                fixed64: 'u64',
                sfixed32: 'i32',
                sfixed64: 'i64',
                bool: 'bool',
                float: 'f32',
                double: 'f64',
                // 对于枚举类型，可以使用自定义枚举名
                // enum: 'CustomEnum',
            };
            let placeholder = `${typeMap[value.type] ?? value.type}`;

            const longName = parentKey + key;
            let mayShortName = '';
            if (!parentKey && !shortCode.has(longName[0])) {
                mayShortName = longName[0];
                shortCode.add(longName[0]);
            }
            return [
                `    #[arg(${[
                    `long = "${longName}"`,
                    mayShortName ? `short = '${mayShortName}'` : '',
                    `help = "${comment}"`,
                    defaultValue ? `default_value = "${defaultValue}"` : '',
                ]
                    .filter(Boolean)
                    .map((i) => '\n        ' + i)
                    .join(',')}
    )]
    pub ${capitalizeAfterDot(longName)}: ${
        isOption ? `Option<${placeholder}>` : placeholder
    },\n`,
            ];
        });
    }
    return importHeader + params + `\n}`;
};
function capitalizeAfterDot(input: string): string {
    return input.replace(/(\.)([a-z])/g, (match, p1, p2) => {
        return p2.toUpperCase();
    });
}
