var width = 1300;
var height = 725;
var radius = Math.min(width, height) / 2;

var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

var y = d3.scale.pow().exponent(1.1)
    .range([0, radius]);

var color = d3.scale.category20c();

var partition = d3.layout.partition()
    .children(function(d){return d.values;})
    .value(function(d) {return d.milliseconds_played; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");


//Async loader used by d3, kind of like promises
queue()
  .defer(d3.csv,"/data/user1.csv")
  .defer(d3.csv,"/data/user2.csv")
  .await(ready);


function formatDataSet(dataSet){
  var returnArray = [];
  dataSet.forEach(function(d){
    var exists = false;
    //Its a skip, dont include it
    if(parseInt(d.milliseconds_played) > 30000){
      for(var i=0; i<returnArray.length; i++){
        if(returnArray[i].track_name === d.track_name){
          returnArray[i].milliseconds_played += parseInt(d.milliseconds_played);
          exists = true;
          break;
        }
      }

      if(!exists){
        //Take only what we need from the raw dataset and format it properly
        var obj = {
          album_name: d.album_name,
          artist_name: d.artist_name,
          track_name: d.track_name,
          //Milliseconds is never null, so we can facet by that
          milliseconds_played: parseFloat(d.milliseconds_played),
          //These can be null values, will account for that later
          song_year: d.song_year,
          song_tempo: d.song_tempo
        }
        returnArray.push(obj);
      }
    }

  });
  return returnArray;
}

function click(d){
  console.log(d);
}

function nestDataSet(dataSet){
  //Generate hierarchial nest, by artist -> album - > track
  var nest = d3.nest()
            .key(function(d){return d.artist_name;})
            .key(function(d){return d.album_name;})
            //.key(function(d){return d.track_name;})
            .entries(dataSet);
  return {key:"root",values: nest};
}

function createViz(dataset){

 var nodes = partition.nodes(dataset);

  console.log(nodes,nodes[0]);
  svg.selectAll("path")
      .data(partition.nodes(dataset))
    .enter().append("path")
      .attr("d", arc)
      .style("fill", function(d) { return d.children?color(d.key):color(d.parent.key); })
      .on("click", click);
}

function ready(err, user1Data, user2Data){
  var user1Nest = nestDataSet(formatDataSet(user1Data));
  var user2Nest = nestDataSet(formatDataSet(user2Data));

  console.log("user1",user1Nest,"user2",user2Nest);
  createViz(user2Nest)

}