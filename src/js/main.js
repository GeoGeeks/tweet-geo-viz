 var dojoConfig = {
      has: {
        "esri-featurelayer-webgl": 1
      }
    };

  require([
      "esri/Map",
      "esri/WebMap",
      "esri/views/MapView",
      "esri/widgets/LayerList",
      "esri/layers/FeatureLayer",
      "esri/widgets/Legend",
      "esri/widgets/Expand",
      "esri/widgets/Search",
      "esri/widgets/Home",
      "dojo/domReady!"
    ], function(Map, WebMap, MapView, LayerList, FeatureLayer, Legend, Expand, Search, Home) {



      var layer = new FeatureLayer({
        portalItem: {
          id: "de76fa5424774a0c8cbdcc8089404362"
        },
        outFields: ["nombre", "direccion", "ubicacion", "telefono"],
        title: "Talleres de conversion"
      });

      var layerEstaciones = new FeatureLayer({
        portalItem: {
          id: "43af43838e7e4a62b2aaf4485a82c31b"
        },
        title: "Talleres de conversion"
      });

      var layerGNV = new FeatureLayer({
         portalItem: {
          id: "8bcb5c4bb2ea42869b1a2aa3b37ce714"
        },
        outFields: ["NAME", "total_conv", "ahorro_por"],
        title: "Gas Natural Vehicular en Colombia"
      });

      map = new Map({
        basemap: "dark",
        layers: [layerGNV,layer,layerEstaciones]
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
        .when(maintainFixedExtent)
        .then(disablePopupOnClick)
        .then(enableHighlightOnPointerMove);
        //.then(disableNavigation)


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

       /* view.whenLayerView(layerGNV).then(function(layerView) {
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

                    return result.graphic.layer === layersGNV;
                  })[0].graphic;
                  feature.popupTemplate = layer.popupTemplate;
                  id = feature.attributes.ID;
                  highlight = layerView.highlight([id]);
                  var selectionId = mainView.popup.selectedFeature ?
                    mainView.popup.selectedFeature.attributes
                    .ID : null;

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
        });*/
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





















  /*var map;
  require([
  	"esri/Map",
  	//"esri/WebMap",
  	"esri/views/MapView",
  	"esri/layers/FeatureLayer",
  	"esri/widgets/Search",
  	"esri/widgets/Home",
  	"esri/widgets/Locate",
  	"esri/widgets/BasemapToggle",
  	"esri/widgets/ScaleBar",
  	"esri/symbols/SimpleFillSymbol",
  	"esri/renderers/SimpleRenderer",
  	"esri/widgets/LayerList",
  	"esri/widgets/Expand",

  	"esri/widgets/Track",
    "esri/widgets/Legend",
  	"dojo/domReady!"], function(Map,MapView,FeatureLayer,Search,Home,Locate,BasemapToggle,ScaleBar,SimpleFillSymbol,SimpleRenderer,LayerList,
  								Expand,Track,Legend){

    	map = new Map({
      	basemap: "dark-gray",
     	});

  	var view= new MapView({
  		container:"viewMap",
  		map:map,
  		center: [-74, 4],
      	zoom: 5
  	});

  	var template = {
  		title: "Departamento: {DPTO} ",
  		content:"<p>Codigo DANE: {DPTO_DPTO_} </p>"
  	};




  	var dptosRenderer={
    		type:"simple",
    		symbol:{
    			type:"simple-fill",
    			color:"red",
    			width:1,
    			outline:{
    					color: "white",
    					width:1
    			}
    		}

    	};

     	//capa DPTOS
       var divDeptos= new FeatureLayer({
       	url: "http://54.187.22.10:6080/arcgis/rest/services/COLOMBIA/MapServer/2",
       	outFields:["DPTO","DPTO_DPTO_"],
       	opacity: "0.5",

       	popupTemplate: template,
       	renderer: dptosRenderer
       });



       //CAPA CENTROS POBLADOS
       var centrosPoblados= new FeatureLayer({
       	url: "http://54.187.22.10:6080/arcgis/rest/services/COLOMBIA/MapServer/0",
       	opacity: "0.5"
       });
       //rios colombia
       var riosCol= new FeatureLayer({
       	url: "http://services.arcgis.com/deQSb0Gn7gDPf3uV/arcgis/rest/services/Rios_Principales_Colombia/FeatureServer/0",
       	opacity: "0.55",
        popupTemplate: {
          title: "Río: {Name}",
          content: "longitud: {Shape_Leng}"

        }
       });



      var search = new Search({
    			view:view,
    			allPlaceholder: "búsqueda rápida"
    		});

    	view.ui.add(search,{
  		position:"top-left",
  		index:0
    	});

    	var HomeButton= new Home({
    		view:view
    	});
    	view.ui.add(HomeButton, "top-left");

    	var LocateButton=new Locate({
    		view:view
    	});
    	view.ui.add(LocateButton,"top-left");

    	var basemapTo=new BasemapToggle({
    		view:view,
    		nextBasemap: "satellite"
    	});
    	view.ui.add(basemapTo,"top-right");

    	var scale=new ScaleBar({
    		view:view,
    		unit: "dual"
    	});
    	view.ui.add(scale,{
    		position:"bottom-left"
    	});

    var layerlst= new LayerList({
    	container:document.createElement("div"),
    	view:view
    });

    layerlstExpand=new Expand({
    	expandIconClass:"esri-icon-left-triangle-arrow",
    	view:view,
    	content: layerlst.domNode
    });

    var legend = new Legend({
              view: view,
              layerInfos: [{
                layer: divDeptos,
                title: "Departamentos"
              },
              {layer: riosCol,
                title: "rios"
              }]
            });
    var legendRios = new Legend({
              view: view,
              layerInfos: [{
                layer: riosCol,
                title: "Rios"
              }]
            });
     view.ui.add(legend, "bottom-right");

    view.ui.add(layerlstExpand,"top-right");
    /*view.ui.add(layerlst,{
    	position:"top-left"
    });

    	var track= new Track({
    		view:view
    	});
    	view.ui.add(track, "top-right");

    	map.add(divDeptos);
    	map.add(centrosPoblados);
    	map.add(riosCol);

    	//IMPRESION
    	/*view.then(function(){
    		var print= new Print({
    			container:"export",
    			view:view,
    			printServiceUrl:"https://utility.arcgisonline.com/rest/services/Utilities/PrintingTools/GPServer/Exportt%20Web%20Map%20Task"
    		});

    		var printExpand= new Expand({
    			expandIconClass:"esri-icon-left-triangle-arrow",
    			view:view,
    			content:print.domNode
    		});
    		view.ui.add(print);
    	});*/
