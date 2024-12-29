#!/usr/bin/env python3
import argparse
from .font_split import font_split


def main():
    # 设置命令行参数解析
    parser = argparse.ArgumentParser(description='Process some integers.')
    parser.add_argument('-i', metavar='N', type=str)
    parser.add_argument('-o', metavar='N', type=str)

    args = parser.parse_args()

    # 调用函数并打印结果
    return font_split({
        "input": args.i,
        "outDir": args.o
    })


if __name__ == "__main__":
    main()
