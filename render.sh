#!/bin/bash

# build the PNG files
counter=0
width=2384	
height=2384
renderers=8
rate=12
c=0

for f in $(ls -1 "$1" | grep -A99999999 "$2" | grep -B99999999 "$3" | grep ".json.brotli"); do
	d=$((c % rate))
	if [ "$d" -eq "0" ]; then
		if [ "$renderers" -eq "0" ]; then
			wait
			renderers=8
		fi
		renderers=$((renderers - 1))
		echo "./render.js -i \"$1$f\" -w \"$width\" -h \"$height\" -o \"$1$(printf "%04d" $counter).png\""
		counter=$((counter + 1))
	fi
	c=$((c + 1))
done

wait
echo "done"

ffmpeg -r 1 -start_number 0 -i "$1%04d.png" -i map.png -c:v libvpx-vp9 -vb 8000k -filter_complex "[0:v]minterpolate='me_mode=bidir:me=tdls:fps=30'[temp];[1:v]loop=loop=-1:size=1[background];[background][temp]blend=all_mode=overlay[out]" -map '[out]' -t $counter -r 30 -y "$4"
