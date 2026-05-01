#!/bin/bash
branch="live"
#"live"
w=$(echo "scale=20; 256 / 10" |  bc)
k=$(echo "scale=20; $w * sqrt(3) / 2" |  bc)
k2=$(echo "scale=20; $k / 2" |  bc)
w2=$(echo "scale=20; $w / 2" |  bc)
download()
{
        (
        echo "["
        first=0

	for f in $(wget -qO - "https://war-service-$branch.foxholeservices.com/api/worldconquest/maps/"  |  jq -r '.[]|.'); do
                if [ "$first" = "1" ]; then echo ","; fi
                first=1

		if [ "$f" = "KingsCageHex" ]; then offsetx=$(echo "-1.5 * $w" | bc); offsety=$(echo "0" | bc); fi
        if [ "$f" = "WestgateHex" ]; then offsetx=$(echo "-2.25 * $w" | bc); offsety=$(echo "-.5 * $k" | bc); fi
        if [ "$f" = "FarranacCoastHex" ]; then offsetx=$(echo "-2.25 * $w" | bc); offsety=$(echo ".5 * $k" | bc); fi
        if [ "$f" = "EndlessShoreHex" ]; then offsetx=$(echo "2.25 * $w" | bc); offsety=$(echo "-.5 * $k" | bc); fi
        if [ "$f" = "StlicanShelfHex" ]; then offsetx=$(echo "2.25 * $w" | bc); offsety=$(echo ".5 * $k" | bc); fi
        if [ "$f" = "OarbreakerHex" ]; then offsetx=$(echo "-3.75 * $w" | bc); offsety=$(echo "-0.5 * $k" | bc); fi
        if [ "$f" = "FishermansRowHex" ]; then offsetx=$(echo "-3 * $w" | bc); offsety=$(echo "0" | bc); fi
        if [ "$f" = "StemaLandingHex" ]; then offsetx=$(echo "-3 * $w" | bc); offsety=$(echo "-1 * $k" | bc); fi
        if [ "$f" = "GodcroftsHex" ]; then offsetx=$(echo "3 * $w" | bc); offsety=$(echo "1 * $k" | bc); fi
        if [ "$f" = "SableportHex" ]; then offsetx=$(echo "-1.5 * $w" | bc); offsety=$(echo "-1 * $k" | bc); fi
        if [ "$f" = "TempestIslandHex" ]; then offsetx=$(echo "3 * $w" | bc); offsety=$(echo "0" | bc); fi
        if [ "$f" = "ReaversPassHex" ]; then offsetx=$(echo "2.25 * $w" | bc); offsety=$(echo "-1.5 * $k" | bc); fi
        if [ "$f" = "TheFingersHex" ]; then offsetx=$(echo "3.75 * $w" | bc); offsety=$(echo "-0.5 * $k" | bc); fi
        if [ "$f" = "ClahstraHex" ]; then offsetx=$(echo "1.5 * $w" | bc); offsety=$(echo "0" | bc); fi
        if [ "$f" = "DeadLandsHex" ]; then offsetx=$(echo "0" | bc); offsety=$(echo "0" | bc); fi
        if [ "$f" = "CallahansPassageHex" ]; then offsetx=$(echo "0" | bc); offsety=$(echo "1 * $k" | bc); fi
        if [ "$f" = "MarbanHollow" ]; then offsetx=$(echo ".75 * $w" | bc); offsety=$(echo ".5 * $k" | bc); fi
        if [ "$f" = "UmbralWildwoodHex" ]; then offsetx=$(echo "0" | bc); offsety=$(echo "-1 * $k" | bc); fi
        if [ "$f" = "MooringCountyHex" ]; then offsetx=$(echo "-.75 * $w" | bc); offsety=$(echo "1.5 * $k" | bc); fi
        if [ "$f" = "HeartlandsHex" ]; then offsetx=$(echo "-.75 * $w" | bc); offsety=$(echo "-1.5 * $k" | bc); fi
        if [ "$f" = "LochMorHex" ]; then offsetx=$(echo "-.75 * $w" | bc); offsety=$(echo "-.5 * $k" | bc); fi
        if [ "$f" = "LinnMercyHex" ]; then offsetx=$(echo "-.75 * $w" | bc); offsety=$(echo ".5 * $k" | bc); fi
        if [ "$f" = "ReachingTrailHex" ]; then offsetx=$(echo "0" | bc); offsety=$(echo "2 * $k" | bc); fi
        if [ "$f" = "StonecradleHex" ]; then offsetx=$(echo "-1.5 * $w" | bc); offsety=$(echo "1 * $k" | bc); fi
        if [ "$f" = "GreatMarchHex" ]; then offsetx=$(echo "0" | bc); offsety=$(echo "-2 * $k" | bc); fi
        if [ "$f" = "AllodsBightHex" ]; then offsetx=$(echo "1.5 * $w" | bc); offsety=$(echo "-1.0 * $k" | bc); fi
        if [ "$f" = "WeatheredExpanseHex" ]; then offsetx=$(echo "1.5 * $w" | bc); offsety=$(echo "1.0 * $k" | bc); fi
        if [ "$f" = "DrownedValeHex" ]; then offsetx=$(echo ".75 * $w" | bc); offsety=$(echo "-.5 * $k" | bc); fi
        if [ "$f" = "ShackledChasmHex" ]; then offsetx=$(echo ".75 * $w" | bc); offsety=$(echo "-1.5 * $k" | bc); fi
        if [ "$f" = "ViperPitHex" ]; then offsetx=$(echo ".75 * $w" | bc); offsety=$(echo "1.5 * $k" | bc); fi
        if [ "$f" = "NevishLineHex" ]; then offsetx=$(echo "-2.25 * $w" | bc); offsety=$(echo "1.5 * $k" | bc); fi
        if [ "$f" = "AcrithiaHex" ]; then offsetx=$(echo ".75 * $w" | bc); offsety=$(echo "-2.5 * $k" | bc); fi
        if [ "$f" = "RedRiverHex" ]; then offsetx=$(echo "-.75 * $w" | bc); offsety=$(echo "-2.5 * $k" | bc); fi
        if [ "$f" = "CallumsCapeHex" ]; then offsetx=$(echo "-1.5 * $w" | bc); offsety=$(echo "2 * $k" | bc); fi
        if [ "$f" = "SpeakingWoodsHex" ]; then offsetx=$(echo "-.75 * $w" | bc); offsety=$(echo "2.5 * $k" | bc); fi
        if [ "$f" = "BasinSionnachHex" ]; then offsetx=$(echo "0" | bc); offsety=$(echo "3 * $k" | bc); fi
        if [ "$f" = "HowlCountyHex" ]; then offsetx=$(echo ".75 * $w" | bc); offsety=$(echo "2.5 * $k" | bc); fi
        if [ "$f" = "ClansheadValleyHex" ]; then offsetx=$(echo "1.5 * $w" | bc); offsety=$(echo "2 * $k" | bc); fi
        if [ "$f" = "MorgensCrossingHex" ]; then offsetx=$(echo "2.25 * $w" | bc); offsety=$(echo "1.5 * $k" | bc); fi
        if [ "$f" = "TerminusHex" ]; then offsetx=$(echo "1.5 * $w" | bc); offsety=$(echo "-2 * $k" | bc); fi
        if [ "$f" = "KalokaiHex" ]; then offsetx=$(echo "0" | bc); offsety=$(echo "-3 * $k" | bc); fi
        if [ "$f" = "AshFieldsHex" ]; then offsetx=$(echo "-1.5 * $w" | bc); offsety=$(echo "-2 * $k" | bc); fi
        if [ "$f" = "OriginHex" ]; then offsetx=$(echo "-2.25 * $w" | bc); offsety=$(echo "-1.5 * $k" | bc); fi

        # Update 1.63 Airborne — Northern (NW outer) regions
        if [ "$f" = "GutterHex" ]; then offsetx=$(echo "-3 * $w" | bc); offsety=$(echo "1 * $k" | bc); fi
        if [ "$f" = "KuuraStrandHex" ]; then offsetx=$(echo "-3 * $w" | bc); offsety=$(echo "2 * $k" | bc); fi
        if [ "$f" = "PalantineBermHex" ]; then offsetx=$(echo "-3.75 * $w" | bc); offsety=$(echo ".5 * $k" | bc); fi
        if [ "$f" = "PariPeakHex" ]; then offsetx=$(echo "-3.75 * $w" | bc); offsety=$(echo "1.5 * $k" | bc); fi
        if [ "$f" = "OlavisWakeHex" ]; then offsetx=$(echo "-4.5 * $w" | bc); offsety=$(echo "1 * $k" | bc); fi

        # Update 1.63 Airborne — Southern (SE outer) regions
        if [ "$f" = "WrestaHex" ]; then offsetx=$(echo "3 * $w" | bc); offsety=$(echo "-1 * $k" | bc); fi
        if [ "$f" = "OnyxHex" ]; then offsetx=$(echo "3 * $w" | bc); offsety=$(echo "-2 * $k" | bc); fi
        if [ "$f" = "LykosIsleHex" ]; then offsetx=$(echo "3.75 * $w" | bc); offsety=$(echo ".5 * $k" | bc); fi
        if [ "$f" = "TyrantFoothillsHex" ]; then offsetx=$(echo "3.75 * $w" | bc); offsety=$(echo "-1.5 * $k" | bc); fi
        if [ "$f" = "PipersEnclaveHex" ]; then offsetx=$(echo "4.5 * $w" | bc); offsety=$(echo "-1 * $k" | bc); fi

		#if [ "$f" = "StemaLandingHex" ]; then offsetx=$(echo "-4 * $w" | bc); offsety=$(echo "-1 * $k" | bc); fi
		#if [ "$f" = "StlicanShelfHex" ]; then offsetx=$(echo "3 * $w" | bc); offsety=$(echo "0.5 * $k" | bc); fi
		#if [ "$f" = "ClahstraHex" ]; then offsetx=$(echo "2 * $w" | bc); offsety=$(echo "0" | bc); fi
		#if [ "$f" = "FishermansRowHex" ]; then offsetx=$(echo "-4 * $w" | bc); offsety=$(echo "0" | bc); fi
		#if [ "$f" = "OarbreakerHex" ]; then offset=$(echo "-4 * $w" | bc); offsety=$(echo "1.5 * $k" | bc); fi

		#if [ "$f" = "DeadLandsHex" ]; then offsetx="0"; offsety="0"; fi
		#if [ "$f" = "CallahansPassageHex" ]; then offsetx=$(echo "0" |  bc); offsety=$( echo "$k" |  bc); fi	
		#if [ "$f" = "MarbanHollow" ]; then offsetx=$(echo "0.75 * $w" |  bc); offsety=$( echo "0.5 * $k" |  bc); fi
		#if [ "$f" = "UmbralWildwoodHex" ]; then offsetx=$(echo "0" |  bc); offsety=$( echo "-$k" |  bc); fi
		#if [ "$f" = "MooringCountyHex" ]; then offsetx=$(echo "-0.75 * $w" |  bc); offsety=$( echo " 1.5 * $k" |  bc); fi
		#if [ "$f" = "HeartlandsHex" ]; then offsetx=$(echo "-0.75 * $w" |  bc); offsety=$( echo "-1.5 * $k" |  bc); fi
		#if [ "$f" = "LochMorHex" ]; then offsetx=$(echo "-0.75 * $w" |  bc); offsety=$( echo "-0.5 * $k" |  bc); fi
		#if [ "$f" = "LinnMercyHex" ]; then offsetx=$(echo "-0.75 * $w" |  bc); offsety=$( echo "0.5 * $k" |  bc); fi
		#if [ "$f" = "ReachingTrailHex" ]; then offsetx=$(echo "0" |  bc); offsety=$( echo "2 * $k" |  bc); fi
		#if [ "$f" = "StonecradleHex" ]; then offsetx=$(echo "-1.5 * $w" |  bc); offsety=$( echo "$k" |  bc); fi
		#if [ "$f" = "KingsCageHex" ]; then offsetx=$(echo "-1.5 * $w" |  bc); offsety=$( echo "0" |  bc); fi
		#if [ "$f" = "SableportHex" ]; then offsetx=$(echo "-1.5 * $w" |  bc); offsety=$( echo "-$k" |  bc); fi
		#if [ "$f" = "WestgateHex" ]; then offsetx=$(echo "-2.25 * $w" |  bc); offsety=$( echo "-0.5 * $k" |  bc); fi	
		#if [ "$f" = "FarranacCoastHex" ]; then offsetx=$(echo "-2.25 * $w" |  bc); offsety=$( echo "0.5 * $k" |  bc); fi
		#if [ "$f" = "GreatMarchHex" ]; then offsetx=$(echo "0" |  bc); offsety=$( echo "-2 * $k" |  bc); fi
		#if [ "$f" = "TempestIslandHex" ]; then offsetx=$(echo "2.25 * $w" |  bc); offsety=$( echo "-0.5 * $k" |  bc); fi
		#if [ "$f" = "GodcroftsHex" ]; then offsetx=$(echo "2.25 * $w" |  bc); offsety=$( echo "0.5 * $k" |  bc); fi
		#if [ "$f" = "EndlessShoreHex" ]; then offsetx=$(echo "1.5 * $w" |  bc); offsety=$( echo "0" |  bc); fi
		#if [ "$f" = "AllodsBightHex" ]; then offsetx=$(echo " 1.5 * $w" |  bc); offsety=$( echo "-$k" |  bc); fi
		#if [ "$f" = "WeatheredExpanseHex" ]; then offsetx=$(echo "1.5 * $w" |  bc); offsety=$( echo "$k" |  bc); fi
		#if [ "$f" = "DrownedValeHex" ]; then offsetx=$(echo "0.75 * $w" |  bc); offsety=$( echo "-0.5 * $k" |  bc); fi
		#if [ "$f" = "ShackledChasmHex" ]; then offsetx=$(echo "0.75 * $w" |  bc); offsety=$( echo "-1.5 * $k" |  bc); fi
		#if [ "$f" = "ViperPitHex" ]; then offsetx=$(echo "0.75 * $w" |  bc); offsety=$( echo " 1.5 * $k" |  bc); fi
		#if [ "$f" = "NevishLineHex" ]; then offsetx=$(echo "-2.25 * $w" |  bc); offsety=$( echo "1.5 * $k" |  bc); fi
		#if [ "$f" = "AcrithiaHex" ]; then offsetx=$(echo "0.75 * $w" |  bc); offsety=$( echo "-2.5 * $k" |  bc); fi
		#if [ "$f" = "RedRiverHex" ]; then offsetx=$(echo "-0.75 * $w" |  bc); offsety=$( echo "-2.5 * $k" |  bc); fi
		#if [ "$f" = "CallumsCapeHex" ]; then offsetx=$(echo "-1.5 * $w" |  bc); offsety=$( echo "2 * $k" |  bc); fi
		#if [ "$f" = "SpeakingWoodsHex" ]; then offsetx=$(echo "-0.75 * $w" |  bc); offsety=$( echo "2.5 * $k" |  bc); fi
		#if [ "$f" = "BasinSionnachHex" ]; then offsetx=$(echo "0" |  bc); offsety=$( echo " 3 * $k" |  bc); fi
		#if [ "$f" = "HowlCountyHex" ]; then offsetx=$(echo "0.75 * $w" |  bc); offsety=$( echo "2.5 * $k" |  bc); fi
		#if [ "$f" = "ClansheadValleyHex" ]; then offsetx=$(echo "1.5 * $w" |  bc); offsety=$( echo "2 * $k" |  bc); fi
		#if [ "$f" = "MorgensCrossingHex" ]; then offsetx=$(echo " 2.25 * $w" |  bc); offsety=$( echo "1.5 * $k" |  bc); fi
		#if [ "$f" = "TheFingersHex" ]; then offsetx=$(echo "2.25 * $w" |  bc); offsety=$( echo "-1.5 * $k" |  bc); fi	
		#if [ "$f" = "TerminusHex" ]; then offsetx=$(echo "1.5 * $w" |  bc); offsety=$( echo "-2 * $k" |  bc); fi
		#if [ "$f" = "KalokaiHex" ]; then offsetx=$(echo "0" |  bc); offsety=$( echo "-3 * $k" |  bc); fi
		#if [ "$f" = "AshFieldsHex" ]; then offsetx=$(echo "-1.5 * $w" |  bc); offsety=$( echo "-2 * $k" |  bc); fi
		#if [ "$f" = "OriginHex" ]; then offsetx=$(echo "-2.25 * $w" |  bc); offsety=$( echo "-1.5 * $k" |  bc); fi

#		offsetx=$(echo "$offsetx + 128" |  bc)
#		offsety=$(echo "$offsety - 128" |  bc)

wget -qO - "https://war-service-$branch.foxholeservices.com/api/worldconquest/maps/$f/static" |  jq "[.mapTextItems[] | if .mapMarkerType==\"Major\" then {\"key\": (\"major-\" + .text), \"value\": {name: .text, region: \"$f\", major: 1, x:((((.x*$w)+$offsetx)-$w2)), y:(((((1-.y)*$k)+$offsety)-$k2))}} else  {\"key\":( \"minor-\" + .text), \"value\": {name: .text, region: \"$f\", major: 0, x:((((.x*$w)+$offsetx)-$w2)), y:(((((1-.y)*$k)+$offsety)-$k2))}} end]"
		
        done
        echo "]"
        ) |      jq '.|flatten|from_entries'
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
