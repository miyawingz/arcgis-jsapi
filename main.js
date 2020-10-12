require([
  "esri/Map",
  "esri/views/MapView",
  'esri/layers/CSVLayer',
  'esri/widgets/Expand',
  'esri/widgets/Legend'
], function (
  Map,
  MapView,
  CSVLayer,
  Expand,
  Legend
) {

  const clusterConfig = {
    type: "cluster",
    popupTemplate: {
      content: [
        {
          type: "text",
          text:
            "This cluster represents <b>{cluster_count}</b> PCRO Site with a total spend of <b>${expression/total-cost}</b> over a 30-year period."
        }
      ],
      fieldInfos: [
        {
          fieldName: "cluster_count",
          format: {
            places: 0,
            digitSeparator: true
          }
        },
        {
          fieldName: "cluster_avg_Cost30Yr",
          format: {
            places: 0,
            digitSeparator: true
          }
        },
        {
          fieldName: "expression/total-cost",
          format: {
            places: 0,
            digitSeparator: true
          }
        }
      ],
      expressionInfos: [
        {
          name: "total-cost",
          title: "Total Spend",
          expression:
            "$feature.cluster_avg_Cost30Yr * $feature.cluster_count"
        }
      ]
    },
    clusterRadius: "100px",
    labelsVisible: true,
    labelingInfo: [
      {
        symbol: {
          type: "text",
          haloColor: "burlywood",
          haloSize: "1px",
          color: "black",
          font: {
            family: "Noto Sans",
            size: "12px"
          }
        },
        labelPlacement: "center-center",
        deconflictionStrategy: "none",
        labelExpressionInfo: {
          expression: `
          var count = Text($feature.cluster_count, '#,### Sites')
          var spendValue = $feature.cluster_avg_Cost30Yr * $feature.cluster_count / 1000000
          var spend = Text( spendValue, '#,###.## M')
          count+TextFormatting.NewLine + spend          
          `,
        },
        minScale: 0,
        maxScale: 1000000.1
      },
      {
        symbol: {
          type: "text",
          haloColor: "burlywood",
          haloSize: "1px",
          color: "black",
          font: {
            family: "Noto Sans",
            size: "12px"
          }
        },
        labelPlacement: "center-center",
        labelExpressionInfo: {
          expression: "Text($feature.cluster_count, '#,###')"
        },
        minScale: 1000000,
        maxScale: 0
      }

    ]
  };

  const rendererUnique = {
    type: "unique-value",
    field: "LobSub",
    defaultSymbol: {
      type: "simple-marker",
      size: 4,
      color: "white"
    },
    uniqueValueInfos: [
      {
        value: "PCRO Retail",
        symbol: {
          type: "simple-marker",
          color: "green",
          size: 4
        }
      },
      {
        value: "PCRO Chemicals",
        symbol: {
          type: "simple-marker",
          color: "yellow",
          size: 4
        }
      },
      {
        value: "PCRO Manufacturing Refining",
        symbol: {
          type: "simple-marker",
          color: "red",
          size: 4
        }
      },
      {
        value: "PCRO Lubricants",
        symbol: {
          type: "simple-marker",
          color: "blue",
          size: 4
        }
      },
      {
        value: "PCRO Distribution Pipeline",
        symbol: {
          type: "simple-marker",
          color: "orange",
          size: 4
        }
      },
    ]
  };

  const pcroSpend = new CSVLayer({
    url: "http://old.c2rem.com/test/assets/PCROSpend.csv",
    title: "PCRO Project Spend",
    // outFields: ["Name", "SiteID", "Phase", "MultiP", "GeoCode", "PlanetNo", "GSAPID", "SGWPM", "LobSub", "Cost30Yr", "Country", "State"],
    outFields: ["Name", "SiteID", "Phase", "PlanetNo", "SGWPM", "MultiP", "GeoCode", "LobSub", "Cost30Yr", "Country", "State", "GSAPID"],
    popupTemplate: {
      title: "{Name}",
      content: [
        {
          type: "fields",
          fieldInfos: [
            {
              fieldName: "SiteID",
              label: "Site ID"
            },
            {
              fieldName: "Phase"
            },
            {
              fieldName: "LobSub",
              label: "Business Unit & Facility Type"
            },
            {
              fieldName: "PlanetNo",
              label: "Planet No."
            },
            {
              fieldName: "GSAPID",
            },
            {
              fieldName: "SGWPM",
              label: "SGW PM"
            },
            {
              fieldName: "MultiP",
              label: "Multiple Party"
            },
            {
              fieldName: "GeoCode",
              label: "LatLong"
            },
            {
              fieldName: "Country",
            },
            {
              fieldName: "State",
            },
            {
              fieldName: "Cost30Yr",
              label: "30 Yr Cost $",
              format: {
                places: 0,
                digitSeparator: true
              }
            }
          ]
        }
      ]
    }
  });

  const map = new Map({
    basemap: "streets-vector",
    layers: [pcroSpend]
  });


  const view = new MapView({
    container: "webmap",
    map: map,
    center: [-118, 34],
    zoom: 3
  });

  const legend = new Legend({
    view: view,
    container: "legendDiv",
    layerInfos: [{
      layer: pcroSpend,
      title: "Business Unit & Facility"
    }]
  })
  
  const widgetDiv = document.getElementById("widgetDiv");
  view.ui.add(
    new Expand({
      view: view,
      content: widgetDiv,
      expandIconClass: 'esri-icon-layer-list',
      expanded: false
    }),
    "top-right"
  )




  pcroSpend
    .when()
    .then(function () {
      renderVisualCluster();
    })

  view
    .whenLayerView(pcroSpend)
    .then(function (layerView) {
      const filterspend = document.getElementById('filterSpend')
      filterspend.addEventListener("change", function (event) {
        const newValue = event.target.value;
        const whereClause = newValue ?
          `Cost30Yr >=  ${newValue}`
          : null;

        layerView.filter = {
          where: whereClause
        };
        view.popup.close()
      })

      const filterFac = document.getElementById('filterFac')
      filterFac.addEventListener("change", function (event) {
        const newValue = event.target.value;
        const whereClause = newValue ?
          "LobSub ='PCRO " + newValue + "'"
          : null;

        layerView.filter = {
          where: whereClause
        };
        view.popup.close()
      })

      const filterCountry = document.getElementById('filterCountry')
      filterCountry.addEventListener("change", event => {
        const newValue = event.target.value;
        const whereClause = newValue ?
          "Country = '" + newValue + "'"
          : null;

        layerView.filter = {
          where: whereClause
        }

        view.popup.close()
      })


      const filterState = document.getElementById('filterState');
      filterState.addEventListener("change", event => {
        const newValue = event.target.value;
        const whereClause = newValue ?
          "State = '" + newValue + "'"
          : null;

        layerView.filter = {
          where: whereClause
        }

        view.popup.close()
      })

      const toggleBtn = document.getElementById('clusterBtn');
      toggleBtn.addEventListener("click", () => {
        let fr = pcroSpend.featureReduction;
        if (!fr) {
          renderVisualCluster()
        } else {
          pcroSpend.featureReduction = null;
          pcroSpend.legendEnabled = true;
          pcroSpend.renderer = rendererUnique
        }

        toggleBtn.innerText === "Enable Cluster" ? 
        toggleBtn.innerText = "Disable Cluster" 
        : toggleBtn.innerText = "Enable Cluster"
      })

    })
    .catch(err => {
      console.error(err)
    })

  function renderVisualCluster() {
    pcroSpend.featureReduction = clusterConfig;
    pcroSpend.legendEnabled = false;
    const renderer = pcroSpend.renderer.clone()
    renderer.visualVariables = [
      {
        type: "color",
        field: "Cost30Yr",
        stops: [{
          value: 1,
          color: "orange"
        }]
      }
    ]

    pcroSpend.renderer = renderer
  }

});