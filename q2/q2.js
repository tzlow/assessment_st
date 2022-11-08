var app = Vue.createApp({
    
    // Data Properties
    data() {
        return {
            title: "", 
            selected_area: "Ang Mo Kio",
            show_area: false,
            areas: [],

            output: "",
        }
    },
    mounted() {
        console.log("=== [START] display_area ===");
        now = new Date();

        var nowStr = now.toISOString();
        nowDate = nowStr.slice(0, 10);

        axios.get("https://api.data.gov.sg/v1/environment/2-hour-weather-forecast?data=" + encodeURIComponent(nowDate))
            .then(response => {
                var obj = response.data;

                for (var i = 0; i < obj.area_metadata.length; i++) {
                    var area = obj.area_metadata[i].name;
                    this.areas.push(area);
                }
            })
        console.log("=== [START] display_area ===");

    },
    methods: {
        
        check_weather() {
            console.log("=== [START] check_weather() ===");

            this.show_area = true;
            
            now = new Date();

            var nowStr = now.toISOString();
            nowDate = nowStr.slice(0, 10);

            this.title = 'Next 2-Hour Weather Forecast on ' + nowDate;

            axios.get("https://api.data.gov.sg/v1/environment/2-hour-weather-forecast?data=" + encodeURIComponent(nowDate))
                .then(response => {
                    var obj = response.data;

                    // header row
                    let thead_rows = document.getElementById("thead-tr");
                    thead_rows.innerHTML = `<th scope="col">Area</th>`;

                    // convert the response to area - [ forecasts... ]
                    let area_forecasts = {};
                    let prev_start = "";
                    for (item of obj.items) {
                        var valid_period = item.valid_period;

                        // header row
                        let cur_start = getTimePart(valid_period.start);
                        // there are multiple forecasts at the start time slots
                        if (cur_start != prev_start) {

                            let th = document.createElement('th');
                            th.scope = 'col';
                            let text = document.createTextNode(cur_start + "-" + getTimePart(valid_period.end));
                            th.appendChild(text);
                            thead_rows.appendChild(th);
                        }

                        // convert the response to area - [ forecasts... ]
                        var forecasts = item.forecasts;
                        for (forecast of forecasts) {
                            let area = forecast.area;
                            if (this.selected_area == area) {
                                if (!area_forecasts.hasOwnProperty(area)) {
                                    area_forecasts[area] = [];
                                }
    
                                // there are multiple forecasts at the start time slots
                                // take the last one
                                if (cur_start != prev_start) {
                                    area_forecasts[area].push(forecast.forecast);
                                } else {
                                    let last = area_forecasts[area].length - 1;
                                    area_forecasts[area][last] = forecast.forecast;
                                }
                            }
                        }

                        // there are multiple forecasts at the start time slots
                        prev_start = cur_start;

                    }


                    // content rows
                    let tbody = document.getElementById("tbody");
                    tbody.innerHTML = "";

                    // for each row: location, the forecasts 
                    for (area in area_forecasts) {

                        let tr = document.createElement('tr');
                        tbody.appendChild(tr);

                        // column 1 - area label
                        let th = document.createElement('th');
                        th.setAttribute('scope', 'col');
                        th.textContent = area;
                        tr.appendChild(th);


                        let colspan = 1;
                        let forecast_arr = area_forecasts[area];
                        let len = forecast_arr.length;
                        for (i = 0; i < len; i++) {
                            let forecast = forecast_arr[i];

                            if (forecast.includes("Partly Cloudy")) {
                                forecast = "Partly Cloudy";
                            }

                            if (i == (len - 1) || !forecast_arr[i + 1].includes(forecast)) {
                                let td = document.createElement('td');
                                td.setAttribute('colspan', colspan);
                                td.appendChild(document.createTextNode(forecast));
                                tr.appendChild(td)

                                colspan = 1;
                            } else {
                                colspan++;
                            }
                        }

                    }
                })
                .catch(error => {
                    this.output = error.message;
                })
            console.log("=== [END] display_area ===");

        }
    }
})

app.mount("#root")