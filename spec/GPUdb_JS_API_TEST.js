/* When trying to RUN these tests, the following are needed
	-Download a jasmine framework version. Any framework beyond 2.0
	-Put this file in the SPEC folder ( This is the test code )
	-Put GPUdb_JS_API.js in the SOURCE folder ( This is the code to be tested)
	-Open the SpecRunner.html in a Browser preferably Chrome and Firefox
	-If all is green then GPUdb is passing the tests, but otherwise there
	click on the tests that failed and inspect them.

 */
describe(
		"JAVASCRIPT API TESTING",
		function(){
			var myGPUdb = new GPUdb();
			// change this URL to the URL and port of your GPUdb
			var urlToMyGPUdb = "http://172.30.20.177:9191";
			myGPUdb.connect(urlToMyGPUdb, "write_user", "write_user_password");
			var gPUdb_Registered_Type;
			// make type schemas
			var Point_Type_Schema = function () {
				this.x = 0.0;
				this.y = 0.0;
				this.OBJECT_ID = "";
				this.artifact_id = "";
				this.timestamp = 10;
				this.type = "record";
				this.name = "point";
			};
			describe(
					"GPUdb_JS_API",
					function () {
						it("tests: create the GPUdb Object", function () {
							expect(myGPUdb).not.toBeFalsy();
						});
						/* _connect_state is only 'closed' before it is opened
						it("tests: connection is Closed", function () {
							expect(myGPUdb._connect_state).toEqual("closed"); //this fails, the conection is not closing 
						});
						*/
						it("tests: connection is SETUP to open", function () {
							expect(myGPUdb._connect_state).toEqual("open");
						});
					});
			describe(
					"tests Conncetion: first network call",
					function () {
						var gPUdb_Registered_Type = myGPUdb.registerType(new Point_Type_Schema(), 'POINT', 'javascript', 'artifact_id');
						it("makes a registerType call just to make a network test ", function () {
							expect(gPUdb_Registered_Type).not.toBeFalsy();
						});
					});
			describe(
					"CRUD tests: creating, updating, retrieving, and deleting datasets and data points",
					function () {
						// make type schemas
						var Point_Type_Schema = function () {
							this.x = 0.0;
							this.y = 0.0;
							this.OBJECT_ID = "";
							this.artifact_id = "";
							this.timestamp = 10;
							this.type = "record";
							this.name = "point";
						};
						describe(
								" registerType--registers the type in GPUdb",
								function () {
									it("tests registerType by registering a schema(POINT)",function () {
										var gPUdb_Registered_Type = myGPUdb.registerType(new Point_Type_Schema(), 'POINT', 'javascript', 'artifact_id');
										expect(gPUdb_Registered_Type.semantic_type).toEqual("POINT");
									});
								});
						/* newSet */
						describe(
								" newSet-- creates a dataset",
								function () {
									var point_type_schema = new Point_Type_Schema();
									var parentSetId;
									var setId;
									gPUdb_Registered_Type = myGPUdb.registerType( point_type_schema, 'POINT', 'javascript', 'artifact_id');
									setId = "NoParentSet" + guid();
									parentSetId = null;
									myGPUdb.newSet( gPUdb_Registered_Type, parentSetId, setId);
									it("tests newSet by creating sets of size 0 and with NO parent ", function(){
										expect(myGPUdb.status(setId).sizes[0]).toEqual(0);
									});
									/*
									//commented out because MASTER is not deleted every 20 minutes
									setId = "MASTERChildSet" + guid();
									parentSetId = "MASTER";
									myGPUdb.newSet( gPUdb_Registered_Type, parentSetId, setId);
									it("tests newSet by creating sets of size 0 and with MASTER as its parent ", function(){
										expect(myGPUdb.status(setId).sizes[0]).toEqual(0);
									});
									 */
								});									
						/* Add data points */
						describe(
								" add    :   adds more than one datasets that contain a cross product of (x1,y1) X (x2, y2) where x1,y1,x2,y3 are elements in [1,10]",
								function () {
									var datasetSize;
									var expectedValuesJson = {};
									var point_type_schema = new Point_Type_Schema();
									gPUdb_Registered_Type = myGPUdb.registerType( point_type_schema, 'POINT', 'javascript', ''); 
									for ( var i = 0; i < 4 ; i++){
										var setId =  "test" + guid(); //var setId = //"zTest10Size" + i + "thSet" + guid() ;
										var parentSetId = null;
										myGPUdb.newSet( gPUdb_Registered_Type, parentSetId, setId );
										expectedValuesJson[setId] = 0;
									}
									for (var setIdKey in expectedValuesJson) {
										for (var i = 1; i <= 10; i++) {
											point_type_schema.x = i;
											for( var j = 1; j <= 10;  j++){
												point_type_schema.y = j;
												myGPUdb.add(setIdKey, point_type_schema); 
												expectedValuesJson[setIdKey]++;
											}
										}
									}
									it(" check if the added data set has all the added points" , function(){
										for (var setIdKey in expectedValuesJson) {
											datasetSize = myGPUdb.status( setIdKey ).sizes[0];
											expect( datasetSize ).toEqual( expectedValuesJson[setIdKey] );
										}
									});
								});
						describe("************CRUD**Test*************************************************", function(){});
						describe("The following 100 data points are added in each new set" , function(){});
						describe("-					(1,1)(1,2)(1,3)(1,4)(1,5)(1,6)(1,7)(1,8)(1,9)(1,10)", function(){});
						describe("-					(2,1)(2,2)(2,3)(2,4)(2,5)(2,6)(2,7)(2,8)(2,9)(2,10)", function(){});
						describe("- 				(3,1)(3,2)(3,3)(3,4)(3,5)(3,6)(3,7)(3,8)(3,9)(3,10)", function(){});
						describe("-					(4,1)(4,2)(4,3)(4,4)(4,5)(4,6)(4,7)(4,8)(4,9)(4,10)", function(){});
						describe("-					(5,1)(5,2)(5,3)(5,4)(5,5)(5,6)(5,7)(5,8)(5,9)(5,10)", function(){});
						describe("-					(6,1)(6,2)(6,3)(6,4)(6,5)(6,6)(6,7)(6,8)(6,9)(6,10)", function(){});
						describe("-					(7,1)(7,2)(7,3)(7,4)(7,5)(7,6)(7,7)(7,8)(7,9)(7,10)", function(){});
						describe("-					(8,1)(8,2)(8,3)(8,4)(8,5)(8,6)(8,7)(8,8)(8,9)(8,10)", function(){});
						describe("-					(9,1)(9,2)(9,3)(9,4)(9,5)(9,6)(9,7)(9,8)(9,9)(9,10)", function(){});
						describe("-					(10,1)(10,2)(10,3)(10,4)(10,5)(10,6)(10,7)(10,8)(10,9)(10,10)",function(){}); 
						describe(
								"THIS GROUP OF FUNCTIONS ARE GPUdb API THAT DO FILTERING /n" , 
								function(){
									/*
									 filterSettingsSetter():- This function is called to create some sets in the GPUdb and add the following 100 points
									 (x,y) into more than one set where their setId and their size which is 100 is stored in 
									 expectedValuesJson.
									 (1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8),(1,9),(1,10)
									(2,1),(2,2),(2,3),(2,4),(2,5),(2,6),(2,7),(2,8),(2,9),(2,10)
									(3,1),(3,2),(3,3),(3,4),(3,5),(3,6),(3,7),(3,8),(3,9),(3,10)
									(4,1),(4,2),(4,3),(4,4),(4,5),(4,6),(4,7),(4,8),(4,9),(4,10)
									(5,1),(5,2),(5,3),(5,4),(5,5),(5,6),(5,7),(5,8),(5,9),(5,10)
									(6,1),(6,2),(6,3),(6,4),(6,5),(6,6),(6,7),(6,8),(6,9),(6,10)
									(7,1),(7,2),(7,3),(7,4),(7,5),(7,6),(7,7),(7,8),(7,9),(7,10)
									(8,1),(8,2),(8,3),(8,4),(8,5),(8,6),(8,7),(8,8),(8,9),(8,10)
									(9,1),(9,2),(9,3),(9,4),(9,5),(9,6),(9,7),(9,8),(9,9),(9,10)
									(10,1),(10,2),(10,3),(10,4),(10,5),(10,6),(10,7),(10,8),(10,9),(10,10)
									 */
									preFilterCallsSetter = function( expectedValuesJson, setId){
										var Point_Type_Schema = function () {
											this.x = 0.0;
											this.y = 0.0;
											this.OBJECT_ID = "";
											this.artifact_id = "";
											this.timestamp = 10;
											this.type = "record";
											this.name = "point";
											this.someStringAttribute = "";
										};
										//use the schema to create a type
										var point_type_schema = new Point_Type_Schema();
										//register the type 
										var gPUdb_Registered_Type = myGPUdb.registerType( point_type_schema, 'POINT', 'javascript', ''); 
										var parentSetId = null; // no parent
										//create newset that has no parent, with set id setId and 
										myGPUdb.newSet( gPUdb_Registered_Type, parentSetId, setId );
										//new set has no data points so its expected set size is 0.
										expectedValuesJson[setId] = 0;
										//adding data to the new datasets
										for (var i = 1; i <= 10; i++) {
											point_type_schema.x = i;
											for( var j = 1; j <= 10;  j++){
												point_type_schema.y = j;
												point_type_schema.someStringAttribute = ""+i + " " + j ;
												//add a data point 
												myGPUdb.add(setId, point_type_schema); 
												//increment the expected set size 
												expectedValuesJson[setId]++;
											}
										}
										return expectedValuesJson;
									};
									/* select Bounding Box*/
									describe(
											" boundingBox ",
											function () {
												var expectedValuesJson = {};
												var setId =  "prebbx" + guid(); //create Unique Id 
												expectedValuesJson = preFilterCallsSetter( expectedValuesJson, setId);
												it("tests bounding box by selecting data points that are 0<x<11 and 0<y<11 ",function () {
													var resultSetId = "pstbbx" + guid();
													var response = myGPUdb.boundingBox(setId, 0, 0, 11, 11, "x", "y", null, resultSetId );
													expectedValuesJson[resultSetId] = 100; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
												it("tests bounding box by selecting data points that are -1<x<-0.9 and -1<y<-0.9  ",function () {
													var resultSetId = "pstbbx" + guid();
													var response = myGPUdb.boundingBox(setId, -1, -1, -0.9, -0.9, "x", "y", null, resultSetId );
													expectedValuesJson[resultSetId] = 0; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
												it(" tests bounding box by selecting data points that are 10.1<x<11 and 10.1<y<11 ",function () {
													var resultSetId = "pstbbx" + guid();
													var response = myGPUdb.boundingBox(setId, 10.1, 10.1, 11, 11, "x", "y", null, resultSetId );
													expectedValuesJson[resultSetId] = 0; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
												it("tests bounding box by selecting data points that are 1.9<x<8.1 and 1.9<y<8.1 ",function () {
													var resultSetId = "pstbbx" + guid();
													var response = myGPUdb.boundingBox(setId, 1.9, 1.9, 8.1, 8.1, "x", "y", null, resultSetId );
													expectedValuesJson[resultSetId] = 49; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
											});
									describe(
											" filterByBounds",
											function () {
												var expectedValuesJson = {};
												var setId =  "prefbnds" + guid(); //create Unique Id 
												expectedValuesJson = preFilterCallsSetter( expectedValuesJson, setId);
												it(" tests filterByBounds by putting Lower and Upper bounds 0 < x < 11 ", function () {
													var resultSetId = "pstfbnds" + guid();
													var response = myGPUdb.filterByBounds(setId,resultSetId, 'x', 0, 11 );
													expectedValuesJson[resultSetId] = 100; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
												it(" tests filterByBounds by putting Lower and Upper bounds -1 < x < -0.9 ", function () {
													var resultSetId = "pstfbnds" + guid();
													var response = myGPUdb.filterByBounds(setId,resultSetId, 'x', -1, -0.9 );
													expectedValuesJson[resultSetId] = 0; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
												it(" tests filterByBounds by putting Lower and Upper bounds 10.1 < x < 11 ", function () {
													var resultSetId = "pstfbnds" + guid();
													var response = myGPUdb.filterByBounds(setId,resultSetId, 'x', 10.1, 11 );
													expectedValuesJson[resultSetId] = 0; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
												it(" tests filterByBounds by putting Lower and Upper bounds 1.9 < x < 8.1 ", function () {
													var resultSetId = "pstfbnds" + guid();
													var response = myGPUdb.filterByBounds(setId,resultSetId, 'x', 1.9, 8.1 );
													expectedValuesJson[resultSetId] = 70; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
											});
									describe(
											" filterByList",
											function () {
												var expectedValuesJson = {};
												var setId =  "prefbList" + guid(); //create Unique Id 
												expectedValuesJson = preFilterCallsSetter( expectedValuesJson, setId);
												it(" tests filterByList by selecting x = 3 or 4 and y = 3 or 5 value which should return a set of size 1", function () {
													var resultSetId = "pstfList" + guid();
													var filterList = {};
													filterList[ 'x'] = ['3', '4', ];
													filterList[ 'y'] = ['3', '5'];
													var response = myGPUdb.filterByList(filterList, resultSetId, setId, '');
													expectedValuesJson[resultSetId] = 4; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
												it(" tests filterByList by selecting x = 3 and y = 13 value should return set of size 0", function () {
													var resultSetId = "pstfList" + guid();
													var filterList = {};
													filterList[ 'x'] = ['3'];
													filterList[ 'y'] = ['13'];
													var response = myGPUdb.filterByList(filterList, resultSetId, setId, null);
													expectedValuesJson[resultSetId] = 0; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
											});
									describe(
											" filterByNAI",
											function () {
												var expectedValuesJson = {};
												var setId =  "prefNAI" + guid(); //create Unique Id 
												expectedValuesJson = preFilterCallsSetter( expectedValuesJson, setId);
												it(" tests filterByNAI by selecting s rectangle : x vector [ 0, 0, 0, 0, 0, 0, 0 ]  and y vector [ 0, 0, 0, 0, 0, 0, 0 ]  and check if it contains 0 points", function () {
													var resultSetId = "pstfList" + guid();
													var xVector = [ 0, 0, 0, 0, 0, 0, 0 ] ;
													var yVector = [ 0, 0, 0, 0, 0, 0, 0 ];
													var response = myGPUdb.filterByNai( resultSetId, setId, 'x', 'y', xVector, yVector, '' );
													expectedValuesJson[resultSetId] = 0; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
												it(" tests filterByNAI by selecting s rectangle : x vector [ 2.9, 8.1, 8.1, 4.1, 4.1, 2.9, 2.9 ]  and y vector [ 2.9, 2.9, 8.1, 8.1, 4.1, 4.1, 2.9 ]  and check if it contains 64 points", function () {
													var resultSetId = "pstfList" + guid();
													var xVector = [ 2.9, 8.1, 8.1, 2.9, 2.9 ]; 
													var yVector = [ 2.9, 2.9, 8.1, 8.1, 2.9 ]; 
													var response = myGPUdb.filterByNai( resultSetId, setId, 'x', 'y', xVector, yVector, '' );
													expectedValuesJson[resultSetId] = 36; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
												it(" tests filterByNAI by selecting s rectangle : x vector [ 2.9, 8.1, 8.1, 4.1, 4.1, 2.9, 2.9 ]  and y vector [ 2.9, 2.9, 8.1, 8.1, 4.1, 4.1, 2.9 ]  and check if it contains 64 points", function () {
													var resultSetId = "pstfList" + guid();
													var xVector = [ 2.9, 11, 11, 2.9, 2.9 ]; 
													var yVector = [ 2.9, 2.9, 11, 11, 2.9 ]; 
													var response = myGPUdb.filterByNai( resultSetId, setId, 'x', 'y', xVector, yVector, '' );
													expectedValuesJson[resultSetId] = 64; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
											});
									describe(
											" filterByRadius  NB points are stored interms of degrees 1 degree = 111.1 km",
											function () {
												var expectedValuesJson = {};
												var setId =  "prefRadius" + guid(); //create Unique Id 
												expectedValuesJson = preFilterCallsSetter( expectedValuesJson, setId);
												it(" tests filterByRadius by selecting a center which is a point  these are degrees(x,y)= (2,2) and a radius of 113000 m " +
														"which will contain (2,2), (1,2), (2,1), (2,3), (3,2)", function () {
													var xCenter = 2;
													var yCenter = 2;
													var radius = 113000;
													var resultSetId = "pstfRaduis" + guid();
													var response = myGPUdb.filterByRadius( resultSetId, setId, 'x', 'y', xCenter, yCenter, radius, '' );
													expectedValuesJson[resultSetId] = 5; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
												it(" tests filterByRadius by selecting a center which is a point (x,y)= (-1,-1) and a radius of 113000 m", function () {
													var xCenter = -1;
													var yCenter = -1;
													var radius = 113000;
													var resultSetId = "pstfRaduis" + guid();
													var response = myGPUdb.filterByRadius( resultSetId, setId, 'x', 'y', xCenter, yCenter, radius, '' );
													expectedValuesJson[resultSetId] = 0; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
												it(" tests filterByRadius by selecting a center which is a point (x,y)= (1,1) and a radius of 100 ", function () {
													var xCenter = 1;
													var yCenter = 1;
													var radius = 100 ;
													var resultSetId = "pstfRaduis" + guid();
													var response = myGPUdb.filterByRadius( resultSetId, setId, 'x', 'y', xCenter, yCenter, radius, '' );
													expectedValuesJson[resultSetId] = 1; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
												it(" tests filterByRadius by selecting a center which is a point (x,y)= (-1,-1) and a radius of 1411000 meters", function () {
													var xCenter = -1;
													var yCenter = -1;
													var radius = 14110000;
													var resultSetId = "pstfRaduis" + guid();
													var response = myGPUdb.filterByRadius( resultSetId, setId, 'x', 'y', xCenter, yCenter, radius, '' );
													expectedValuesJson[resultSetId] = 100; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
											});
									describe(
											" filterByString ",
											function () {
												var expectedValuesJson = {};
												var setId =  "prefString" + guid(); //create Unique Id 
												expectedValuesJson = preFilterCallsSetter( expectedValuesJson, setId);
												it(" tests filterByString if the string ' 1 1' is found in 'someStringAttribute' ", function () {
													var mode = "equals";
													var options = ["nocase"];
													var resultSetId = "pstfString" + guid();
													var expression = "1 1"; //this should exist
													var response = myGPUdb.filterByString( expression, mode, options, setId, ['someStringAttribute'], resultSetId );
													expectedValuesJson[resultSetId] = 1; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
												it(" tests filterByString if the string '1 13' is found in 'someStringAttribute' ", function () {
													var mode = "equals";
													var options = ["nocase"];
													var resultSetId = "pstfString" + guid();
													var expression = "1 13"; //this should exist
													var response = myGPUdb.filterByString( expression, mode, options, setId, ['someStringAttribute'], resultSetId );
													expectedValuesJson[resultSetId] = 0; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
												it(" tests filterByString if the string '9' is contained in 'someStringAttribute' ", function () {
													var mode = "contains";
													var options = ["nocase"];
													var resultSetId = "pstfString" + guid();
													var expression = "9"; //this should exist
													var response = myGPUdb.filterByString( expression, mode, options, setId, ['someStringAttribute'], resultSetId );
													expectedValuesJson[resultSetId] = 19; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
												it(" tests filterByString if the string '16' is contained in 'someStringAttribute' ", function () {
													var mode = "contains";
													var options = ["nocase"];
													var resultSetId = "pstfString" + guid();
													var expression = "16"; //this should exist
													var response = myGPUdb.filterByString( expression, mode, options, setId, ['someStringAttribute'], resultSetId );
													expectedValuesJson[resultSetId] = 0; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
												it(" tests filterByString if there is a string that starts_with '9' iin 'someStringAttribute' ", function () {
													var mode = "starts_with";
													var options = ["nocase"];
													var resultSetId = "pstfString" + guid();
													var expression = "9"; //this should exist
													var response = myGPUdb.filterByString( expression, mode, options, setId, ['someStringAttribute'], resultSetId );
													expectedValuesJson[resultSetId] = 10; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
												it(" tests filterByString if the string '999' is found in 'someStringAttribute' ", function () {
													var mode = "starts_with";
													var options = ["nocase"];
													var resultSetId = "pstfString" + guid();
													var expression = "999"; //this should exist
													var response = myGPUdb.filterByString( expression, mode, options, setId, ['someStringAttribute'], resultSetId );
													expectedValuesJson[resultSetId] = 0; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
											});
									describe(
											" filterByValue ",
											function () {
												var expectedValuesJson = {};
												var setId =  "prefString" + guid(); //create Unique Id 
												expectedValuesJson = preFilterCallsSetter( expectedValuesJson, setId);
												it(" tests filterByValue if the string ' 1 1' is found in 'someStringAttribute' ", function () {
													var resultSetId = "pstfValue" + guid();
													var expression = "1 1"; //this should exist
													var response = myGPUdb.filterByValue(setId, 'someStringAttribute', expression, resultSetId);
													expectedValuesJson[resultSetId] = 1; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
											});
									//getSet is no clearly understood ---qeustion- which attribute does it apply the start and the end. what index is it?
									describe(
											" getSet ",
											function () {
												var expectedValuesJson = {};
												var setId =  "prefgetset" + guid(); //create Unique Id 
												expectedValuesJson = preFilterCallsSetter( expectedValuesJson, setId);
												it(" tests getSet by trying to get the 1st 'row'  to the 5th row ", function () {
													var start = 0;
													var end = 4;
													var response = myGPUdb.getSet( setId, start, end );
													expectedValuesJson['response'] = 5; 
													expect(response.length).toEqual( expectedValuesJson['response'] );// checks if GPUdb makes some Asynchronous calls 
												});
												it(" tests getSet by trying to get the -5th 'row'  to the -1st row ", function () {
													var start = 0;
													var end = 99;
													var response = myGPUdb.getSet( setId, start, end );
													expectedValuesJson['response'] = 100; 
													expect(response.length).toEqual( expectedValuesJson['response'] );// checks if GPUdb makes some Asynchronous calls 
												});
											});
									describe(
											" groupBy  ",
											function () {
												var expectedValuesJson = {};
												var setId =  "pregroupby" + guid(); //create Unique Id 
												expectedValuesJson = preFilterCallsSetter( expectedValuesJson, setId);
												it(" tests groupBy by checking the combinations of the the x attribute and y attribute", function () {
													var attributes =[ 'x', 'y' ]; 
													var response = myGPUdb.groupBy( setId, attributes );
													var keyIsMappedToAValue = true;
													var key = null;
													for (var i = 1; i <= 10 && keyIsMappedToAValue; i++) {
														for( var j = 1; j <= 10 && keyIsMappedToAValue;  j++){
															key = ""+i + "," + j ;
															keyIsMappedToAValue = keyIsMappedToAValue && response.count_map[key]!=null;
														}
													}
													expect(response.count_map[key]).not.toBeFalsy();
												});
												it(" tests groupBy by checking the combinations of the the x attribute and someStringAttribute", function () {
													var attributes =[ 'x', 'someStringAttribute' ]; 
													var response = myGPUdb.groupBy( setId, attributes );
													var keyIsMappedToAValue = true;
													var key = null;
													for (var i = 1; i <= 10 && keyIsMappedToAValue; i++) {
														for( var j = 1; j <= 10 && keyIsMappedToAValue;  j++){
															key = ""+i + "," +  i + " " + j ;
															keyIsMappedToAValue = keyIsMappedToAValue && response.count_map[key]!=null;
														}
													}
													expect(response.count_map[key]).not.toBeFalsy();
												});
											});	
									describe(
											" histogram / filterByHistogram ",
											function () {
												var expectedValuesJson = {};
												var setId =  "prefHistorgram" + guid(); //create Unique Id 
												expectedValuesJson = preFilterCallsSetter( expectedValuesJson, setId);
												it(" tests histogram/ filterByHistogram if a histogram is created for all x by grouping in interval of interval 2 ", function () {
													var start = 0.9;
													var end = 10.1;
													var interval = 2;
													var attribute = 'x';
													var response = myGPUdb.histogram( setId, attribute, start, end, interval, '', null, null );
													var numberOfBins = response.counts.length;
													var isStillTrue = true;
													var i = 0;
													for( i = 0 ; i < numberOfBins && isStillTrue ; i++){
														isStillTrue = isStillTrue && response.counts[i]===20;
													}
													i = ( i === numberOfBins )? --i: i; //
													expect(response.counts[i]).toEqual( 20);
												});
												it(" tests histogram/ filterByHistogram if a histogram is created for x in [-5, -1] by grouping in interval of interval 2 but should return 0 bc there exists no 'x' in [-5,-1] ", function () {
													var start = -5;
													var end = -1;
													var interval = 2;
													var attribute = 'x';
													var response = myGPUdb.histogram( setId, attribute, start, end, interval, '', null, null );
													var numberOfBins = response.counts.length;
													var isStillTrue = true;
													var i = 0;
													for( i = 0 ; i < numberOfBins && isStillTrue ; i++){
														isStillTrue = isStillTrue && response.counts[i]===20;
													}
													i = ( i === numberOfBins )? --i: i; //
													expect(response.counts[i]).toEqual( 0);
												});
											});
									describe(
											" maxmin  ",
											function () {
												var expectedValuesJson = {};
												var setId =  "premaxmin" + guid(); //create Unique Id 
												expectedValuesJson = preFilterCallsSetter( expectedValuesJson, setId);
												it(" tests maxmin  by finding the max and min of 'x' attribute ", function () {
													var attribute = 'x';
													var maxX = 10;
													var minX = 1; 
													var response = myGPUdb.maxmin( attribute, setId, '' );
													expect( response['max'] ).toEqual( maxX );
													expect( response['min'] ).toEqual( minX );
												});
												it(" tests maxmin  by finding the max and min of 'y' attribute ", function () {
													var attribute = 'y';
													var maxY = 10;
													var minY = 1; 
													var response = myGPUdb.maxmin( attribute, setId, '' );
													expect( response['max'] ).toEqual( maxY);
													expect( response['min'] ).toEqual( minY );
												});
											});
									describe(
											" select ",
											function () {
												var expectedValuesJson = {};
												var setId =  "preSelect" + guid(); //create Unique Id 
												expectedValuesJson = preFilterCallsSetter( expectedValuesJson, setId);
												it(" tests select by restricting 'x' attribute is greater 4.9, which should 60 returns points alone ", function () {
													var expression = "(x > 4.9);";
													var resultSetId = "pstSelect" + guid();
													var response = myGPUdb.select( expression, resultSetId, setId, '' );
													expectedValuesJson[resultSetId] = 60; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
												it(" tests select by restricting 'x' > 9.9 && y > 9.9 and should return 1 ", function () {
													var expression = "((x > 9.9) and (y > 9.9));";
													var resultSetId = "pstSelect" + guid();
													var response = myGPUdb.select( expression, resultSetId, setId, '' );
													expectedValuesJson[resultSetId] = 1; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
												it(" tests select by restricting 'x' > 8.9 and y > 8.9  and x != 9 && y != 9 and should return 1 ", function () {
													var expression = "((x > 9.9) and (y > 9.9) and ( x != 9) and (y != 9));";
													var resultSetId = "pstSelect" + guid();
													var response = myGPUdb.select( expression, resultSetId, setId, '' );
													expectedValuesJson[resultSetId] = 1; 
													var sizeOfTheNewSetFromGPUdb = myGPUdb.status(resultSetId).sizes[0];
													expect(response.count).toEqual( expectedValuesJson[resultSetId] );// checks if GPUdb makes some Asynchronous calls 
													expect(sizeOfTheNewSetFromGPUdb).toEqual( expectedValuesJson[resultSetId] );
												});
											});
									describe(
											" setInfo ",
											function () {
												var expectedValuesJson = {};
												var setId =  "preSetInfo" + guid(); //create Unique Id 
												preFilterCallsSetter( expectedValuesJson, setId);
												var response = myGPUdb.setInfo( setId );
												it(" tests setInfo by comparing set id", function () {
													expect( response.set_ids[0] ).toEqual(setId);
												});
												it(" tests setInfo by comparing the sematic type ", function () {
													expect( response.semantic_types[0] ).toEqual('POINT');
												});
												it(" tests setInfo by comparing the labels ", function () {
													expect( response.labels[0] ).toEqual('javascript');
												});
												it(" tests setInfo if it is sorted or not ", function () {
													expect( response.sorted[0] ).toEqual(false);
												});
												it(" tests setInfo checks set time to live--this the time the set will live after that it will be deleted ", function () {
													expect( response.ttls[0] ).toEqual(9999);
												});
											}); 
									describe(
											" status ",
											function () {
												var expectedValuesJson = {};
												var setId =  "preStatus" + guid(); //create Unique Id 
												preFilterCallsSetter( expectedValuesJson, setId);
												var response = myGPUdb.status( setId );
												it(" tests status by comparing set id", function () {
													expect( response.set_ids[0] ).toEqual(setId);
												});
												it(" tests status by checking if it is parent", function () {
													expect( response.is_parent[0] ).toEqual(false);
												});
												it(" tests status by comparing the labels ", function () {
													expect( response.labels[0] ).toEqual('javascript');
												});
												it(" tests status by comparing the sematic type ", function () {
													expect( response.semantic_types[0] ).toEqual('POINT');
												});
												it(" tests status by checking the set size ", function () {
													expect( response.sizes[0] ).toEqual(100);
												});
											});
									describe(
											" unique ",
											function () {
												var expectedValuesJson = {};
												var setId =  "preUnique" + guid(); //create Unique Id 
												expectedValuesJson = preFilterCallsSetter( expectedValuesJson, setId);
												it(" tests unique by getting all the unique values of x which should be 1,2,3,4,5,6,7,8,9,10   ", function () {
													var attribute = 'x';
													//in this case x is a number but assume we did not know that
													var response = myGPUdb.unique(setId, attribute, '');
													var responseValues = response[ 'values'].sort();
													expectedValuesJson['uniqueValuesOfXAttribute'] = [1,2,3,4,5,6,7,8,9,10];
													var differenceArray = [];
													responseValues.forEach( function( value, index){
														(-1 === expectedValuesJson[ 'uniqueValuesOfXAttribute'].indexOf( value)) ?  
																differenceArray.push( value): 
																	expectedValuesJson[ 'uniqueValuesOfXAttribute'].slice(expectedValuesJson[ 'uniqueValuesOfXAttribute'].indexOf( value),
																			expectedValuesJson[ 'uniqueValuesOfXAttribute'].indexOf( value) + 1);
													}, this);
													expectedValuesJson['uniqueValuesOfXAttribute'].forEach( function( value, index) {
														( -1 === responseValues.indexOf( value))?
																differenceArray.push( value):
																	responseValues.slice( responseValues.indexOf( value), responseValues.indexOf( value) + 1);
													}, this);
													expect( differenceArray.length).toEqual( 0 );
													expect( differenceArray).toEqual([]);
												});
											});
									describe(
											" clear",
											function () {
												it(" tests clear a set ", function () {
													var datasetSize;
													var expectedValuesJson = {};
													var setId =  "preCLEAR" + guid(); //create Unique Id 
													expectedValuesJson = preFilterCallsSetter( expectedValuesJson, setId);
													var response = myGPUdb.clear( setId);
													datasetSize = myGPUdb.status(setId).sizes;
													expect(datasetSize).toBeFalsy();
												});
											}); 		
								});

					});
		});

it("***********This is the end of the JAVASCRIPT API testing**************", function(){
	expect(true).toEqual(true);
});
