#!/bin/bash
./export_major_locations.sh | jq -r '. | [keys[] as $k | [$k,.[$k].x,.[$k].y]] | .[] | @csv'
