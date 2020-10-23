var express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { time } = require('console');
const { strict } = require('assert');
var app = express();
const http = require('http').Server(app);

var sensor_data;

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('This is line chatbot app listening...')
})

app.post('/sensor', async(req, res) => {
    if ("Temp" in req.body) {
        console.log("Sensor data uploading...")
        sensor_data = req.body;
        console.log(sensor_data);
        res.sendStatus(200);
        return;
    }
    else {
        res.sendStatus(400);
    }
})

app.post('/chatbot', async(req, res) => {
    if (req.body.queryResult != "undefined") {
        console.log("Chatbot posting...");
        const intent = req.body.queryResult.intent.displayName;
        const time_data = getTimeData();
        console.log("Require intent:", intent);
        
        if (intent == "info") {
            console.log(JSON.stringify(sensor_data));
            res.json(getResponse(intent, time_data, sensor_data));
            return;
        }
        else if (intent == "semi_info") {
          console.log("Room: ", req.body.queryResult.parameters.number);
          res.json(getResponse(intent, time_data, sensor_data, req.body.queryResult.parameters.number));
        }
        else if (intent == "guide_workshop_comp") {
          console.log("Company: ", req.body.queryResult.parameters.company);
          res.json(getResponse(intent, time_data, {}, 0, req.body.queryResult.parameters.company));
        }
        else {
            res.json(getResponse(intent, time_data));
        }

    }
    else {
        res.sendStatus(404);
    }
})

http.listen(3001, () => {
  console.log('Chatbot app listening on port 3001!')
})

function getTimeData() {
    const today = () => {
        const d = new Date();
        const dtf = new Intl.DateTimeFormat('en', { year : 'numeric', month: '2-digit', day: '2-digit'});
        const [{ value : mm},,{ value : dd},,{ value : yy}] = dtf.formatToParts(d);
        return `${yy}-${mm}-${dd}`;
    }
    const d = new Date();
    var hours = d.getHours();
    var apm = "a.m.";
    if (hours >= 12){
        apm = "p.m.";
        hours -= 12;
    }

    const time_data = [today(), hours, d.getMinutes(), apm];
    return time_data;
}

function getResponse(intent, time_data, sensor_data = {}, room_num = 0, company) {
    if (intent == "info") {
        return (
            {
                "fulfillmentMessages":[
                    {
                        "payload":{
                            "line":{
                                "type":"flex",
                                "altText":"TANET傳送了訊息給你",
                                "contents":{
                        "type": "bubble",
                        "body": {
                          "type": "box",
                          "layout": "vertical",
                          "contents": [
                            {
                              "type": "text",
                              "text": "環境資訊",
                              "weight": "bold",
                              "color": "#1DB446",
                              "size": "sm"
                            },
                            {
                              "type": "text",
                              "text": "310會議室",
                              "weight": "bold",
                              "size": "xxl",
                              "margin": "md"
                            },
                            {
                              "type": "text",
                              "text": time_data[0] + "    " +
                                      String(time_data[1]) + ":" +
                                      String(time_data[2]) + " " + 
                                      String(time_data[3]),
                              "size": "xs",
                              "color": "#aaaaaa",
                              "wrap": true
                            },
                            {
                              "type": "separator",
                              "margin": "xxl"
                            },
                            {
                              "type": "box",
                              "layout": "horizontal",
                              "margin": "xxl",
                              "spacing": "sm",
                              "contents": [
                                {
                                  "type": "text",
                                  "text": "人數",
                                  "size": "sm",
                                  "color": "#555555"
                                },
                                {
                                  "type": "text",
                                  "text": String(sensor_data["people"]) + " 人",
                                  "size": "sm",
                                  "color": "#111111",
                                  "align": "end"
                                }
                              ]
                            },
                            {
                              "type": "separator",
                              "margin": "xxl"
                            },
                            {
                              "type": "box",
                              "layout": "vertical",
                              "margin": "xxl",
                              "spacing": "sm",
                              "contents": [
                                {
                                  "type": "box",
                                  "layout": "horizontal",
                                  "contents": [
                                    {
                                      "type": "text",
                                      "text": "溫度",
                                      "size": "sm",
                                      "color": "#555555"
                                    },
                                    {
                                      "type": "text",
                                      "text": String(sensor_data["Temp"]) + " °C",
                                      "size": "sm",
                                      "color": "#111111",
                                      "align": "end"
                                    }
                                  ]
                                },
                                {
                                  "type": "box",
                                  "layout": "horizontal",
                                  "contents": [
                                    {
                                      "type": "text",
                                      "text": "相對濕度",
                                      "size": "sm",
                                      "color": "#555555"
                                    },
                                    {
                                      "type": "text",
                                      "text": String(sensor_data["Hum"]) + " %",
                                      "size": "sm",
                                      "color": "#111111",
                                      "align": "end"
                                    }
                                  ]
                                },
                                {
                                  "type": "box",
                                  "layout": "horizontal",
                                  "contents": [
                                    {
                                      "type": "text",
                                      "text": "氣壓",
                                      "size": "sm",
                                      "color": "#555555"
                                    },
                                    {
                                      "type": "text",
                                      "text": String(sensor_data["P"]) + " mmHg",
                                      "size": "sm",
                                      "color": "#111111",
                                      "align": "end"
                                    }
                                  ]
                                },
                                {
                                  "type": "separator",
                                  "margin": "xxl"
                                },
                                {
                                    "type": "box",
                                    "layout": "vertical",
                                    "margin": "xxl",
                                    "spacing": "sm",
                                    "offsetTop": "1px",
                                    "contents": [
                                {
                                  "type": "box",
                                  "layout": "horizontal",
                                  "contents": [
                                    {
                                      "type": "text",
                                      "text": "CO2",
                                      "size": "sm",
                                      "color": "#555555"
                                    },
                                    {
                                      "type": "text",
                                      "text": String(sensor_data["CO2"]) + " ppm",
                                      "size": "sm",
                                      "color": "#111111",
                                      "align": "end"
                                    }
                                  ]
                                },
                                {
                                  "type": "box",
                                  "layout": "horizontal",
                                  "contents": [
                                    {
                                      "type": "text",
                                      "text": "tVOC(揮發性有機物)",
                                      "size": "sm",
                                      "color": "#555555"
                                    },
                                    {
                                      "type": "text",
                                      "text": String(sensor_data["tVOC"]) + " ppb",
                                      "size": "sm",
                                      "color": "#111111",
                                      "align": "end"
                                    }
                                  ]
                                }]},
                              ]
                            },
                            {
                              "type": "separator",
                              "margin": "xxl"
                            },
                            {
                              "type": "box",
                              "layout": "horizontal",
                              "margin": "md",
                              "contents": [
                                {
                                  "type": "button",
                                  "style": "primary",
                                  "action": {
                                    "type": "message",
                                    "label": "查看其他地點",
                                    "text": "查看其他地點"
                                  }
                                }
                              ]
                            }
                          ]
                        },
                        "styles": {
                          "footer": {
                            "separator": true
                          }
                        }
                      }
                            },
                            "google":{
                              "expectUserResponse": true,
                              "richResponse": {
                                "items": [
                                  {
                                    "simpleResponse":{
                                      "textToSpeech": "以下是3 1 0會議室的環境數據：\n" + 
                                      "溫度:" + sensor_data["Temp"] + "度C\n" +
                                      "相對溼度:" + sensor_data["Hum"] + "%\n" +
                                      "氣壓" + sensor_data["P"] + "mmHg\n" +
                                      "CO2濃度" + sensor_data["CO2"] + "ppm\n" +
                                      "tVOC(揮發性有機物)" +  sensor_data["tVOC"] + "ppb\n"+
                                      "。若要查看其他地點，請說「查看更多環境資訊」",

                                      "displayText": "310會議室\n" + 
                                      "溫度: " + sensor_data["Temp"] + " 度C\n" +
                                      "相對溼度: " + sensor_data["Hum"] + " %\n" +
                                      "氣壓: " + sensor_data["P"] + " mmHg\n" +
                                      "CO2濃度: " + sensor_data["CO2"] + " ppm\n" +
                                      "tVOC(揮發性有機物): " +  sensor_data["tVOC"] + " ppb\n" +
                                      "。若要查看其他地點，請說「查看更多環境資訊」",
                                    }
                                  }
                                ]
                              }
                            }
                        }
                    }
                ]
            }
        );
    }
    else if (intent == "semi_info") {
      return (
        {
            "fulfillmentMessages":[
                {
                    "payload":{
                        "line":{
                            "type":"flex",
                            "altText":"TANET傳送了訊息給你",
                            "contents":{
                    "type": "bubble",
                    "body": {
                      "type": "box",
                      "layout": "vertical",
                      "contents": [
                        {
                          "type": "text",
                          "text": "環境資訊",
                          "weight": "bold",
                          "color": "#1DB446",
                          "size": "sm"
                        },
                        {
                          "type": "text",
                          "text": String(room_num)+"會議室",
                          "weight": "bold",
                          "size": "xxl",
                          "margin": "md"
                        },
                        {
                          "type": "text",
                          "text": time_data[0] + "    " +
                                  String(time_data[1]) + ":" +
                                  String(time_data[2]) + " " + 
                                  String(time_data[3]),
                          "size": "xs",
                          "color": "#aaaaaa",
                          "wrap": true
                        },
                        {
                          "type": "separator",
                          "margin": "xxl"
                        },
                        {
                          "type": "box",
                          "layout": "horizontal",
                          "margin": "xxl",
                          "spacing": "sm",
                          "contents": [
                            {
                              "type": "text",
                              "text": "人數",
                              "size": "sm",
                              "color": "#555555"
                            },
                            {
                              "type": "text",
                              "text": String(sensor_data["people"]) + " 人",
                              "size": "sm",
                              "color": "#111111",
                              "align": "end"
                            }
                          ]
                        },
                        {
                          "type": "separator",
                          "margin": "xxl"
                        },
                        {
                          "type": "box",
                          "layout": "vertical",
                          "margin": "xxl",
                          "spacing": "sm",
                          "contents": [
                            {
                              "type": "box",
                              "layout": "horizontal",
                              "contents": [
                                {
                                  "type": "text",
                                  "text": "溫度",
                                  "size": "sm",
                                  "color": "#555555"
                                },
                                {
                                  "type": "text",
                                  "text": String(sensor_data["Temp"]) + " °C",
                                  "size": "sm",
                                  "color": "#111111",
                                  "align": "end"
                                }
                              ]
                            },
                            {
                              "type": "box",
                              "layout": "horizontal",
                              "contents": [
                                {
                                  "type": "text",
                                  "text": "相對濕度",
                                  "size": "sm",
                                  "color": "#555555"
                                },
                                {
                                  "type": "text",
                                  "text": String(sensor_data["Hum"]) + " %",
                                  "size": "sm",
                                  "color": "#111111",
                                  "align": "end"
                                }
                              ]
                            },
                            {
                              "type": "box",
                              "layout": "horizontal",
                              "contents": [
                                {
                                  "type": "text",
                                  "text": "氣壓",
                                  "size": "sm",
                                  "color": "#555555"
                                },
                                {
                                  "type": "text",
                                  "text": String(sensor_data["P"]) + " mmHg",
                                  "size": "sm",
                                  "color": "#111111",
                                  "align": "end"
                                }
                              ]
                            },
                            {
                              "type": "separator",
                              "margin": "xxl"
                            },
                            {
                                "type": "box",
                                "layout": "vertical",
                                "margin": "xxl",
                                "spacing": "sm",
                                "offsetTop": "1px",
                                "contents": [
                            {
                              "type": "box",
                              "layout": "horizontal",
                              "contents": [
                                {
                                  "type": "text",
                                  "text": "CO2",
                                  "size": "sm",
                                  "color": "#555555"
                                },
                                {
                                  "type": "text",
                                  "text": String(sensor_data["CO2"]) + " ppm",
                                  "size": "sm",
                                  "color": "#111111",
                                  "align": "end"
                                }
                              ]
                            },
                            {
                              "type": "box",
                              "layout": "horizontal",
                              "contents": [
                                {
                                  "type": "text",
                                  "text": "tVOC(揮發性有機物)",
                                  "size": "sm",
                                  "color": "#555555"
                                },
                                {
                                  "type": "text",
                                  "text": String(sensor_data["tVOC"]) + " ppb",
                                  "size": "sm",
                                  "color": "#111111",
                                  "align": "end"
                                }
                              ]
                            }]},
                          ]
                        },
                        {
                          "type": "separator",
                          "margin": "xxl"
                        },
                        {
                          "type": "box",
                          "layout": "horizontal",
                          "margin": "md",
                          "contents": [
                            {
                              "type": "button",
                              "style": "primary",
                              "action": {
                                "type": "message",
                                "label": "查看其他地點",
                                "text": "查看其他地點"
                              }
                            }
                          ]
                        }
                      ]
                    },
                    "styles": {
                      "footer": {
                        "separator": true
                      }
                    }
                  }
                        },
                        "google":{
                          "expectUserResponse": true,
                          "richResponse": {
                            "items": [
                              {
                                "simpleResponse":{
                                  "textToSpeech": "310會議室\n" + 
                                  "溫度:" + sensor_data["Temp"] + "度C\n" +
                                  "相對溼度:" + sensor_data["Hum"] + "%\n" +
                                  "氣壓" + sensor_data["P"] + "mmHg\n" +
                                  "CO2濃度" + sensor_data["CO2"] + "ppm\n" +
                                  "tVOC(揮發性有機物)" +  sensor_data["tVOC"] + "ppb\n",

                                  "displayText": "310會議室\n" + 
                                  "溫度: " + sensor_data["Temp"] + " 度C\n" +
                                  "相對溼度: " + sensor_data["Hum"] + " %\n" +
                                  "氣壓: " + sensor_data["P"] + " mmHg\n" +
                                  "CO2濃度: " + sensor_data["CO2"] + " ppm\n" +
                                  "tVOC(揮發性有機物): " +  sensor_data["tVOC"] + " ppb\n"
                                }
                              }
                            ]
                          }
                        }
                    }
                }
            ]
        }
    );
    }
    else if (intent == "guide_workshop_comp") {
      console.log("hi");
      return JSON.parse(fs.readFileSync(path.resolve(__dirname, "./response/workshop/" + company + ".json"), 'utf8'));
    }
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, "./response/" + intent + ".json"), 'utf8'));
}