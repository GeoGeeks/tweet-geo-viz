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


      var pointGraphic, inteval;
      var points = 0;
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
        .when(maintainFixedExtent)
        //.then()
        .then(addPoints);
        // .then(disablePopupOnClick)
        // .then(enableHighlightOnPointerMove);
        //.then(disableNavigation)

        function imprimir(){
        console.log("eyyy");
        }

      function maintainFixedExtent(view) {
        var fixedExtent = view.extent.clone();
        // keep a fixed extent in the view
        // when the view size changes
        view.on("resize", function() {
          view.extent = fixedExtent;
        });
        return view;
      }

      var highlight = null;

      var delay = ( function() {
        var timer = 0;
        return function(callback, ms) {
            clearTimeout (timer);
            timer = setTimeout(callback, ms);
        };
    })();

    function wait(ms){
     var start = new Date().getTime();
     var end = start;
     while(end < start + ms) {
       end = new Date().getTime();
    }
  }

      function addPoints(view){
         // while (points < 5){
          //addPoint(view);
          //delay(addPoint(view),5000);
          interval = setInterval(addPoint, 5000);
          //console.log("#point:",points);
        //  console.log(interval);
          //points++;
          //wait(5000);
          //clearInterval(interval);
        // }


    }

    function addPoint(){
       // interval = setInterval(function(){
        console.log("add one Point");
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
           // interval = setInterval(function(){

            mainView.graphics.add(pointGraphic);
            console.log("point added");
            //changeRenderer(view, pointGraphic);
            //delay(changeRenderer(view, pointGraphic),5000);

            //clearInterval(interval);
       // },5000);

    }

    function changeRenderer(view, pointGraphic){
      var newMarkerSymbol = {
        type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
        color: [0, 0, 0]
      };
      delay(function(){pointGraphic.symbol = newMarkerSymbol;},2000);

    }

    });
