require([
    "esri/WebMap",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/widgets/Legend",
    "esri/widgets/Expand",
    "esri/smartMapping/labels/clusters",
    "esri/smartMapping/popup/clusters",
    "esri/core/promiseUtils"
  ], function (
    Map,
    MapView,
    FeatureLayer,
    Legend,
    Expand,
    clusterLabelCreator,
    clusterPopupCreator,
    promiseUtils
  ) {
    const serviceUrl =
      "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Places_of_Worship_India/FeatureServer/0";
    const layer = new FeatureLayer({
      url: serviceUrl,
      title: "Places of worship",
      outFields: ["name", "religion", "denomination"],
      popupTemplate: {
        title: "{name}",
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "religion"
              },
              {
                fieldName: "denomination"
              }
            ]
          }
        ]
      }
    });

    const map = new Map({
      basemap: "gray-vector",
      layers: [layer]
    });

    const view = new MapView({
      container: "viewDiv",
      map: map,
      center: [80.20127, 22.12355],
      zoom: 4
    });

    const legend = new Legend({
      view: view,
      container: "legendDiv"
    });

    const infoDiv = document.getElementById("infoDiv");
    view.ui.add(
      new Expand({
        view: view,
        content: infoDiv,
        expandIconClass: "esri-icon-layer-list",
        expanded: true
      }),
      "top-right"
    );

    layer
      .when()
      .then(generateClusterConfig)
      .then(function (featureReduction) {
        layer.featureReduction = featureReduction;

        const toggleButton = document.getElementById("toggle-cluster");
        toggleButton.addEventListener("click", toggleClustering);

        // To turn off clustering on a layer, set the
        // featureReduction property to null
        function toggleClustering() {
          if (isWithinScaleThreshold()) {
            let fr = layer.featureReduction;
            layer.featureReduction =
              fr && fr.type === "cluster" ? null : featureReduction;
          }
          toggleButton.innerText =
            toggleButton.innerText === "Enable Clustering"
              ? "Disable Clustering"
              : "Enable Clustering";
        }

        view.whenLayerView(layer).then(function (layerView) {
          const filterSelect = document.getElementById("filter");
          // filters the layer using a definitionExpression
          // based on a religion selected by the user
          filterSelect.addEventListener("change", function (event) {
            const newValue = event.target.value;

            const whereClause = newValue
              ? "religion = '" + newValue + "'"
              : null;
            layerView.filter = {
              where: whereClause
            };
            // close popup for former cluster that no longer displays
            view.popup.close();
          });
        });

        view.watch("scale", function (scale) {
          if (toggleButton.innerText === "Disable Clustering") {
            layer.featureReduction = isWithinScaleThreshold()
              ? featureReduction
              : null;
          }
        });
      })
      .catch(function (error) {
        console.error(error);
      });

    function isWithinScaleThreshold() {
      return view.scale > 50000;
    }

    function generateClusterConfig(layer) {
      // generates default popupTemplate
      const popupPromise = clusterPopupCreator
        .getTemplates({
          layer: layer
        })
        .then(function (popupTemplateResponse) {
          return popupTemplateResponse.primaryTemplate.value;
        });

      // generates default labelingInfo
      const labelPromise = clusterLabelCreator
        .getLabelSchemes({
          layer: layer,
          view: view
        })
        .then(function (labelSchemes) {
          return labelSchemes.primaryScheme;
        });

      return promiseUtils
        .eachAlways([popupPromise, labelPromise])
        .then(function (result) {
          const popupTemplate = result[0].value;

          const primaryLabelScheme = result[1].value;
          const labelingInfo = primaryLabelScheme.labelingInfo;
          // Ensures the clusters are large enough to fit labels
          const clusterMinSize = primaryLabelScheme.clusterMinSize;

          return {
            type: "cluster",
            popupTemplate: popupTemplate,
            labelingInfo: labelingInfo,
            clusterMinSize: clusterMinSize
          };
        })
        .catch(function (error) {
          console.error(error);
        });
    }
  });