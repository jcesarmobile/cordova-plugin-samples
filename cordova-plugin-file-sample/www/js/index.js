/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
        window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (dirEntry) {
            console.log('file system open: ' + dirEntry.name);
            var isAppend = true;
            createFile(dirEntry, "downloadedImage.jpg", isAppend);
        }, onFSError);
        function onFSError(error) {
            alert(JSON.stringify(error));
        }
        function createFile(dirEntry, fileName, isAppend) {
            // Creates a new file or returns the file if it already exists.
            dirEntry.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {

                var xhr = new XMLHttpRequest();
                xhr.open('GET', 'https://static.vix.com/es/sites/default/files/styles/large/public/imj/3/30-cosas-de-los-gatos-que-no-sabias-3.jpg', true);
                xhr.responseType = 'blob';

                xhr.onload = function() {
                    if (this.status == 200) {
                        var blob = new Blob([this.response], { type: 'image/jpeg' });
                        writeFile(fileEntry, blob);
                    }
                };
                xhr.send();
            }, onFSError);
        }

        function writeFile(fileEntry, data) {
           // Create a FileWriter object for our FileEntry (log.txt).
           fileEntry.createWriter(function (fileWriter) {

                fileWriter.onerror = function(e) {
                    console.log("Failed file write: " + e.toString());
                };

                function writeFinish() {
                    function success(file) {
                        alert("Wrote file with size: " + file.size);
                    }
                    function fail(error) {
                        alert("Unable to retrieve file properties: " + error.code);
                    }
                    fileEntry.file(success, fail);
                }
                var written = 0;
                var BLOCK_SIZE = 1*1024*1024; // write 1M every time of write
                function writeNext(cbFinish) {
                    fileWriter.onwrite = function(evt) {
                        if (written < data.size)
                            writeNext(cbFinish);
                        else
                            cbFinish();
                    };
                    if (written) fileWriter.seek(fileWriter.length);
                    fileWriter.write(data.slice(written, written + Math.min(BLOCK_SIZE, data.size - written)));
                    written += Math.min(BLOCK_SIZE, data.size - written);
                }
                writeNext(writeFinish);
            });
        }
    }
};

app.initialize();