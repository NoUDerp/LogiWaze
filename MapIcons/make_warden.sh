#!/bin/bash
file="$1"
file2=$(echo "$file" | sed 's/\.webp/.png/'); file3="$(echo "$file2" | sed 's/\.png/Warden.png/')" ; dwebp "$file" -o "$file2" && convert "$file2" -color-matrix "0.14117647058823529411764705882353 0 0 0.33725490196078431372549019607843 0 0 0.50980392156862745098039215686275 0 0" "$file3" && cwebp "$file3" -lossless -o "$(echo "$file3" | sed 's/\.png/.webp/')" && rm "$file2" && rm "$file3"
