#!/usr/bin/env python3
import argparse
import os
from .font_split import font_split, get_library_extension
import requests


def download_file(platform, version, output_dir):
    # 构造下载链接，这只是一个示例，你需要根据实际情况调整URL
    url = f"""https://github.com//KonghaYao/cn-font-split/releases/download/{
        version}/libffi-{platform}{get_library_extension()}"""

    # 解析URL获取文件名
    file_path = os.path.join(output_dir, "libffi"+get_library_extension())

    print(url)
    # 下载文件
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        with open(file_path, 'wb') as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)
        print(f"File downloaded: {file_path}")
    else:
        print(response.text)


def main():
    current_file_path = os.path.abspath(__file__)

    # 获取当前文件所在的目录
    current_dir = os.path.dirname(current_file_path)

    # 设置命令行参数解析
    parser = argparse.ArgumentParser(description='Process some integers.')
    parser.add_argument('-i', metavar='N', type=str)
    parser.add_argument('-o', metavar='N', type=str)

    parser.add_argument("--install", metavar='N', type=str)

    args = parser.parse_args()

    # print(args)
    if args.install is not None:
        p = args.install.split("@")
        return download_file(p[0], p[1], current_dir)
    # 调用函数并打印结果
    return font_split({
        "input": args.i,
        "outDir": args.o
    })


if __name__ == "__main__":
    main()
