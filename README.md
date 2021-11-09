#Radio Sheep GCS
Radio Sheep GCS is a ground control station for managing drone operations with sheep searching related purposes. This project is a part of the course TDT4900 - Computer Science, Master's Thesis at Norwegian University of Science and Technology (NTNU).

##Installation
Yarn version used is 1.22.17

Node version used is 14.16.1

In root folder of the project, run the following command:

`yarn`

Ignore the errors :)

Run the following command to start the application:

`yarn dev`

##Pitfalls and limitations
* Route parameters should be configured before the route is drawn on the map to avoid excessive API calls to Kartverket. Using the parameter sliders after the route has been drawn might result in incorrect placed waypoints. 
* Kartverket's elevation API has a hard limit of maximum 50 waypoints per request. If a larger route is requested, the elevation data will be missing.
* Switching to the gray tone map clears whatever is rendered on the map.
* A route json file must be loaded twice to render the route line on the map, but it is not required to function.
* The map is not zoomed in on the route when the route is loaded. You must find it yourself.
