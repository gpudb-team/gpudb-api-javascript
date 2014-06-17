var g = new GPUdb();

//connect to endpoint
g.connect("http://localhost:8080/gadmin/proxy");


//make type schemas
var test_type_one = function() {
this.x = 0.0
this.y = 0.0
this.OBJECT_ID = ""
this.artifact_id = ""
this.timestamp = 10
}

var test_type_two = function() {
this.x = 0.0
this.y = 0.0
this.OBJECT_ID = ""
this.artifact_id = ""
this.timestamp = 0
this.extra = ""
}

//instantiate schemas
var tt  = new test_type_one();
var tt2 = new test_type_two();

//make GPUdb types
var GPUdb_type_one = g.create_type(tt,'POINT','javascript','artifact_id')
var GPUdb_type_two = g.create_type(tt2,'POINT','javascript','artifact_id')
 
//make parent set and child sets
var parent_set = g.create_parent_set("parent_js");
var base_set_one = g.create_set(GPUdb_type_one,parent_set, "child0");
var base_set_two = g.create_set(GPUdb_type_two,parent_set, "child1");
 
base_set_one.push(tt);
base_set_two.push(tt2);

var x_vec = [-180,-180,180,180];
var y_vec = [-90,90,90,-90]; 
var resp = parent_set.bbox(-180,-90,180,90)
var resp2 = parent_set.nai(x_vec,y_vec)


//every operation returns another set object which can chain, if you want access to children you say .children
//each child object is just another regular set that behaves normally
//for(var children in parent_set.bbox(-180,-90,180,90).bbox(-10,-10,10,10).children)
//{}



// or


var filter_map = {};
filter_map["timestamp"] = ["0.0"]
var resp3 = parent_set.filter_by_list(filter_map)
var expr  = "timestamp > y"
var resp4 = parent_set.select(expr)
var resp5 = parent_set.group_by(["x"])
var resp6 = parent_set.histogram("timestamp",0,20,1)
//var resp7 = parent_set.store_group_by("x", resp5.count_map, true, "x")



var x_vec = [-180,-180,180,180];
var y_vec = [-90,90,90,-90]; 
g.register_geofence("test",["parent_js"],"x","y",x_vec, y_vec, "")