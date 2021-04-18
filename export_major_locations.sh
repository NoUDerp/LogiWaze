#!/bin/bash
download()
{
        (
        echo "["
        first=0

	for f in $(wget -qO - "https://war-service-live.foxholeservices.com/api/worldconquest/maps/"  | jq -r '.[]|.'); do
                if [ "$first" = "1" ]; then echo ","; fi
                first=1
                if [ "$f" = "GodcroftsHex" ]; then offsetx="148.15477"; offsety="-23.27272"; fi
                if [ "$f" = "DeadLandsHex" ]; then offsetx="128"; offsety="-128"; fi
                if [ "$f" = "ReachingTrailHex" ]; then offsetx="208.6191"; offsety="-128"; fi
                if [ "$f" = "CallahansPassageHex" ]; then offsetx="168.30954"; offsety="-128"; fi
                if [ "$f" = "MarbanHollowHex" ]; then offsetx="148.15477"; offsety="-93.09091"; fi
                if [ "$f" = "MarbanHollow" ]; then offsetx="148.15477"; offsety="-93.09091"; fi
                if [ "$f" = "UmbralWildwoodHex" ]; then offsetx="87.69045"; offsety="-128"; fi
                if [ "$f" = "MoorsHex" ]; then offsetx="188.46432"; offsety="-162.90909"; fi
                if [ "$f" = "MooringCountyHex" ]; then offsetx="188.46432"; offsety="-162.90909"; fi
                if [ "$f" = "HeartlandsHex" ]; then offsetx="67.535675"; offsety="-162.90909"; fi
                if [ "$f" = "LochMorHex" ]; then offsetx="107.84523"; offsety="-162.90909"; fi
                if [ "$f" = "LinnOfMercyHex" ]; then offsetx="148.15477"; offsety="-162.90909"; fi
                if [ "$f" = "LinnMercyHex" ]; then offsetx="148.15477"; offsety="-162.90909"; fi
                if [ "$f" = "StonecradleHex" ]; then offsetx="168.30954"; offsety="-197.81818"; fi
                if [ "$f" = "FarranacCoastHex" ]; then offsetx="128"; offsety="-197.81818"; fi
                if [ "$f" = "WestgateHex" ]; then offsetx="87.69045"; offsety="-197.81818"; fi
                if [ "$f" = "FishermansRowHex" ]; then offsetx="107.84523"; offsety="-232.72728"; fi
                if [ "$f" = "OarbreakerHex" ]; then offsetx="148.15477"; offsety="-232.72728"; fi
                if [ "$f" = "GreatMarchHex" ]; then offsetx="47.380905"; offsety="-128"; fi
                if [ "$f" = "TempestIslandHex" ]; then offsetx="107.84523"; offsety="-23.27272"; fi
                if [ "$f" = "EndlessShoreHex" ]; then offsetx="128"; offsety="-58.181816"; fi
                if [ "$f" = "AllodsBightHex" ]; then offsetx="87.69045"; offsety="-58.181816"; fi
                if [ "$f" = "WeatheredExpanseHex" ]; then offsetx="168.30954"; offsety="-58.181816"; fi
                if [ "$f" = "DrownedValeHex" ]; then offsetx="107.84523"; offsety="-93.09091"; fi
                if [ "$f" = "ShackledChasmHex" ]; then offsetx="67.535675"; offsety="-93.09091"; fi
                if [ "$f" = "ViperPitHex" ]; then offsetx="188.46432"; offsety="-93.09091"; fi
		wget -qO - "https://war-service-live.foxholeservices.com/api/worldconquest/maps/$f/static" | jq "[.mapTextItems[] | if .mapMarkerType==\"Major\" then {\"key\":.text, \"value\": {region: \"$f\", major: 1, x:(256+(((.x*46.54545454545455)+$offsety)-23.27272727272727)), y:(-256+((((1-.y)*40.30954606705751)+$offsetx)-20.15477303352875))}} else  {\"key\":.text, \"value\": {region: \"$f\", major: 0, x:(256+(((.x*46.54545454545455)+$offsety)-23.27272727272727)), y:(-256+((((1-.y)*40.30954606705751)+$offsetx)-20.15477303352875))}} end]"
        done
        echo "]"
        ) |     jq '.|flatten|from_entries'
}


download_all_regions()
{
        (
        for f in `download`; do
                content=`download "$f"`
                if ! [ -z "$content" ] ; then echo "$content"; else echo "error with $f region" 1>&2; fi
        done
        )       # |
}

download
