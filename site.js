require([
    'esri/Map',
    'esri/views/MapView',
    'esri/layers/CSVLayer'
], function (
    Map,
    MapView,
    CSVLayer
) {
    const siteLayer = new CSVLayer({
        url: "http://old.c2rem.com/test/assets/SiteInfo.csv",
        title: "PCRO LA BASIN PROJECTS",
        outFields: ["SITE_ID", "BU_FacType", "Phase", "Address", "Site_Size", "Advocacy", "SPM_name", "SPM_Email", "S_Partner", "Cost_2020", "Cost_2050", "LeadAgency", "AgencyID", "PM_name", "PM_email", "History", "Gen_Cond", "PrimaryCOC", "S_Resp_Pct", "OtherPRPs", "Water", "LatLong", "Link", "pic", "Updated"],
        popupTemplate: {
            title: "{Site_Name}",
            content: [
                {
                    type: "fields",
                    fieldInfos: [
                        {
                            fieldName: "SITE_ID",
                            label: "Site ID"
                        },
                        {
                            fieldName: "Bu_FacType",
                            label: "Business Unit Facility"
                        },
                        {
                            fieldName: "Phase"
                        },
                        {
                            fieldName: "Address"
                        },
                        {
                            fieldName: "Site_Size",
                            label: "Site Size"
                        },
                        {
                            fieldName: "Advocacy"
                        },
                        {
                            fieldName: "SPM_name",
                            label: "Shell PM"
                        },
                        {
                            fieldName: "SPM_Email",
                            label: "Shell PM Email"
                        },
                        {
                            fieldName: "S_Partner",
                            label: "Shell Partner"
                        },
                        {
                            fieldName: "Cost_2020",
                            label: "Cost till 2020 $",
                            format:{
                                places:0,
                                digitSeparator:true
                            }
                        },
                        {
                            fieldName: "Cost_2050",
                            label: "Cost till 2050 $",
                            format:{
                                places:0,
                                digitSeparator:true
                            }
                        },
                        {
                            fieldName: "LeadAgency",
                            label: "Lead Agency"
                        },
                        {
                            fieldName: "PM_name",
                            label: "Agency PM"
                        },
                        {
                            fieldName: "PM_email",
                            label: "Agency PM Email"
                        },
                        {
                            fieldName: "History",
                        },
                        {
                            fieldName: "Gen_Cond",
                            label: "General Condition"
                        },
                        {
                            fieldName: "PrimaryCOC",
                            label: "Primary COC"
                        },
                        {
                            fieldName: "S_Resp_Pct",
                            label: "Shell Percentage"
                        },
                        {
                            fieldName: "OtherPRPs",
                            label: "Other PRPs"
                        },
                        {
                            fieldName: "Water",
                            label: "Water District"
                        },
                        {
                            fieldName: "LatLong",
                        },
                        {
                            fieldName: "Link",
                        },
                        {
                            fieldName: "pic"
                        }
                    ]
                }
            ]
        },
        renderer: {
            type: "simple",
            symbol: {
                type: "simple-marker",
                size: 6,
                color: "green"
            }
        }
    })

    const map = new Map({
        basemap: "topo",
        layers: [siteLayer]
    })

    const view = new MapView({
        container: "webmap",
        map: map,
        center: [-118, 34],
        zoom: 11
    })



})