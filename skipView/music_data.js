//D3 globals to be modified in the view
var margin = {top: 20, right: 50, bottom: 20, left: 70};
//For nice x axis formatting
var xOffset = 0;

var width = 900 - margin.left - margin.right,
    height = 600  - margin.top - margin.bottom;

var xScale = d3.time.scale().range([0, width]);

var yScale = d3.scale.linear()
    .range([height, 0]);

var userData = [];

var xAxis = d3.svg.axis()
  .scale(xScale)
  .tickSize(-height)
  .tickPadding(8)
  .ticks(d3.time.weeks, 2)
  .tickFormat(d3.time.format('%b %d %Y'))
  .orient("bottom");

//TODO:: Add labels for the y-axis
var yAxis = d3.svg.axis()
  .scale(yScale)
  .tickSize(-width)
  .tickPadding(0)
  .orient("left");

//Async loader used by d3, kind of like promises
queue()
  .defer(d3.csv,"/data/user1.csv")
  .defer(d3.csv,"/data/user2.csv")
  .await(ready);


//TODO:: Add zoom for the x axis (time)
// var zoom = d3.behavior.zoom()
//               .x(xScale)
//               // .y(yScale)
//               .scaleExtent([0, 100])
//               .on("zoom", zoom);

// function zoom() {
//   d3.select(".x.axis").call(xAxis);
//  // d3.select(".y.axis").call(yAxis);

//   // d3.selectAll(".skip-circle")
//   //     .attr("transform", transform);
// }


d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

function filterElement(d){
  //We want skips with values for the facets we are considering (to be y-axis values)
  if(parseInt(d.milliseconds_played) <= 30000 
      && d.danceability_score !== "null"
      && d.valence_score !== "null"
      && d.familiarity_score !== "null"
      && d.familiarity_score !== "null"
      && d.song_tempo !== "null"
      && d.runnability !== "null"
      && d.energy !== "null"
      && d.popularity_normalized !== "null"){
  
        return true;
  }

  else{
    return false;
  }
}

function formatValues(d){
  //Date formatting 
  //http://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
  var date = new Date(parseInt(d.timestamp)*1000);

  //Don't include unwanted values when assigning new data object
  var obj = {
    album_name:d.album_name,
    artist_name:d.artist_name,
    track_name:d.track_name,
    platform:d.platform,
    city:d.city,
    milliseconds_played:parseInt(d.milliseconds_played),
    danceability_score:parseFloat(d.danceability_score),
    energy:parseFloat(d.energy),
    familiarity_score:parseFloat(d.familiarity_score),
    popularity_normalized:parseFloat(d.popularity_normalized),
    runnability: parseFloat(d.runnability),
    song_tempo:parseFloat(d.song_tempo),
    valence_score:parseFloat(d.valence_score),
    timestamp_obj:date,
    timestamp_hours:date.getHours(),
    timestamp_mins:date.getMinutes()
  }

  return obj;
}

function cleanDataSet(dataSet){
  var filteredDataSet = dataSet.filter(filterElement);
  return filteredDataSet.map(formatValues);
}

function updateInfoPane(d){

  d3.select("#song_name").text("Track Name: "+d.track_name);
  d3.select("#song_album").text("Album Name: "+d.album_name);
  d3.select("#song_artist").text("Artist Name: "+d.artist_name);
  d3.select("#timestamp").text("Time Played: "+d.timestamp_obj.toString());
  d3.select("#platform").text("Platform: "+d.platform);
  d3.select("#danceability_score").text("Danceability: "+d.danceability_score);
  d3.select("#song_tempo").text("Song Tempo: "+d.song_tempo+" BPM");
  d3.select("#energy").text("Energy: "+d.energy);
  d3.select("#familiarity_score").text("Familiarity: "+d.familiarity_score);
  d3.select("#runnability").text("Runnability: "+d.runnability);
  d3.select("#valence_score").text("Valence: "+d.valence_score);

  d3.select(".info-pane").transition().duration(800).style("opacity",1);

}

function click(d){

  d3.selectAll(".skip-circle")
    .style("fill","steelblue")
    .style("border","none")
    .style("stroke-width","0px");

  d3.select(this)
    .moveToFront()
    .style("fill","red")
    .style("stroke","black")
    .style("stroke-width","2px");


  updateInfoPane(d);

}

function updateChart(element){
  createVisual(userData[parseInt(d3.select(".user-select")[0][0].value)],
                  d3.select(".facet-select")[0][0].value);
}

function createVisual(data,facet){
  //TODO:: use the update pattern here, but for now, just remove and re-add the graph
  d3.select(".chart-container").remove();
  d3.select(".info-pane").style("opacity",0);

  var container = d3.select("body")
      .append("div")
      .attr("class", "chart-container");

  container.append("h2")
    .text("The Science of Skips");
  container.append("h4")
    .text("Plotted below are all of a user's skipped tracks with respect to time (x-axis) and a variable measure (y-axis)")
  container.append("h4")
    .text("Select a user's data set and a y-axis value to plot skips over the last 3 months");
  container.append("h4")
    .text("Click on a speficic circle to learn more about that skip");

  //Must correct the domain of our scales
  xScale.domain(d3.extent(data,function(d){return +d.timestamp_obj}));
  yScale.domain(d3.extent(data,function(d){return d[facet];}));

  //Boilerplate D3 stuff
  var svg = container.append("svg")
      .attr("id","svg-container")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
     // .call(zoom);

  //Append the x and y axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (height) + ")")
      .call(xAxis);
  
  svg.append("g").attr("class", "y axis").call(yAxis);

  //Draw our circles with respect to the scales (x&y)
  var circles = svg.selectAll("g")
                  .data(data)
                  .enter()
                  .append("circle")
                  .attr("class","skip-circle")
                  .attr("r",5)
                  .attr("transform",function(d){return"translate("+xScale(d.timestamp_obj)+","+yScale(d[facet])+")";})
                  .style("fill","steelblue")
                  .on("click",click);
}


function ready(err, data1, data2){
  userData.push(cleanDataSet(data1));
  userData.push(cleanDataSet(data2));
  createVisual(userData[0],"danceability_score");
}