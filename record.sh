#!/bin/bash
echo "Use CTRL + C to stop"
while true
do
	mkdir -p api-log
	./log.js -o api-log/%T.json.brotli
	sleep 300
done
