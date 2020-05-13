import os
import sys
import inspect
import processing
import pathlib
from PyQt5.QtCore import *
from PyQt5.QtGui import *
from PyQt5.QtWidgets import *
from qgis.core import *
from qgis.gui import *
from qgis.utils import *

def ensure_dir(file_path):
    directory = os.path.dirname(file_path)
    if not os.path.exists(file_path):
        print('Making:'+file_path)
        os.makedirs(file_path)
    else: print('exists')

hexlocale=str(QInputDialog.getText(None, "Enter Folder containing HexPolygon.geojson", "Enter text")).replace('\\','/')
hexlocale= hexlocale[:-8]
hexlocale= hexlocale[2:len(hexlocale)]

ensure_dir(hexlocale)
townslocale=str(QInputDialog.getText(None, "Enter Folder containing towns.geojson", "Enter text")).replace('\\','/')
townslocale = townslocale[:-8]
townslocale= townslocale[2:len(townslocale)]
ensure_dir(townslocale)

outputlocale=str(QInputDialog.getText(None, "Enter Folder path for output", "Enter text")).replace('\\','/')
outputlocale = outputlocale[:-8]
outputlocale= outputlocale[2:len(outputlocale)]
ensure_dir(outputlocale)

print(hexlocale)
print(townslocale)
print(outputlocale)

hexShape = hexlocale+'//HexPolygon.geojson'
towns = townslocale+'//towns.geojson'
root = QgsProject.instance().layerTreeRoot()


print(hexShape)
print(towns)

#towns = r"C:\Users\chado\Downloads\Github\FRouter\PointMap Bases and Townhalls\towns.geojson"
#hexShape = r"C:\Users\chado\Downloads\Github\FRouter\HexPolygon.geojson"
#AllTowns = iface.addVectorLayer(towns,"","ogr")
Overlay = iface.addVectorLayer(hexShape,"","ogr")
outputtemp = outputlocale+'//temp'
print(outputtemp)
ensure_dir(outputtemp)

output = outputtemp+'//merged towns.geojson'
processing.run("native:joinattributesbylocation", \
{'INPUT':towns, \
'JOIN':hexShape, \
'PREDICATE':[0],'JOIN_FIELDS':['HexID','HexName'],'METHOD':0,'DISCARD_NONMATCHING':False,'PREFIX':'', \
'OUTPUT':output})

print('Done Joining attributes')


outputhexshape = outputtemp+'//hexshape'
ensure_dir(outputhexshape)

processing.run("qgis:splitvectorlayer", {'INPUT':hexShape,'FIELD':'HexID', \
'OUTPUT':outputhexshape})

print('Done splitting vector layer of Hexshape')

TownsWithID=output
TownID = iface.addVectorLayer(TownsWithID,"","ogr")


processing.run("qgis:splitvectorlayer", {'INPUT':TownsWithID,'FIELD':'HexID','OUTPUT':outputtemp})

print('Done splitting vector layer of Towns with hex id')

outputFinal=outputlocale+'//done//VoronoiHexID'
ensure_dir(outputFinal)

i=0
for id in TownID.getFeatures():
    sid=str(i)
    input = outputtemp+'//HexID_'+sid+'.gpkg|layername=HexID_'+sid
    if os.path.isfile(outputtemp+'//HexID_'+sid+'.gpkg') == True:
        print('Hex'+sid)
        processing.run("qgis:voronoipolygons", {'INPUT':input,'BUFFER':100,'OUTPUT':outputtemp+'//Hex'+sid+'SquareVoronoi.geojson'})
        print('Created Square Voronoi')
        processing.run("native:intersection", {'INPUT':outputtemp+'//Hex'+sid+'SquareVoronoi.geojson','OVERLAY':outputhexshape+'/HexID_'+sid+'.gpkg|layername=HexID_'+sid,'INPUT_FIELDS':[],'OVERLAY_FIELDS':[],'OVERLAY_FIELDS_PREFIX':'','OUTPUT':outputFinal+sid})
        print('Create Hex voronoi')
    i=i+1
    

print('Process has been completed')



#templayer= iface.addVectorLayer(intermediate,"","ogr")

#processing.run("native:joinattributesbylocation", {'INPUT':'C:\\Users\\chado\\Downloads\\Github\\FRouter\\PointMap Bases and Townhalls\\towns.geojson','JOIN':'C:\\Users\\chado\\Downloads\\Github\\FRouter\\HexPolygon.geojson','PREDICATE':[0],'JOIN_FIELDS':[],'METHOD':0,'DISCARD_NONMATCHING':False,'PREFIX':'','OUTPUT':'TEMPORARY_OUTPUT'})


#for feature in Overlay.getFeatures():
#    hexId = feature["HexID"]
#    name = feature["HexName"]
#    Overlay.selectByExpression('"HexID"=HexID')
#    
#    #processing.run("native:intersection", {'INPUT':'C:\\Users\\chado\\Downloads\\Github\\FRouter\\PointMap Bases and Townhalls\\towns.geojson','OVERLAY':QgsProcessingFeatureSourceDefinition('All_Hexes_0f51d74e_8f1b_45bb_8c03_5351c5e464a3', True),'INPUT_FIELDS':[],'OVERLAY_FIELDS':[],'OVERLAY_FIELDS_PREFIX':'','OUTPUT':'TEMPORARY_OUTPUT'})
#    processing.run("native:intersection", {'INPUT':towns, \
#    'OVERLAY':QgsProcessingFeatureSourceDefinition(hexShape,True), \
#    'INPUT_FIELDS':[],'OVERLAY_FIELDS':[],'OVERLAY_FIELDS_PREFIX':'', \
#    'OUTPUT':'TEMPORARY_OUTPUT'})
#    #processing.run("native:multiparttosingleparts", {'INPUT':'MultiPoint?crs=EPSG:3857&field=field_1:string(0,0)&field=HexID:integer(0,0)&field=HexName:string(0,0)&uid={6e1bcfe1-f0f0-4aeb-b04e-fbb9fe696d68}','OUTPUT':'TEMPORARY_OUTPUT'})
#    #processing.run("native:multiparttosingleparts", {'INPUT':intermediate}','OUTPUT':'TEMPORARY_OUTPUT'})
#    
#    Overlay.removeSelection()
#Overlay.removeSelection()