# bears-13

work-in-progress notes:

* The server is written in Node, with Express.
* The front-end was bootstrapped with Create-React-App.
* The server serves the C-R-A `/build` folder as its root route, while also
  handling data requests. (at the moment, that's just `/test-route`);
* To use the mongo test_run on the server, simply open a new instance of mongod; 
    the dbpath shouldn't matter. 
