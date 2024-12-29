
import os
from ctypes import CDLL, CFUNCTYPE, c_size_t, POINTER, c_ubyte, string_at
from .gen import index_pb2
from pathlib import Path


def create_api(ctx):
    def cb(pointer, size):
        byte_data = string_at(pointer, size)
        cloned_byte_data = bytes(byte_data)
        msg = index_pb2.EventMessage()  # type: ignore
        msg.ParseFromString(cloned_byte_data)
        if msg.event == 0:
            print("构建成功")
        if msg.event == 1:
            print(msg.message)
            output_dir = Path(ctx["outDir"])
            output_dir.mkdir(parents=True, exist_ok=True)

            file_name = msg.message
            file_path = output_dir / file_name

            with open(file_path, 'wb') as file:
                file.write(msg.data)
        if msg.event == 2:
            # OUTPUTDATA
            print("hello")
    return cb


bin_path = os.getenv('CN_FONT_SPLIT_BIN')
lib = CDLL(bin_path)
callback_type = CFUNCTYPE(None, POINTER(c_ubyte), c_size_t)
lib.font_split.argtypes = [POINTER(c_ubyte), c_size_t, callback_type]
lib.font_split.restype = None


def font_split(info):
    data = None
    with open(info['input'], 'rb') as file:
        data = file.read()
    temp = index_pb2.InputTemplate(  # type: ignore
        input=data).SerializeToString()
    buffer = (c_ubyte * len(temp))(*list(temp))
    return lib.font_split(buffer, len(temp), callback_type(create_api(info)))

# font_split({
#     "input": '../demo/public/SmileySans-Oblique.ttf',
#     "outDir": "./dist"
# })
