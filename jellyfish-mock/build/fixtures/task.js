"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    "id": "5ea68e0d-61c6-4cb6-be89-52db6045b586",
    "data": {
        "actor": "9ad5349e-4fd8-413f-84de-ae9287feca5c",
        "input": {
            "id": "64ab4e89-90ac-4de5-bdc2-462ba80290e7",
            "data": {
                "artifactReady": true
            },
            "name": null,
            "slug": "image-source-e127084d-b9fb-486a-8c18-d28c02eaa1cf",
            "tags": [],
            "type": "image-source@1.0.0",
            "links": {},
            "active": true,
            "markers": [],
            "version": "1.0.0",
            "requires": [],
            "linked_at": {
                "has attached element": "2021-01-04T15:24:23.963Z"
            },
            "created_at": "2020-12-22T15:49:58.263Z",
            "updated_at": "2021-01-04T15:24:23.780Z",
            "capabilities": []
        },
        "transformer": {
            "id": "fb3b504c-5f3c-462f-bff8-0c8cc26e2443",
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
            "name": "source-to-image create lambda",
            "slug": "source-to-image-create",
            "tags": [],
            "type": "transformer@1.0.0",
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
    "name": "Transform 64ab4e89-90ac-4de5-bdc2-462ba80290e7 using transformer fb3b504c-5f3c-462f-bff8-0c8cc26e2443",
    "slug": "task-transform-64ab4e89-90ac-4de5-bdc2-462ba80290e7-using-transformer-fb3b504c-5f3c-462f-bff8-0c8cc26e2443-2e3ca07e-ad71-413c-97bd-04e433eaa632",
    "tags": [],
    "type": "task@1.0.0",
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
};
//# sourceMappingURL=task.js.map