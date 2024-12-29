# npm i -g protoc-gen-ts
OUT_DIR="./cn_font_split/gen"
if [ ! -d "./cn_font_split/gen" ]; then
  mkdir ./cn_font_split/gen
fi
protoc \
    --python_out="${OUT_DIR}" \
    --proto_path="../../crates/proto/src/" \
    index.proto
protoc \
    --python_out="${OUT_DIR}" \
    --proto_path="../../crates/proto/src/" \
    services.proto

echo "from . import *" > "${OUT_DIR}/__init__.py"