#!/bin/sh
convert map.png -fuzz "3%" -transparent '#6BD0D7' map2.png
convert map2.png -fuzz "3%" -transparent '#262A3C' map2.png
convert map2.png -fuzz "3%" -transparent '#4D5148' map2.png
