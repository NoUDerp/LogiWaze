The script included has to be run from inside Qgis preferably with admin priviliges. (This is because i have no idea how to read off features that are not loaded in there otherwise,
	 because i used an input module and because i dont know how to pipe out the native plugins for processing)
To open:
Start Qgis
Start New project (Default hotkey CTRL+N [Actually important i have to load 1 layer])
Settings->Options->Processing->General here set "Invalid Features filtering" to "Skip ignore features with invalid geometries" [Only needed one time]
Click Python Console (Alternative default hotkey CTRL+ALT+P)
Inside Python Console open the Editor (Paper with pencil icon)
Load script with "Open script" button in the editor section.
Press "Run script"
----
It will now ask you to provide the paths of:
"HexPolygon.geojson", "towns.geojson", and a path of where to create the output folders.
There will be two folders created, one is a folder called done containing the processed voronois with name based on HexID (Have to change that to Hexname at some point) and
	a folder called temp containing the inbetween steps neccesary to run the processing tools. Once the process is done you can close Qgis and delete the temp folder unless you need it.
----
To-do:
Figure out how to load a towns.csv instead of geojson so you dont have to export it to correct filetype
Maybe not load things with specific file extensions. Set Skip ignore features from python console instead of needing it from user.
Figure out how to delete temp folder unless specified with options.
Make this into a plugin for the processing toolbox somehow with an actual interface. Its only two inputs with a folder output, but after trying for 3 hours to get the template to work with folder outputs i gave up.
Figure out if all of this can be done in gdal, and then maybe just make a script for that.
Have option to merge voronois into one file.
Figure out if this can be run without Qgis "open".
Either fix my master shapefile to not have edges somehow (im starting to doubt that is possible) or discard NULL ID attribute features to avoid creating uneccesary files and extending the process slightly.
Learn to have less dumb, why did this take so long for me todo?
----
Known issues:
If it breaks its probably my fault for not proofing this more. But if Skip ignore features is not set the processing algorithm breaks on encountering the edges in the hexagon shapefile.
Probably need to make a new project everytime this is run and discard the old one because i have to load 1 layer and while the file is only being written from it could just break from that.
Cant set default output file to anything other then GPK or whatever its called because i specifically look for that file ending. Once that is fixed that be the way to decide the end files. Might have to load and rexport the files.
Please be patient with me, i am not smart.
----
Rescale csv file with

x column	largeX = 128 + (smallX * (20037508.3427892439067364/128.0))
y column	largeY = -128 + (smallY * (20037508.3427892439067364/128.0))
Just keeping this here to remember it.