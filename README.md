# ee-layers

## API endpoint to generate earth engine tile and download link url

### Demo App to use the API

[https://app-ee-layers-next.vercel.app/](https://app-ee-layers-next.vercel.app/)

### For Developer to use run the application

1. Rename `.env.example`to `.env`.
2. Replace value of `API` using your API url endpoint.

### Route list

| Route         | Description                              | Request body                                                                                                     | Response body                                           |
| ------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `/api/layers` | Main route to get tile and download link | `{ geojson: ?GeoJSON, bounds: ?BBox date: DateArray, layer: LayerId, method: MethodId, satellite: SatelliteId }` | `{ tile_url: URL, thumbnail_url: URL, vis: VisObject }` |

### Type properties

| Type          | Description                                 | Structure                                                                                       | Example                                                                                 |
| ------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `GeoJSON`     | GeoJSON type feature collection             | `{ type: "FeatureCollection", properties: Object, features: Array.<Feature> }`                  |
|               |
| `BBox`        | BBox array                                  | `[ West, South, East, North ]`                                                                  | `[0.1, 50.2, 0.2, 50.3]`                                                                |
|               |
| `DateArray`   | Couple of string date in array              | `[ String, String ]`                                                                            | `[ "2023-01-01", "2023-02-28" ]`                                                        |
| `LayerId`     | An id string of the targeted layer          | `String`                                                                                        | `"lai"`                                                                                 |
| `MethodId`    | An id string of image acquisition method    | `String`                                                                                        | `"cloudless"`                                                                           |
| `SatelliteId` | An id string of satellite collection to use | `String`                                                                                        | `"s2"`                                                                                  |
| `VisObject`   | An object with visualization parameter      | `{ bands: Array.<String>, max: Array.<Number>, min: Array.<Number>, palette: ?Array.<String> }` | `{ bands: ['B4', 'B3', 'B2'], min: [0, 0, 0], max: [0.15, 0.15, 0.15], palette: null }` |

### Layer ID list

| ID                          | Description                                                     |
| --------------------------- | --------------------------------------------------------------- |
| `"true_color"`              | Show the layer using RGB composite                              |
| `"false_color"`             | Show the layer using NIR-Red-Green composite                    |
| `"enhanced_natural_color"`  | Show the layer using SWIR1-NIR-Green composite                  |
| `"agriculture_false_color"` | Show the layer using NIR-SWIR1-Red composite                    |
| `"infrared_false_color"`    | Show the layer using NIR-SWIR1-SWIR1 composite                  |
| `"ndvi"`                    | Show the layer using Normalized Difference Vegetation index     |
| `"ndmi"`                    | Show the layer using Normalized Difference Moisture Index index |
| `"lai"`                     | Show the layer using Leaf Area Index                            |
| `"fapar"`                   | The Fraction of Absorbed Photosynthetically Active Radiation    |
| `"fcover"`                  | Show the layer using Fraction of green Vegetation Cover         |
| `"cab"`                     | Show the layer using Leaf Chlorophyll Content                   |
| `"ccc"`                     | Show the layer using Canopy Chlorophyll Content                 |
| `"bais2"`                   | Show the layer using Burned Area Index for Sentinel 2           |
| `"ndsi"`                    | Show the layer using Normalized Difference Snow Index           |

### Method ID list

| ID            | Description                                    |
| ------------- | ---------------------------------------------- |
| `"cloudless"` | Get the image with the fewest cloud cover      |
| `"latest"`    | Get the image with the latest acquisition date |
| `"composite"` | Create a cloud mask composite of the image     |

### Satellite ID list

| ID          | Description                          |
| ----------- | ------------------------------------ |
| `"s2"`      | Using Sentinel-2 Level 2A collection |
| `"landsat"` | Using Landsat 8 and 9 OLI collection |

## Example of request body

```JSON
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
    "layer": "lai",
    "satellite": "s2",
    "method": "cloudless"
}
```

### Example of response body

```JSON
{
    "tile_url": "https://earthengine.googleapis.com/v1/projects/earthengine-legacy/maps/b462c5e4f36cb2c89be16f769c85c498-319420f1a231fe1b2baddd6176fe54cf/tiles/{z}/{x}/{y}",
    "thumbnail_url": "https://earthengine.googleapis.com/v1/projects/earthengine-legacy/thumbnails/f97002008ea4a32c4d333996e789c346-cd052d83ef7460e6069d3f02e921b64e:getPixels",
    "vis": {
        "bands": [
            "LAI"
        ],
        "max": [
            10.406190245008903
        ],
        "min": [
            7.767173036174498
        ],
        "palette": [
            "lightyellow",
            "green"
        ]
    }
}
```
