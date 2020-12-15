=== Documentation ===

Key files:
index.js - application entry point. Configures and starts the webserver as well as defines the get/post calls
dblib.js - contains postgres interface. Connects to database on start up and performs all db read/write operations
views - contains ejs views. import.ejs is an except in that it contains client side javascript
public -  contains css and most client side javascript