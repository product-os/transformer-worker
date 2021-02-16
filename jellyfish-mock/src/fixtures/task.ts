export default {
  "id": "5ea68e0d-61c6-4cb6-be89-52db6045b586",
  "name": "Transform 64ab4e89-90ac-4de5-bdc2-462ba80290e7 using transformer fb3b504c-5f3c-462f-bff8-0c8cc26e2443",
  "slug": "task-transform-64ab4e89-90ac-4de5-bdc2-462ba80290e7-using-transformer-fb3b504c-5f3c-462f-bff8-0c8cc26e2443-2e3ca07e-ad71-413c-97bd-04e433eaa632",
  "type": "task@1.0.0",
  "data": {
    "actor": "9ad5349e-4fd8-413f-84de-ae9287feca5c",
    "input": {
      "id": "64ab4e89-90ac-4de5-bdc2-462ba80290e7",
      "name": null,
      "slug": "product-os.fake-input-020c1a70-6b26-4a8f-b50b-0888e72ef6c5",
      "type": "product-os.fake-input",
      "$transformer": {
        "data": {
          "artifactReady": true
        },
      },
      "tags": [],
      "links": {},
      "active": true,
      "markers": [],
      "version": "1.0.0",
      "requires": [],
      "linked_at": {
        "has attached element": "2021-01-04T15:24:23.963Z"
      },
      "created_at": "2020-12-22T15:49:58.263Z",
      "updated_at": "2021-01-04T15:24:33.780Z",
      "capabilities": []
    },
    "transformer": {
      "id": "fb3b504c-5f3c-462f-bff8-0c8cc26e2443",
      "name": "fake-in to fake-out",
      "slug": "identity-transformer-fb3b504c-5f3c-462f-bff8-0c8cc26e2443",
      "type": "transformer@1.0.0",
      "data": {
        "image": {
          "name": "image"
        },
        "trigger": {
          "after": {
            "type": "object",
            "properties": {
              "data": {
                "type": "object",
                "properties": {
                  "should_trigger": {
                    "type": "boolean",
                    "const": true
                  }
                }
              },
              "type": {
                "type": "string",
                "const": "image-source@1.0.0"
              }
            }
          },
          "before": {
            "type": "object",
            "properties": {
              "data": {
                "type": "object",
                "properties": {
                  "should_trigger": {
                    "type": "boolean",
                    "const": false
                  }
                }
              },
              "type": {
                "type": "string",
                "const": "image-source@1.0.0"
              }
            }
          }
        },
        "requirements": {
          "os": "linux",
          "architecture": "x86_64"
        },
        "workerFilter": {}
      },
      "tags": [],
      "links": {},
      "active": true,
      "markers": [],
      "version": "1.0.0",
      "requires": [],
      "linked_at": {
        "is owned by": "2020-12-22T15:32:08.884Z",
        "has attached element": "2020-12-22T15:59:25.982Z"
      },
      "created_at": "2020-12-17T14:55:14.184Z",
      "updated_at": "2020-12-22T15:59:25.817Z",
      "capabilities": []
    },
    "workerFilter": {
      "schema": {}
    }
  },
  "tags": [],
  "links": {},
  "active": true,
  "markers": [],
  "version": "1.0.0",
  "requires": [],
  "linked_at": {
    "is owned by": "2021-01-04T16:28:52.622Z",
    "has attached element": "2021-01-04T15:24:28.429Z"
  },
  "created_at": "2021-01-04T15:24:28.363Z",
  "updated_at": null,
  "capabilities": []
}
