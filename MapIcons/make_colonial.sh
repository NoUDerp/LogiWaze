#!/bin/bash
file="$1"
file2=$(echo "$file" | sed 's/\.webp/.png/'); file3="$(echo "$file2" | sed 's/\.png/Colonial.png/')" ; dwebp "$file" -o "$file2" && convert "$file2" -color-matrix "0.31764705882352941176470588235294 0 0 0.42352941176470588235294117647059 0 0 0.29411764705882352941176470588235 0 0" "$file3" && cwebp "$file3" -lossless -o "$(echo "$file3" | sed 's/\.png/.webp/')" && rm "$file2" && rm "$file3"
