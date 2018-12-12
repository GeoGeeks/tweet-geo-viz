 var dojoConfig = {
      has: {
        "esri-featurelayer-webgl": 1
      }
    };

  require([
      "esri/Map",
      "esri/WebMap",
      "esri/views/MapView",
      "esri/Graphic",
      "esri/widgets/LayerList",
      "esri/layers/FeatureLayer",
      "esri/widgets/Legend",
      "esri/widgets/Expand",
      "esri/widgets/Search",
      "esri/widgets/Home",
      "dojo/domReady!"
    ], function(Map, WebMap, MapView, Graphic, LayerList, FeatureLayer, Legend, Expand, Search, Home) {



      var layer = new FeatureLayer({
        portalItem: {
          id: "de76fa5424774a0c8cbdcc8089404362"
        },
        title: "Talleres de conversion"
      });



      map = new Map({
        basemap: "dark-gray",
      });

      /*var map = new WebMap({
        portalItem: {
          id: "71e36d1d0ff94ac08f67784fe0385013"
        },
        layers: [layerGNV,layer]
      });*/

      var mainView = new MapView({
        container: "mainViewDiv",
        map: map,
        center: [-74, 4],
        zoom: 5,
        popup: {
          highlightEnabled: false,
          dockEnabled: true,
          dockOptions: {
            breakpoint: false,
            position: "top-right"
          }
        },
        ui: {
          components: []
        }
      });

      var search = new Search({
          view:mainView,
          allPlaceholder: "búsqueda rápida"
        });

      mainView.ui.add(search,{
        position:"top-left",
        index:0
      });




      var legend = new Legend({
        view: mainView
      });

      var HomeButton= new Home({
        view:mainView
      });
      mainView.ui.add(HomeButton, "top-left");

       var bgExpand = new Expand({
        view: mainView,
        content: legend,
      });

       mainView.ui.add(bgExpand, "bottom-right");



      mainView
      //.when(addPoints);
        .when(maintainFixedExtent);
        //.then(addPoints);
        // .then(disablePopupOnClick)
        // .then(enableHighlightOnPointerMove);
        //.then(disableNavigation)

        setInterval(addPoint(mainView), 6000);

      function maintainFixedExtent(view) {
        var fixedExtent = view.extent.clone();
        // keep a fixed extent in the view
        // when the view size changes
        view.on("resize", function() {
          view.extent = fixedExtent;
          //addPoints();
        });
        return view;
      }

      var highlight = null;

      function addPoints(view){
        console.log("addPoints");




      }

      function addPoint(view){
        for (i = 0; i< 5;i++){
          var point = {
            type: "point",  // autocasts as new Point()
            longitude: (Math.random() * (-78.99 - (-66.87)) + (-66.87)).toFixed(3) * 1,
            latitude: (Math.random() * (-4.29 - (12.43)) + (12.43)).toFixed(3) * 1
          };

          var markerSymbol = {
            type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
            color: [226, 119, 40]
          };

          var pointGraphic = new Graphic({
            geometry: point,
            symbol: markerSymbol
          });
          console.log(pointGraphic);
          mainView.graphics.add(pointGraphic);
          console.log("point added");
        }
      }

      function enableHighlightOnPointerMove(view) {
        view.whenLayerView(layer).then(function(layerView) {
          view.on("pointer-move", function(event) {
            view.hitTest(event)
              .then(function(response) {

                // remove the previous highlight
                if (highlight) {
                  highlight.remove();
                  highlight = null;
                }

                // if a feature is returned, highlight it
                // and display its attributes in the popup
                // if no features are returned, then close the popup
                var id = null;

                if (response.results.length) {
                  var feature = response.results.filter(function(
                    result) {


                    return result.graphic.layer === layer;
                  })[0].graphic;
                  feature.popupTemplate = layer.popupTemplate;
                  id = feature.attributes.OBJECTID;
                  highlight = layerView.highlight([id]);
                  var selectionId = mainView.popup.selectedFeature ?
                    mainView.popup.selectedFeature.attributes
                    .OBJECTID : null;

                  if (highlight && (id !== selectionId)) {
                    mainView.popup.open({
                      features: [feature],
                      updateLocationEnabled: true
                    });
                  }
                } else {
                  if (mainView.popup.visible) {
                    mainView.popup.close();
                    mainView.popup.clear();
                  }
                }
              });
          });

        });
      }

      // disables all navigation in the view
      function disableNavigation(view) {
        view.popup.dockEnabled = true;

        // Removes the zoom action on the popup
        view.popup.actions = [];

        // stops propagation of default behavior when an event fires
        function stopEvtPropagation(event) {
          event.stopPropagation();
        }

        // disable mouse wheel scroll zooming on the view
        view.on("mouse-wheel", stopEvtPropagation);

        // disable zooming via double-click on the view
        view.on("double-click", stopEvtPropagation);

        // disable zooming out via double-click + Control on the view
        view.on("double-click", ["Control"], stopEvtPropagation);

        // disables pinch-zoom and panning on the view
        view.on("drag", stopEvtPropagation);

        // disable the view's zoom box to prevent the Shift + drag
        // and Shift + Control + drag zoom gestures.
        view.on("drag", ["Shift"], stopEvtPropagation);
        view.on("drag", ["Shift", "Control"], stopEvtPropagation);

        // prevents zooming and rotation with the indicated keys
        view.on("key-down", function(event) {
          var prohibitedKeys = ["+", "-", "_", "=", "a", "d"];
          var keyPressed = event.key.toLowerCase();
          if (prohibitedKeys.indexOf(keyPressed) !== -1) {
            event.stopPropagation();
          }
        });

        return view;
      }

      // prevents the user from opening the popup with click

      function disablePopupOnClick(view) {
        view.on("click", function(event) {
          event.stopPropagation();
        });
        return view;
      }

    });
