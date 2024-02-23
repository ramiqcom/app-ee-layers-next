# ee-layers
## API endpoint to generate earth engine tile and download link url

### Route list
| Route 				| Description 															| Request body 																																	| Response body 														|
|---------------|-------------------------------------------|-------------------------------------------------------------------------------|-------------------------------------------|
| ```/api/layers``` 	| Main route to get tile and download link 	| ```{ geojson: GeoJSON, date: DateArray, layer: LayerId, method: MethodId, satellite: SatelliteId }```	| ```{ tile_url: URL, download_url: URL, vis: VisObject }```|

### Type properties
| Type | Description | Structure | Example |
|------|-------------|-----------|---------|
| ```GeoJSON``` | GeoJSON type feature collection | ```{ type: "FeatureCollection", properties: Object, features: Array.<Feature> }``` | |
| ```DateArray``` | Couple of string date in array | ```[ StartDate, EndDate ]```	| ```[ "2023-01-01", "2023-02-28" ]``` |
| ```LayerId``` | An id string of the targeted layer | ```StringId``` | ```"lai"```	|
| ```MethodId```		| An id string of image acquisition method | ```MethodId``` | ```"cloudless"```	|
| ```SatelliteId```		| An id string of satellite collection to use | ```SatelliteId``` | ```"s2"```	|
| ```VisObject```		| An object with visualization parameter | ```{ bands: Array.<String>, max: Array.<Number>, min: Array.<Number>, palette: ?Array.<String> }``` | ```"{ bands: ['B4', 'B3', 'B2'], min: [0, 0, 0], max: [0.15, 0.15, 0.15], palette: null }"```	|

### Layer ID list
| ID | Description|
|----|------------|
| ```"true_color"``` | Show the layer using RGB composite |
| ```"false_color"``` | Show the layer using NIR-Red-Green composite |
| ```"ndvi"``` | Show the layer using NDVI index |
| ```"lai"``` | Show the layer using Leaf Area Index |

### Method ID list
| ID | Description|
|----|------------|
| ```"cloudless"``` | Get the image with the fewest cloud cover |
| ```"latest"``` | Get the image with the latest acquisition date |
| ```"composite"``` | Create a cloud mask composite of the image |

### Satellite ID list
| ID | Description|
|----|------------|
| ```"s2"``` | Using Sentinel-2 Level 2A collection |
| ```"landsat"``` | Using Landsat 8 and 9 OLI collection |

## Example of request body
```
{
    "geojson": {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "coordinates": [
                        [
                            [
                                5.614904183943082,
                                52.08297980248693
                            ],
                            [
                                5.614904183943082,
                                52.01866949250021
                            ],
                            [
                                5.719372253048675,
                                52.01866949250021
                            ],
                            [
                                5.719372253048675,
                                52.08297980248693
                            ],
                            [
                                5.614904183943082,
                                52.08297980248693
                            ]
                        ]
                    ],
                    "type": "Polygon"
                }
            }
        ]
    },
    "date": [
        "2023-05-01",
        "2023-07-31"
    ],
    "layer": "true_color",
    "satellite": "s2",
    "method": "composite"
}
```

### Example of response body
```
{
    "tile_url": "https://earthengine.googleapis.com/v1/projects/earthengine-legacy/maps/d54daaa93b420601b300196dc3e1d6a9-2a76bcda5256b4fae6ca5c0a32b41814/tiles/{z}/{x}/{y}",
    "download_url": "https://earthengine.googleapis.com/v1/projects/earthengine-legacy/thumbnails/147b93fa05004f9791fc166332f48151-9ff8ad27a1922d71e588992ba4ccbed2:getPixels"
}
```