require([
  "esri/Map",
  "esri/views/MapView",
  'esri/layers/CSVLayer',
  'esri/widgets/Expand'
], function (
  Map,
  MapView,
  CSVLayer,
  Expand
) {

  const clusterConfig = {
    type: "cluster",
    popupTemplate: {
      content: [
        {
          type: "text",
          text:
            // "This cluster represents <b>{cluster_count}</b> PCRO Site with an average spend of <b>${cluster_avg_Cost30Yr}</b>.<br><br>" +
            // "The PCRO Sites in this cluster has total of <b>${expression/total-cost}</b> spend over a 30-year period."
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


  const pcroSpend = new CSVLayer({
    url: "http://old.c2rem.com/test/assets/PCROSpend.csv",
    title: "PCRO Project Spend",
    outFields: ["Name", "SiteID", "LobSub", "Cost30Yr", "State"],
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
              fieldName: "LobSub",
              label: "Business Unit & Facility Type"
            },
            {
              fieldName: "Cost30Yr",
              label: "30 Yr Cost $",
              format: {
                places: 0,
                digitSeparator: true
              }
            },
            {
              fieldName: "State"
            }
          ]
        }
      ]
    },
    featureReduction: clusterConfig
  });

  const map = new Map({
    basemap: "topo",
    layers: [pcroSpend]
  });

  const view = new MapView({
    container: "webmap",
    map: map,
    center: [-118, 34],
    zoom: 11
  });

  const widgetDiv = document.getElementById("widgetDiv");
  view.ui.add(
    new Expand({
      view: view,
      content: widgetDiv,
      expandIconClass: 'esri-icno-layer-list',
      expanded: true
    }),
    "top-right"
  )

  pcroSpend
    .when()
    .then(function () {

      const renderer = pcroSpend.renderer.clone()
      renderer.visualVariables = [
        {
          type: "color",
          field: "Cost30Yr",
          stops: [{
            value: 1,
            color: "orange"
          }
          ]
          // // normalizationField: "expression/total-cost",
          // stops: [
          //   {
          //     value: 100000000, // features where < 10% of the pop in poverty
          //     color: "#FFFCD4", // will be assiged this color (beige)
          //     label: "10% or lower" // label to display in the legend
          //   },
          //   {
          //     value: 1000000000, // features where > 30% of the pop in poverty
          //     color: "#350242", // will be assigned this color (purple)
          //     label: "50% or higher" // label to display in the legend
          //   }
          // ]
          // minSize: "16px",
          // maxSize: "50px",
          // minDataValue: 100000,
          // maxDataValue: 5000000
        }
      ]

      pcroSpend.renderer = renderer
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



    })
    .catch(err => {
      console.error(err)
    })

}
);