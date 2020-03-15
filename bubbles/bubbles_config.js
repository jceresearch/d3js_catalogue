settings=
{
    "version":"1.00",
    "installpath":"js/plugins/bubbles/",
    "emailapi":{
    "gateway":"jc@uwl.ac.uk",
    "key":""},
    "apiusername":"testUser",
    "apipassword":"testPass",
    "apiserver":"../api/v1/",
    "bubble_size_modes": [
    [6, 6, 0],
    [8, 8, 0],
    [4, 20, 1],
    [8, 30, 1]
],
   "canvas_size_modes" :[
    [400, 400],
    [600, 500],
    [700, 600],
    [800, 600],
    [900, 500]
],
    
    "fields": {
    "version": {"fieldname":"version","label":"Version","type":"integer", "isDimension":false, "rangeStart":1,"rangeEnd":9999},    
    "flagoldversion":  {"fieldname":"flagoldversion", "label":"Is Old version","type":"boolean", "isDimension":false}, 
    "instanceguid": {"fieldname":"instanceguid","label":"Instance GUID","type":"string", "isDimension":false},  
    "prevguid": {"fieldname":"prevguid","label":"prev GUID","type":"string", "isDimension":false},  
    "nextguid": {"fieldname":"nextguid","label":"next GUID","type":"string", "isDimension":false},
    "guid": {"fieldname":"guid","label":"GUID","type":"string", "isDimension":false},    
    "createdts":  {"fieldname":"createdts", "label":"Creation timestamp","type":"integer", "isDimension":false},
    "status_update": {"fieldname":"status_update","label":"Status Update","type":"string", "isDimension":false},
    "userid": {"fieldname":"userid","label":"Status Update","type":"string", "isDimension":false},
    "flaginactive":  {"fieldname":"flaginactive", "label":"Is Closed","type":"boolean", "isDimension":true},
    "flagdeleted":  {"fieldname":"flagdeleted", "label":"Is Deleted","type":"boolean", "isDimension":false},
    "threat":  {"fieldname":"threat", "label":"Threat","type":"string", "isDimension":true},
    "rag": {"fieldname":"rag", "label":"RAG Compliance","type":"string", "isDimension":true},
    "level": {"fieldname":"level","label":"Level","type":"string", "isDimension":true},
    "owner": {"fieldname":"owner", "label":"Owner","type":"string", "isDimension":true},
    "likelihood": {"fieldname":"likelihood","label":"Likelihood","type":"integer", "isDimension":true, "rangeStart":1,"rangeEnd":5},
    "impact": {"fieldname":"impact" ,"label":"Impact","type":"integer", "isDimension":true, "rangeStart":1,"rangeEnd":5},
    "risklxi": {"fieldname":"risklxi" ,"label":"Lik x Imp","type":"integer", "isDimension":true, "rangeStart":1,"rangeEnd":25},
    "ragremediation": {"fieldname":"ragremediation" ,"label":"RAG Remediation","type":"string", "isDimension":true},
    "updatetemperature": {"fieldname":"updatetemperature" ,"label":"Update Temp.","type":"integer", "isDimension":true, "rangeStart":1,"rangeEnd":100},
    "temperature": {"fieldname":"temperature" ,"label":"Overall Heat","type":"integer", "isDimension":true, "rangeStart":1,"rangeEnd":100},
    "timestampcreated": {"fieldname":"timestampcreated" ,"label":"Created On","type":"date", "isDimension":true},
    "timestampupdated":{"fieldname":"timestampupdated" ,"label":"Updated On","type":"date", "isDimension":true},
    "timestampclosed": {"fieldname":"timestampclosed" ,"label":"Closed On","type":"date", "isDimension":true},
    "drilldownlevel": {"fieldname":"drilldownlevel" ,"label":"Drill Down","type":"integer", "isDimension":true,"rangeStart":1,"rangeEnd":4},
    "status": {"fieldname":"status" ,"label":"Status","type":"string", "isDimension":true},
    "title":{"fieldname":"title" ,"label":"Title","type":"string", "isDimension":false},
    "description":{"fieldname":"description" ,"label":"Description","type":"string", "isDimension":false},
    "label":{"fieldname":"label" ,"label":"Label","type":"string", "isDimension":false},
    "last_update":{"fieldname":"last_update" ,"label":"Last Update","type":"string", "isDimension":false},
    "last_update_on":{"fieldname":"last_update_on" ,"label":"Updated on","type":"date", "isDimension":false},
    "last_update_by":{"fieldname":"last_update_by" ,"label":"Updated by","type":"string", "isDimension":false},
    "ref":{"fieldname":"ref" ,"label":"Ref","type":"string", "isDimension":false},
    "tags":{"fieldname":"tags" ,"label":"Tags","type":"array", "isDimension":false},
    "updates":{"fieldname":"updates" ,"label":"Updates","type":"array", "isDimension":false}
        
    },


"dimensionx":["likelihood"], 
"dimensiony":["impact"],
"dimensionz":["drilllevel","updateaging"],
"dimensionpointsize":["risklxi", "updatetemperature"],
"dimensionpointcolour":["threat","owner","rag","level","status","risklxi"],
"dimensiongroup":["threat","owner","rag","level","status"],
"dimensiontime":["timestampcreated","timestampupdated","timestampclosed"],
"dimensiondetail":["drilldownlevel"],
"dimensiontransparency":["updatetemperature"],
"labelfields":["label","ref","rag","owner","risklxi"],
"geolocationfields":[],
"updatelogfields":["updates"],
"dimensionprefilter":["flaginactive"],

"detailfields":["title","owner","ref","description","last_update","last_update_on","last_update_by", "likelihood","impact","status","rag"],
"views":{
        "riskmap":{"label":"Risk Map", "function":"arrangeriskmap"},
        "groupby":{"label":"Group by","function":"arrangeblobsbydimension"},
        "pie":{"label":"Pie by","function":"arrangebigblobbydimension"}
        
   },



"legend": {    

        "threat": {
            "operational": "Operational",
            "disaster": "Disaster",
            "third party": "Third Party",
            "malicious": "Malicious"
        },
        "rag": {
            "red": "Red",
            "amber": "Amber",
            "green": "Green"
        },
        "level": {
            "vce": "VCE",
            "itstrapp": "ITStraPP",
            "itm": "ITMT",
            "smog": "SMOG"
        },
        "status": {
            "open": "Open",
            "closed": "Closed"
        }   
  
    },
 

"colorscheme": {
        "threat": {
            "operational": "#a6611a",
            "disaster": "#DFC27D",
            "third party": "#80CDC1",
            "malicious": "#018571"
        },
        "rag": {
            "red": "#FF0000",
            "amber": "#ffff99",
            "green": "#00CC00"
        },
        "level": {
            "vce": "#67a9cf",
            "itstrapp": "#EF8A62",
            "itm": "#0080FF",
            "smog": "#2166AC"
        },
        "status": {
            "open": "#FF0000",
            "closed":"#00CC00"
        }
    }
};
